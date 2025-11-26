import { getTopHeadlines, searchNews } from '@/lib/news-service';
import { indexArticles, clearIndex } from '@/lib/rag-engine';
import { ClientPage } from './client-page';

// Categories to fetch for deeper RAG indexing
const CATEGORIES_TO_INDEX = ['technology', 'business', 'science', 'health'];
const TOPICS_TO_INDEX = ['artificial intelligence', 'climate change', 'cryptocurrency'];

export default async function Page() {
  // Fetch news on the server - get both headlines and category-specific news
  const [headlines, ...categoryResults] = await Promise.all([
    getTopHeadlines(),
    ...CATEGORIES_TO_INDEX.map(cat => getTopHeadlines(cat))
  ]);

  // Also fetch topic-specific articles for better RAG coverage
  const topicResults = await Promise.all(
    TOPICS_TO_INDEX.map(topic => searchNews(topic, { sortBy: 'relevancy' }).then(r => r.slice(0, 10)))
  );

  // Combine all articles for indexing (deduplicated)
  const allArticles = [...headlines, ...categoryResults.flat(), ...topicResults.flat()];
  const seen = new Set<string>();
  const uniqueArticles = allArticles.filter(article => {
    if (!article.url || seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });

  console.log(`[RAG] Indexing ${uniqueArticles.length} unique articles from ${CATEGORIES_TO_INDEX.length + 1} categories + ${TOPICS_TO_INDEX.length} topics`);

  // Index them for RAG (Deep Ingestion)
  await clearIndex();
  await indexArticles(uniqueArticles);

  return (
    <main className="min-h-screen bg-white dark:bg-[#1c1c1c] text-[#1c1c1c] dark:text-white selection:bg-[#00D166]/30">
      <ClientPage initialArticles={headlines} />
    </main>
  );
}
