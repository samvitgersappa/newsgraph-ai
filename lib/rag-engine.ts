import { Document } from '@langchain/core/documents';
import { Article } from './news-service';

// Simple in-memory store for articles (replacing vector store to remove OpenAI dependency)
class SimpleSearchStore {
    private documents: Document[] = [];

    async addDocuments(docs: Document[]) {
        this.documents.push(...docs);
    }

    async search(query: string, k: number = 3): Promise<Document[]> {
        const lowerQuery = query.toLowerCase();

        // Simple keyword matching score
        const scoredDocs = this.documents.map(doc => {
            const content = doc.pageContent.toLowerCase();
            const title = doc.metadata.title?.toLowerCase() || '';

            let score = 0;
            if (content.includes(lowerQuery)) score += 1;
            if (title.includes(lowerQuery)) score += 2;

            // Bonus for partial matches of words
            const words = lowerQuery.split(' ');
            words.forEach(word => {
                if (word.length > 3 && content.includes(word)) score += 0.5;
            });

            return { doc, score };
        });

        // Filter out zero scores and sort by score descending
        return scoredDocs
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(item => item.doc);
    }
}

// Singleton instance
let searchStore: SimpleSearchStore | null = null;

export async function getSearchStore() {
    if (!searchStore) {
        searchStore = new SimpleSearchStore();
    }
    return searchStore;
}

export async function clearIndex() {
    searchStore = null;
}

export async function indexArticles(articles: Article[]) {
    const store = await getSearchStore();

    const documents = articles.map((article) => {
        return new Document({
            pageContent: `${article.title}. ${article.description || ''}. ${article.content || ''}`,
            metadata: {
                title: article.title,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt,
                urlToImage: article.urlToImage,
            },
        });
    });

    await store.addDocuments(documents);
    console.log(`Indexed ${articles.length} articles for search.`);
}

export async function findRelatedArticles(query: string, k: number = 3) {
    const store = await getSearchStore();
    const results = await store.search(query, k);
    return results;
}

export async function generateBriefing(topic: string, contextArticles: Document[]) {
    return contextArticles;
}
