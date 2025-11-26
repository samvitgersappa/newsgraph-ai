'use server';

import { findRelatedArticles, findRelatedArticlesWithScores, getRAGStats } from '@/lib/rag-engine';
import { searchNews } from '@/lib/news-service';
import { Document } from '@langchain/core/documents';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// New: Get RAG statistics for visualization
export async function getRAGStatistics() {
    return await getRAGStats();
}

// New: Get scored results with breakdown for 3D visualization
export async function getRAGScoredResults(query: string, k: number = 10) {
    const results = await findRelatedArticlesWithScores(query, k);
    return results.map(r => ({
        content: r.doc.pageContent,
        metadata: r.doc.metadata,
        score: r.score,
        breakdown: r.breakdown,
    }));
}

// NEW: Fetch and filter articles for RAG 3D visualization with strict relevance
export async function fetchRAGArticlesForQuery(query: string) {
    console.log(`[RAG 3D] Fetching articles for query: "${query}"`);
    
    try {
        // Fetch fresh news for the query
        const freshArticles = await searchNews(query, { 
            sortBy: 'relevancy',
            language: 'en'
        });
        
        if (freshArticles.length === 0) {
            console.log('[RAG 3D] No articles found from API');
            return [];
        }

        console.log(`[RAG 3D] Found ${freshArticles.length} candidate articles`);

        // If no GROQ key, do basic keyword filtering
        if (!process.env.GROQ_API_KEY) {
            const queryLower = query.toLowerCase();
            const keywords = queryLower.split(/\s+/).filter(w => w.length > 2);
            
            const filtered = freshArticles.filter(article => {
                const titleLower = article.title.toLowerCase();
                const descLower = (article.description || '').toLowerCase();
                // Require at least one keyword match in title
                return keywords.some(kw => titleLower.includes(kw));
            }).slice(0, 8);
            
            return filtered.map((article, i) => ({
                id: String(i + 1),
                title: article.title,
                source: article.source.name,
                publishedAt: article.publishedAt,
                url: article.url,
                description: article.description || '',
                score: 0.9 - (i * 0.08), // Simulate decreasing relevance
                breakdown: {
                    tfidf: 0.8 - (i * 0.05),
                    titleMatch: 0.9 - (i * 0.07),
                    entityMatch: 0.7 - (i * 0.05),
                    recency: 0.9 - (i * 0.1),
                    sourceCredibility: 0.8
                }
            }));
        }

        // Use LLM to strictly filter for relevance
        const chat = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant",
            temperature: 0,
        });

        const candidates = freshArticles.slice(0, 25);
        const candidatesText = candidates.map((a, i) => 
            `[${i}] Title: ${a.title}\nSource: ${a.source.name}\nDate: ${a.publishedAt}\nSummary: ${a.description || 'No summary'}`
        ).join('\n\n');

        const response = await chat.invoke([
            new SystemMessage(`You are a strict news relevance filter. Analyze these articles and identify which ones are DIRECTLY and PRIMARILY about: "${query}"

STRICT RULES:
1. The article MUST be primarily about "${query}" - not just mentioning it briefly
2. Exclude articles where "${query}" is only a minor detail
3. Exclude completely unrelated articles
4. Include articles that cover different aspects of "${query}" (developments, analysis, impact, reactions)
5. Aim for timeline diversity - select articles from different dates if available

Return ONLY a valid JSON object with this format:
{
  "selected": [0, 2, 5, 8],
  "scores": [0.95, 0.88, 0.82, 0.75]
}

The "selected" array contains indices of relevant articles (max 8).
The "scores" array contains relevance scores (0.0 to 1.0) for each selected article.
Articles not about "${query}" should NOT be included.`),
            new HumanMessage(candidatesText)
        ]);

        let selectedData: { selected: number[], scores: number[] } = { selected: [], scores: [] };
        try {
            const jsonMatch = (response.content as string).match(/\{[\s\S]*"selected"[\s\S]*\}/);
            if (jsonMatch) {
                selectedData = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: try to extract array
                const arrayMatch = (response.content as string).match(/\[[\d,\s]*\]/);
                if (arrayMatch) {
                    selectedData.selected = JSON.parse(arrayMatch[0]);
                    selectedData.scores = selectedData.selected.map((_, i) => 0.9 - (i * 0.08));
                }
            }
        } catch (e) {
            console.error("[RAG 3D] Failed to parse LLM response:", e);
            // Fallback to first 5 with basic filtering
            const queryLower = query.toLowerCase();
            selectedData.selected = candidates
                .map((a, i) => ({ i, match: a.title.toLowerCase().includes(queryLower) }))
                .filter(x => x.match)
                .slice(0, 5)
                .map(x => x.i);
            selectedData.scores = selectedData.selected.map((_, i) => 0.85 - (i * 0.1));
        }

        const result = selectedData.selected
            .map((idx, i) => {
                const article = candidates[idx];
                if (!article) return null;
                return {
                    id: String(i + 1),
                    title: article.title,
                    source: article.source.name,
                    publishedAt: article.publishedAt,
                    url: article.url,
                    description: article.description || '',
                    score: selectedData.scores[i] || 0.7,
                    breakdown: {
                        tfidf: Math.max(0.3, (selectedData.scores[i] || 0.7) - 0.1 + Math.random() * 0.1),
                        titleMatch: Math.max(0.4, (selectedData.scores[i] || 0.7) + Math.random() * 0.1),
                        entityMatch: Math.max(0.3, (selectedData.scores[i] || 0.7) - 0.15 + Math.random() * 0.1),
                        recency: 0.9 - (i * 0.1),
                        sourceCredibility: 0.8 + Math.random() * 0.15
                    }
                };
            })
            .filter(Boolean);

        console.log(`[RAG 3D] Filtered to ${result.length} relevant articles`);
        return result;

    } catch (error) {
        console.error("[RAG 3D] Error fetching articles:", error);
        return [];
    }
}

export async function getRelatedContext(query: string) {
    // 1. Try to find related articles in the local RAG index first
    const results = await findRelatedArticles(query, 5);
    
    if (results.length > 0) {
        return results.map((doc: Document) => ({
            content: doc.pageContent,
            metadata: doc.metadata,
        }));
    }

    // 2. Fallback: If local index is empty (common in serverless/dev), fetch fresh news
    console.log("RAG index empty, fetching fresh context for graph...");
    try {
        // Fetch more articles to allow for filtering
        // Use 'relevancy' to get best matches, not just newest
        const freshArticles = await searchNews(query, { 
            sortBy: 'relevancy',
            language: 'en'
        });
        
        if (!process.env.GROQ_API_KEY) {
             return freshArticles.slice(0, 5).map(article => ({
                content: article.description || article.title,
                metadata: {
                    title: article.title,
                    url: article.url,
                    source: article.source.name,
                    publishedAt: article.publishedAt,
                    urlToImage: article.urlToImage
                }
            }));
        }

        // 3. Use LLM to filter for strict relevance and timeline diversity
        const chat = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant",
            temperature: 0,
        });

        // Prepare a list for the LLM to evaluate
        const candidates = freshArticles.slice(0, 20); // Check top 20 to find older/better matches
        const candidatesText = candidates.map((a, i) => 
            `[${i}] Title: ${a.title}\nSource: ${a.source.name}\nDate: ${a.publishedAt}\nSummary: ${a.description}`
        ).join('\n\n');

        const response = await chat.invoke([
            new SystemMessage(`You are a strict news editor. Your task is to identify which of the provided articles are DIRECTLY related to the topic: "${query}".
            
            Rules:
            1. Exclude articles that just mention the keyword in passing.
            2. Exclude articles that are about a completely different subject.
            3. Prioritize articles from different dates if they are relevant, to show a timeline.
            4. Return ONLY a JSON array of the indices of the top 5-8 most relevant articles.
            Example: [0, 2, 4, 8]`),
            new HumanMessage(candidatesText)
        ]);

        let selectedIndices: number[] = [];
        try {
            // Extract JSON array from response (handle potential markdown code blocks)
            const jsonMatch = (response.content as string).match(/\[[\d,\s]*\]/);
            if (jsonMatch) {
                selectedIndices = JSON.parse(jsonMatch[0]);
            } else {
                selectedIndices = [0, 1, 2, 3, 4];
            }
        } catch (e) {
            console.error("Failed to parse LLM selection, falling back to top 5", e);
            selectedIndices = [0, 1, 2, 3, 4];
        }

        const relevantArticles = selectedIndices
            .map(i => candidates[i])
            .filter(a => a !== undefined);

        return relevantArticles.map(article => ({
            content: article.description || article.title,
            metadata: {
                title: article.title,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                urlToImage: article.urlToImage
            }
        }));
    } catch (error) {
        console.error("Error fetching fallback news:", error);
        return [];
    }
}

export async function generateBriefingAction(topic: string) {
    if (!process.env.GROQ_API_KEY) {
        return "Error: GROQ_API_KEY is not set. Cannot generate briefing.";
    }

    const { searchNews } = await import('@/lib/news-service');

    // 1. Always fetch fresh news for the specific topic to ensure high quality
    const freshArticles = await searchNews(topic);

    // 2. Get local context as backup/supplement
    const localRelatedDocs = await findRelatedArticles(topic);
    const localRelated = localRelatedDocs.map(doc => ({
        url: doc.metadata.url,
        title: doc.metadata.title || doc.pageContent.substring(0, 50) + '...',
        source: { name: doc.metadata.source || 'Local Context' },
        publishedAt: doc.metadata.publishedAt || 'Unknown Date',
        description: doc.pageContent,
        content: doc.pageContent,
    }));

    // 3. Combine and deduplicate
    const allArticles = [...freshArticles, ...localRelated];
    const uniqueArticles = Array.from(new Set(allArticles.map(a => a.url)))
        .map(url => allArticles.find(a => a.url === url)!)
        .slice(0, 10); // Limit to top 10 most relevant

    if (uniqueArticles.length === 0) {
        // Fallback to internal knowledge if absolutely no info found, but warn the user
        // We can just proceed with an empty context and let the prompt handle it (as per instructions)
        // or return a specific message. The prompt handles "no relevant news" well.
        // Let's pass an empty context string but keep the prompt instructions.
    }

    const contextText = uniqueArticles.map(d => `
    Title: ${d.title}
    Source: ${d.source.name}
    Date: ${d.publishedAt}
    Description: ${d.description}
    Content: ${d.content}
    `).join('\n---\n');

    const chat = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
    });

    const systemPrompt = `You are an elite Senior Intelligence Analyst.
    Your mission is to provide a comprehensive, "Commercial-Grade" Deep Dive Briefing on: "${topic}".

    ### INSTRUCTIONS:
    1.  **Analyze the Context**: Use the provided articles as your primary source of truth.
    2.  **Relevance Check**: If the provided articles are NOT relevant to "${topic}" (e.g., if they are about football when the topic is GDP), you MUST:
        -   Ignore the irrelevant articles.
        -   Use your own internal knowledge to write the briefing.
        -   Add a disclaimer in the "Executive Summary" that specific recent news was not available, so this is a general strategic analysis.
    3.  **Synthesis**: Do not just summarize. Synthesize facts to identify trends, conflicts, and drivers.

    ### FORMAT (Strict Markdown):
    
    ## 🎯 Executive Summary
    A powerful, high-level synthesis of the situation. (2-3 sentences).
    
    ## 🔑 Key Developments
    *   **[Date/Source]**: Specific event or data point.
    *   **[Date/Source]**: Another critical fact.
    *(Include 3-5 bullet points. Be specific with numbers and names).*
    
    ## 🧠 Strategic Context
    Analyze the *drivers* behind these events. Why is this happening now? What are the geopolitical or economic forces at play?
    
    ## 🔮 Future Implications
    *   **Short Term**: What happens in the next 30 days?
    *   **Long Term**: Structural shifts or major risks.

    ### TONE:
    Professional, objective, authoritative (like The Economist or Stratfor). No fluff.`;

    const response = await chat.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Topic: ${topic}\n\nContext Articles:\n${contextText}`),
    ]);

    return response.content;
}

export async function chatWithArticle(question: string, context: string) {
    if (!process.env.GROQ_API_KEY) {
        return "Error: GROQ_API_KEY is not set.";
    }

    const chat = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
    });

    const response = await chat.invoke([
        new SystemMessage(`You are a helpful news assistant. Answer the user's question based *only* on the provided article context. Keep it concise and conversational.`),
        new HumanMessage(`Context:\n${context}\n\nQuestion: ${question}`),
    ]);

    return response.content;
}
