'use server';

import { findRelatedArticles, findRelatedArticlesWithScores, getRAGStats, indexArticles } from '@/lib/rag-engine';
import { searchNews, Article } from '@/lib/news-service';
import { enhancedSearch, EnhancedSearchResult } from '@/lib/enhanced-news-service';
import { Document } from '@langchain/core/documents';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// ============================================================================
// ENHANCED RAG SCORING - Multi-Signal Relevance
// ============================================================================

// Stop words for filtering
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'was', 'are', 'were', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'this', 'that', 'it', 'they', 'we', 'you',
    'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'can', 'now', 'new', 'says', 'said', 'also', 'get', 'like'
]);

// Source credibility scores
const SOURCE_CREDIBILITY: Record<string, number> = {
    'Reuters': 1.0, 'Associated Press': 1.0, 'AP News': 1.0, 'BBC News': 0.95,
    'The New York Times': 0.9, 'The Washington Post': 0.9, 'The Guardian': 0.85,
    'NPR': 0.9, 'PBS': 0.9, 'The Verge': 0.85, 'TechCrunch': 0.8, 'Wired': 0.8,
    'Bloomberg': 0.9, 'Financial Times': 0.9, 'The Economist': 0.9,
    'Wall Street Journal': 0.85, 'CNN': 0.75, 'CNBC': 0.8, 'Axios': 0.85,
    'Politico': 0.8, 'The Hill': 0.75, 'default': 0.5,
};

function tokenize(text: string): string[] {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function extractKeyTerms(query: string): { terms: string[]; phrases: string[]; entities: string[] } {
    const terms = tokenize(query);
    
    // Extract multi-word phrases (keep them together for matching)
    const phrases: string[] = [];
    const words = query.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
        const phrase = words.slice(i, i + 2).join(' ');
        if (!STOP_WORDS.has(words[i]) || !STOP_WORDS.has(words[i + 1])) {
            phrases.push(phrase);
        }
    }
    
    // Extract potential entities (capitalized words, acronyms)
    const entities = query.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b|\b[A-Z]{2,}\b/g) || [];
    
    return { terms, phrases, entities: entities.map(e => e.toLowerCase()) };
}

function calculateRelevanceScore(article: Article, query: string): {
    score: number;
    breakdown: {
        titleMatch: number;
        contentMatch: number;
        phraseMatch: number;
        recency: number;
        sourceCredibility: number;
    };
    isRelevant: boolean;
} {
    const { terms, phrases, entities } = extractKeyTerms(query);
    const titleLower = (article.title || '').toLowerCase();
    const descLower = (article.description || '').toLowerCase();
    const contentLower = (article.content || '').toLowerCase();
    const fullText = `${titleLower} ${descLower} ${contentLower}`;
    
    // 1. Title Match (most important) - check for term presence
    let titleMatchCount = 0;
    terms.forEach(term => {
        if (titleLower.includes(term)) titleMatchCount++;
    });
    // Bonus for phrase matches in title
    phrases.forEach(phrase => {
        if (titleLower.includes(phrase)) titleMatchCount += 2;
    });
    // Bonus for entity matches
    entities.forEach(entity => {
        if (titleLower.includes(entity)) titleMatchCount += 1.5;
    });
    const titleMatch = Math.min(titleMatchCount / Math.max(terms.length, 1), 1.0);
    
    // 2. Content Match (description + content)
    let contentMatchCount = 0;
    terms.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = fullText.match(regex);
        if (matches) contentMatchCount += Math.min(matches.length, 3); // Cap at 3 per term
    });
    const contentMatch = Math.min(contentMatchCount / (terms.length * 2), 1.0);
    
    // 3. Phrase Match (exact phrases are very relevant)
    let phraseMatchCount = 0;
    phrases.forEach(phrase => {
        if (fullText.includes(phrase)) phraseMatchCount++;
    });
    const phraseMatch = phrases.length > 0 ? Math.min(phraseMatchCount / phrases.length, 1.0) : 0.5;
    
    // 4. Recency Score
    const now = new Date();
    const published = new Date(article.publishedAt);
    const daysDiff = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
    let recency = 1.0;
    if (daysDiff > 365 * 10) recency = 0.3; // Historical context
    else if (daysDiff > 365 * 5) recency = 0.4;
    else if (daysDiff > 365) recency = 0.5;
    else if (daysDiff > 30) recency = 0.7;
    else if (daysDiff > 7) recency = 0.85;
    else if (daysDiff > 1) recency = 0.95;
    
    // 5. Source Credibility
    const sourceCredibility = SOURCE_CREDIBILITY[article.source?.name] || SOURCE_CREDIBILITY['default'];
    
    // Weighted final score
    const score = (
        titleMatch * 0.40 +        // Title is most important
        contentMatch * 0.25 +      // Content matters
        phraseMatch * 0.15 +       // Phrase matching is strong signal
        recency * 0.10 +           // Recent articles slightly preferred
        sourceCredibility * 0.10   // Source quality matters
    );
    
    // Determine if truly relevant (must have meaningful title or content match)
    const isRelevant = titleMatch >= 0.3 || (contentMatch >= 0.4 && phraseMatch >= 0.3);
    
    return {
        score,
        breakdown: {
            titleMatch,
            contentMatch,
            phraseMatch,
            recency,
            sourceCredibility
        },
        isRelevant
    };
}

// ============================================================================
// MAIN RAG FUNCTIONS
// ============================================================================

// Get RAG statistics
export async function getRAGStatistics() {
    return await getRAGStats();
}

// Enhanced: Get scored results with breakdown - uses enhanced search
export async function getRAGScoredResults(query: string, k: number = 10) {
    console.log(`[RAG Insights] Searching for: "${query}"`);
    
    // Fetch using enhanced search (multiple sources)
    const searchResult = await enhancedSearch(query, {
        includeHistorical: true,
        historicalYears: [1, 3, 5],
        maxArticles: 50
    });
    
    if (searchResult.currentArticles.length === 0 && searchResult.historicalContext.length === 0) {
        console.log('[RAG Insights] No articles found');
        return [];
    }
    
    // Score all current articles
    const scoredArticles = searchResult.currentArticles
        .map(article => {
            const { score, breakdown, isRelevant } = calculateRelevanceScore(article, query);
            return { article, score, breakdown, isRelevant };
        })
        .filter(item => item.isRelevant) // Only keep relevant articles
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
    
    console.log(`[RAG Insights] Found ${scoredArticles.length} relevant articles`);
    
    // Add historical context articles
    const historicalArticles = searchResult.historicalContext
        .flatMap(ctx => ctx.articles.map(article => ({
            article,
            score: calculateRelevanceScore(article, query).score * 0.85, // Slight discount for historical
            breakdown: calculateRelevanceScore(article, query).breakdown,
            isHistorical: true,
            timeframe: ctx.timeframe
        })));
    
    // Combine and format results
    const allResults = [
        ...scoredArticles.map(item => ({
            content: item.article.description || item.article.title,
            metadata: {
                title: item.article.title,
                source: item.article.source?.name || 'Unknown',
                url: item.article.url,
                publishedAt: item.article.publishedAt,
            },
            score: item.score,
            breakdown: item.breakdown,
        })),
        ...historicalArticles.slice(0, 3).map(item => ({
            content: item.article.description || item.article.title,
            metadata: {
                title: `📅 ${item.timeframe}: ${item.article.title}`,
                source: item.article.source?.name || 'Historical Context',
                url: item.article.url,
                publishedAt: item.article.publishedAt,
                isHistorical: true,
            },
            score: item.score,
            breakdown: item.breakdown,
        }))
    ];
    
    return allResults.slice(0, k);
}

// Enhanced: Fetch articles for RAG 3D visualization with STRICT relevance
export async function fetchRAGArticlesForQuery(query: string) {
    console.log(`[RAG 3D] Fetching articles for query: "${query}"`);
    
    try {
        // Use enhanced search with multiple sources
        const searchResult = await enhancedSearch(query, {
            includeHistorical: true,
            historicalYears: [1, 3, 5, 10],
            maxArticles: 50
        });
        
        const allArticles = [
            ...searchResult.currentArticles,
            ...searchResult.historicalContext.flatMap(h => h.articles)
        ];
        
        if (allArticles.length === 0) {
            console.log('[RAG 3D] No articles found');
            return [];
        }

        console.log(`[RAG 3D] Found ${allArticles.length} candidate articles`);

        // Score all articles using our enhanced relevance scoring
        const scoredArticles = allArticles
            .map(article => {
                const { score, breakdown, isRelevant } = calculateRelevanceScore(article, query);
                return { article, score, breakdown, isRelevant };
            })
            .filter(item => item.isRelevant) // Only keep relevant articles
            .sort((a, b) => b.score - a.score);

        // If we have GROQ key, use LLM for additional filtering on top candidates
        if (process.env.GROQ_API_KEY && scoredArticles.length > 5) {
            try {
                const chat = new ChatGroq({
                    apiKey: process.env.GROQ_API_KEY,
                    model: "llama-3.1-8b-instant",
                    temperature: 0,
                });

                const candidates = scoredArticles.slice(0, 15);
                const candidatesText = candidates.map((item, i) => 
                    `[${i}] Score: ${(item.score * 100).toFixed(0)}% | Title: ${item.article.title}\nSource: ${item.article.source?.name || 'Unknown'}\nDate: ${item.article.publishedAt}\nSummary: ${item.article.description || 'No summary'}`
                ).join('\n\n');

                const response = await chat.invoke([
                    new SystemMessage(`You are a strict news relevance validator. The user searched for: "${query}"

These articles have been pre-scored for relevance. Your job is to VALIDATE and REFINE the selection.

STRICT VALIDATION RULES:
1. KEEP articles that are PRIMARILY about "${query}" 
2. REMOVE articles where "${query}" is only mentioned in passing
3. REMOVE articles that are actually about a different topic
4. PREFER articles with diverse perspectives (different sources, dates, angles)
5. Historical context articles (older dates) ARE valuable if truly relevant

Return ONLY a JSON object:
{
  "keep": [0, 1, 3, 5, 7],
  "reason": "Brief explanation of why these are most relevant"
}

Select the 8-10 MOST relevant articles. Be strict - quality over quantity.`),
                    new HumanMessage(candidatesText)
                ]);

                const jsonMatch = (response.content as string).match(/\{[\s\S]*"keep"[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    const keepIndices = new Set(parsed.keep as number[]);
                    
                    const validated = candidates
                        .filter((_, i) => keepIndices.has(i))
                        .map((item, i) => ({
                            id: String(i + 1),
                            title: item.article.title,
                            source: item.article.source?.name || 'Unknown',
                            publishedAt: item.article.publishedAt,
                            url: item.article.url,
                            description: item.article.description || '',
                            score: item.score,
                            breakdown: {
                                titleMatch: item.breakdown.titleMatch,
                                contentMatch: item.breakdown.contentMatch,
                                phraseMatch: item.breakdown.phraseMatch,
                                recency: item.breakdown.recency,
                                sourceCredibility: item.breakdown.sourceCredibility
                            }
                        }));
                    
                    console.log(`[RAG 3D] LLM validated ${validated.length} articles`);
                    return validated;
                }
            } catch (llmError) {
                console.error('[RAG 3D] LLM validation failed, using scored results:', llmError);
            }
        }

        // Fallback: return top scored articles
        const result = scoredArticles.slice(0, 10).map((item, i) => ({
            id: String(i + 1),
            title: item.article.title,
            source: item.article.source?.name || 'Unknown',
            publishedAt: item.article.publishedAt,
            url: item.article.url,
            description: item.article.description || '',
            score: item.score,
            breakdown: {
                titleMatch: item.breakdown.titleMatch,
                contentMatch: item.breakdown.contentMatch,
                phraseMatch: item.breakdown.phraseMatch,
                recency: item.breakdown.recency,
                sourceCredibility: item.breakdown.sourceCredibility
            }
        }));

        console.log(`[RAG 3D] Returning ${result.length} scored articles`);
        return result;

    } catch (error) {
        console.error("[RAG 3D] Error fetching articles:", error);
        return [];
    }
}

export async function getRelatedContext(query: string) {
    console.log(`[Related Context] Fetching context for: "${query}"`);
    
    try {
        // Use enhanced search for better results with historical context
        const searchResult = await enhancedSearch(query, {
            includeHistorical: true,
            historicalYears: [1, 3, 5],
            maxArticles: 30
        });
        
        // Score and filter current articles
        const scoredCurrent = searchResult.currentArticles
            .map(article => {
                const { score, isRelevant } = calculateRelevanceScore(article, query);
                return { article, score, isRelevant };
            })
            .filter(item => item.isRelevant)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        // Format results
        const results = scoredCurrent.map(item => ({
            content: item.article.description || item.article.title,
            metadata: {
                title: item.article.title,
                url: item.article.url,
                source: item.article.source?.name || 'Unknown',
                publishedAt: item.article.publishedAt,
                urlToImage: item.article.urlToImage
            }
        }));
        
        // Add historical context if available
        if (searchResult.historicalContext.length > 0) {
            searchResult.historicalContext.forEach(ctx => {
                ctx.articles.slice(0, 2).forEach(article => {
                    results.push({
                        content: `[${ctx.timeframe}] ${article.description || article.title}`,
                        metadata: {
                            title: `📅 ${ctx.timeframe}: ${article.title}`,
                            url: article.url,
                            source: article.source?.name || 'Historical',
                            publishedAt: article.publishedAt,
                            urlToImage: article.urlToImage,
                            isHistorical: true
                        }
                    });
                });
            });
        }
        
        // Add Wikipedia context if available
        if (searchResult.wikipediaContext) {
            results.push({
                content: searchResult.wikipediaContext,
                metadata: {
                    title: `📚 Background: ${query}`,
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, '_'))}`,
                    source: 'Wikipedia',
                    publishedAt: new Date().toISOString(),
                    isWikipedia: true
                }
            });
        }
        
        console.log(`[Related Context] Returning ${results.length} context items`);
        return results;
        
    } catch (error) {
        console.error("[Related Context] Error:", error);
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
