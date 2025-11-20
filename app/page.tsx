import { getTopHeadlines } from '@/lib/news-service';
import { indexArticles, clearIndex } from '@/lib/rag-engine';
import { ClientPage } from './client-page';

export default async function Page() {
  // Fetch news on the server
  const articles = await getTopHeadlines();

  // Index them for RAG (Simulated Ingestion)
  // In a real app, this would happen via a webhook or background job
  await clearIndex();
  await indexArticles(articles);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <ClientPage initialArticles={articles} />
    </main>
  );
}
