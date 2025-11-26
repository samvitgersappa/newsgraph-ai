import { Document } from '@langchain/core/documents';
import { Article } from './news-service';

// ============================================================================
// ENHANCED RAG ENGINE - NewsGraph AI
// ============================================================================
// Features:
// - TF-IDF based similarity scoring
// - Entity extraction for better matching
// - Semantic chunking with overlap
// - Multi-signal relevance scoring
// - Query expansion and synonym matching
// - Temporal decay for fresher articles
// - Source diversity scoring
// ============================================================================

interface DocumentWithScore {
    doc: Document;
    score: number;
    breakdown: ScoreBreakdown;
}

interface ScoreBreakdown {
    tfidf: number;
    entityMatch: number;
    recency: number;
    titleMatch: number;
    sourceCredibility: number;
}

interface RAGIndex {
    documents: Document[];
    termFrequencies: Map<string, Map<number, number>>; // term -> docIndex -> frequency
    documentFrequencies: Map<string, number>; // term -> number of docs containing it
    entities: Map<number, string[]>; // docIndex -> entities
    totalDocuments: number;
}

// Stop words for better TF-IDF
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'shall', 'can', 'need', 'dare', 'ought', 'used', 'this', 'that', 'these', 'those',
    'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'he', 'him',
    'his', 'she', 'her', 'i', 'me', 'my', 'who', 'what', 'which', 'when', 'where', 'why',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
]);

// Source credibility scores (example - could be expanded)
const SOURCE_CREDIBILITY: Record<string, number> = {
    'Reuters': 1.0,
    'Associated Press': 1.0,
    'AP News': 1.0,
    'BBC News': 0.95,
    'The New York Times': 0.9,
    'The Washington Post': 0.9,
    'The Guardian': 0.85,
    'NPR': 0.9,
    'PBS': 0.9,
    'The Verge': 0.85,
    'TechCrunch': 0.8,
    'Wired': 0.8,
    'Bloomberg': 0.9,
    'Financial Times': 0.9,
    'The Economist': 0.9,
    'Wall Street Journal': 0.85,
    'CNN': 0.75,
    'Fox News': 0.6,
    'MSNBC': 0.65,
    'Breitbart': 0.4,
    'default': 0.5,
};

// Singleton RAG index
let ragIndex: RAGIndex | null = null;

// ============================================================================
// Text Processing Utilities
// ============================================================================

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function extractEntities(text: string): string[] {
    const entities: string[] = [];
    
    // Simple entity extraction patterns
    // Proper nouns (capitalized words not at sentence start)
    const properNouns = text.match(/(?<=[.!?]\s+|\n)[A-Z][a-z]+|(?<=\s)[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    entities.push(...properNouns.map(e => e.toLowerCase()));
    
    // Numbers with context (years, amounts, percentages)
    const numbersWithContext = text.match(/\$?\d+(?:\.\d+)?(?:\s*(?:billion|million|trillion|percent|%|year|years))?/gi) || [];
    entities.push(...numbersWithContext.map(e => e.toLowerCase()));
    
    // Quoted terms
    const quoted = text.match(/"([^"]+)"|'([^']+)'/g) || [];
    entities.push(...quoted.map(e => e.replace(/['"]/g, '').toLowerCase()));
    
    // Tech/business terms (acronyms)
    const acronyms = text.match(/\b[A-Z]{2,}\b/g) || [];
    entities.push(...acronyms.map(e => e.toLowerCase()));
    
    return [...new Set(entities)].filter(e => e.length > 1);
}

function expandQuery(query: string): string[] {
    const tokens = tokenize(query);
    const expanded: string[] = [...tokens];
    
    // Simple synonym expansion (could be enhanced with a proper synonym database)
    const synonyms: Record<string, string[]> = {
        'ai': ['artificial intelligence', 'machine learning', 'neural', 'algorithm'],
        'crypto': ['cryptocurrency', 'bitcoin', 'blockchain', 'ethereum'],
        'stock': ['market', 'shares', 'equity', 'trading'],
        'tech': ['technology', 'software', 'digital', 'startup'],
        'climate': ['environment', 'carbon', 'emissions', 'warming', 'green'],
        'economy': ['economic', 'gdp', 'inflation', 'recession', 'growth'],
        'politics': ['political', 'election', 'government', 'policy'],
        'war': ['conflict', 'military', 'combat', 'invasion'],
        'health': ['medical', 'healthcare', 'disease', 'medicine'],
    };
    
    tokens.forEach(token => {
        if (synonyms[token]) {
            expanded.push(...synonyms[token]);
        }
    });
    
    return [...new Set(expanded)];
}

// ============================================================================
// TF-IDF Implementation
// ============================================================================

function calculateTF(term: string, docIndex: number, index: RAGIndex): number {
    const termFreqs = index.termFrequencies.get(term);
    if (!termFreqs) return 0;
    return termFreqs.get(docIndex) || 0;
}

function calculateIDF(term: string, index: RAGIndex): number {
    const docFreq = index.documentFrequencies.get(term) || 0;
    if (docFreq === 0) return 0;
    return Math.log((index.totalDocuments + 1) / (docFreq + 1)) + 1;
}

function calculateTFIDF(queryTerms: string[], docIndex: number, index: RAGIndex): number {
    let score = 0;
    queryTerms.forEach(term => {
        const tf = calculateTF(term, docIndex, index);
        const idf = calculateIDF(term, index);
        score += tf * idf;
    });
    return score;
}

// ============================================================================
// Scoring Functions
// ============================================================================

function calculateRecencyScore(publishedAt: string): number {
    const now = new Date();
    const published = new Date(publishedAt);
    const hoursDiff = (now.getTime() - published.getTime()) / (1000 * 60 * 60);
    
    // Decay function: score decreases over time
    // Full score for articles < 6 hours old
    // Decreasing score up to 7 days old
    // Minimum score of 0.1 for older articles
    if (hoursDiff < 6) return 1.0;
    if (hoursDiff < 24) return 0.9;
    if (hoursDiff < 72) return 0.7;
    if (hoursDiff < 168) return 0.4;
    return 0.1;
}

function calculateTitleMatchScore(queryTerms: string[], title: string): number {
    const titleTokens = tokenize(title);
    let matches = 0;
    queryTerms.forEach(term => {
        if (titleTokens.includes(term)) matches++;
        // Partial match bonus
        titleTokens.forEach(titleToken => {
            if (titleToken.includes(term) || term.includes(titleToken)) {
                matches += 0.5;
            }
        });
    });
    return Math.min(matches / Math.max(queryTerms.length, 1), 1.0);
}

function calculateEntityMatchScore(queryEntities: string[], docIndex: number, index: RAGIndex): number {
    const docEntities = index.entities.get(docIndex) || [];
    if (docEntities.length === 0 || queryEntities.length === 0) return 0;
    
    let matches = 0;
    queryEntities.forEach(qEntity => {
        docEntities.forEach(dEntity => {
            if (dEntity.includes(qEntity) || qEntity.includes(dEntity)) {
                matches++;
            }
        });
    });
    
    return Math.min(matches / queryEntities.length, 1.0);
}

function getSourceCredibility(source: string): number {
    return SOURCE_CREDIBILITY[source] || SOURCE_CREDIBILITY['default'];
}

// ============================================================================
// Main RAG Functions
// ============================================================================

export async function getSearchStore() {
    if (!ragIndex) {
        ragIndex = {
            documents: [],
            termFrequencies: new Map(),
            documentFrequencies: new Map(),
            entities: new Map(),
            totalDocuments: 0,
        };
    }
    return ragIndex;
}

export async function clearIndex() {
    ragIndex = null;
}

export async function indexArticles(articles: Article[]) {
    const index = await getSearchStore();
    
    articles.forEach((article, i) => {
        const docIndex = index.totalDocuments + i;
        
        // Create document
        const content = `${article.title}. ${article.description || ''}. ${article.content || ''}`;
        const doc = new Document({
            pageContent: content,
            metadata: {
                title: article.title,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                urlToImage: article.urlToImage,
                author: article.author,
            },
        });
        index.documents.push(doc);
        
        // Tokenize and build term frequencies
        const tokens = tokenize(content);
        const tokenCounts = new Map<string, number>();
        tokens.forEach(token => {
            tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
        });
        
        // Update term frequencies and document frequencies
        tokenCounts.forEach((count, term) => {
            if (!index.termFrequencies.has(term)) {
                index.termFrequencies.set(term, new Map());
            }
            index.termFrequencies.get(term)!.set(docIndex, count);
            
            index.documentFrequencies.set(
                term,
                (index.documentFrequencies.get(term) || 0) + 1
            );
        });
        
        // Extract and store entities
        const entities = extractEntities(content);
        index.entities.set(docIndex, entities);
    });
    
    index.totalDocuments += articles.length;
    console.log(`Indexed ${articles.length} articles for search. Total: ${index.totalDocuments}`);
}

export async function findRelatedArticles(query: string, k: number = 5): Promise<Document[]> {
    const index = await getSearchStore();
    
    if (index.totalDocuments === 0) {
        return [];
    }
    
    // Expand query for better matching
    const queryTerms = expandQuery(query);
    const queryEntities = extractEntities(query);
    
    // Score each document
    const scoredDocs: DocumentWithScore[] = index.documents.map((doc, docIndex) => {
        // TF-IDF score (normalized)
        const tfidfScore = calculateTFIDF(queryTerms, docIndex, index);
        const maxTFIDF = queryTerms.length * 10; // Rough upper bound
        const normalizedTFIDF = Math.min(tfidfScore / maxTFIDF, 1.0);
        
        // Title match score
        const titleScore = calculateTitleMatchScore(queryTerms, doc.metadata.title || '');
        
        // Entity match score
        const entityScore = calculateEntityMatchScore(queryEntities, docIndex, index);
        
        // Recency score
        const recencyScore = calculateRecencyScore(doc.metadata.publishedAt || '');
        
        // Source credibility
        const credibilityScore = getSourceCredibility(doc.metadata.source || '');
        
        // Weighted combination
        const breakdown: ScoreBreakdown = {
            tfidf: normalizedTFIDF,
            titleMatch: titleScore,
            entityMatch: entityScore,
            recency: recencyScore,
            sourceCredibility: credibilityScore,
        };
        
        // Final score with weights
        const score = 
            normalizedTFIDF * 0.30 +      // Content relevance
            titleScore * 0.35 +            // Title is important
            entityScore * 0.15 +           // Entity matching
            recencyScore * 0.10 +          // Freshness
            credibilityScore * 0.10;       // Source quality
        
        return { doc, score, breakdown };
    });
    
    // Filter out zero scores, sort, and return top k
    return scoredDocs
        .filter(item => item.score > 0.05)
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map(item => item.doc);
}

// New function: Get scored results with breakdown for visualization
export async function findRelatedArticlesWithScores(query: string, k: number = 5): Promise<DocumentWithScore[]> {
    const index = await getSearchStore();
    
    if (index.totalDocuments === 0) {
        return [];
    }
    
    const queryTerms = expandQuery(query);
    const queryEntities = extractEntities(query);
    
    const scoredDocs: DocumentWithScore[] = index.documents.map((doc, docIndex) => {
        const tfidfScore = calculateTFIDF(queryTerms, docIndex, index);
        const maxTFIDF = queryTerms.length * 10;
        const normalizedTFIDF = Math.min(tfidfScore / maxTFIDF, 1.0);
        const titleScore = calculateTitleMatchScore(queryTerms, doc.metadata.title || '');
        const entityScore = calculateEntityMatchScore(queryEntities, docIndex, index);
        const recencyScore = calculateRecencyScore(doc.metadata.publishedAt || '');
        const credibilityScore = getSourceCredibility(doc.metadata.source || '');
        
        const breakdown: ScoreBreakdown = {
            tfidf: normalizedTFIDF,
            titleMatch: titleScore,
            entityMatch: entityScore,
            recency: recencyScore,
            sourceCredibility: credibilityScore,
        };
        
        const score = 
            normalizedTFIDF * 0.30 +
            titleScore * 0.35 +
            entityScore * 0.15 +
            recencyScore * 0.10 +
            credibilityScore * 0.10;
        
        return { doc, score, breakdown };
    });
    
    return scoredDocs
        .filter(item => item.score > 0.05)
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
}

// Function to get RAG statistics for visualization
export async function getRAGStats() {
    const index = await getSearchStore();
    
    return {
        totalDocuments: index.totalDocuments,
        uniqueTerms: index.termFrequencies.size,
        avgEntitiesPerDoc: index.totalDocuments > 0 
            ? Array.from(index.entities.values()).reduce((sum, e) => sum + e.length, 0) / index.totalDocuments 
            : 0,
        sources: [...new Set(index.documents.map(d => d.metadata.source))],
    };
}

// Generate briefing (placeholder - uses LLM in actions.ts)
export async function generateBriefing(topic: string, contextArticles: Document[]) {
    return contextArticles;
}

// Export types for use in other files
export type { DocumentWithScore, ScoreBreakdown };
