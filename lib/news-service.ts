export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

export async function getTopHeadlines(category: string = 'general'): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    console.warn('News API Key is missing. Returning mock data.');
    return MOCK_ARTICLES;
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`News API error: ${res.statusText}`);
    }

    const data: NewsResponse = await res.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return MOCK_ARTICLES;
  }
}

export interface SearchOptions {
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  from?: string;
  to?: string;
  language?: string;
}

export async function searchNews(query: string, options: SearchOptions = {}): Promise<Article[]> {
  if (!NEWS_API_KEY) return MOCK_ARTICLES;

  const {
    sortBy = 'relevancy',
    language = 'en',
    from,
    to
  } = options;

  try {
    let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${NEWS_API_KEY}&language=${language}&sortBy=${sortBy}`;
    
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`News API error: ${res.statusText}`);

    const data: NewsResponse = await res.json();
    return data.articles;
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
}

const MOCK_ARTICLES: Article[] = [
  {
    source: { id: 'the-verge', name: 'The Verge' },
    author: 'Nilay Patel',
    title: 'The Future of AI is Agentic',
    description: 'How autonomous agents are reshaping the software landscape.',
    url: 'https://www.theverge.com',
    urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    publishedAt: new Date().toISOString(),
    content: 'AI agents are becoming more capable...',
  },
  {
    source: { id: 'techcrunch', name: 'TechCrunch' },
    author: 'Sarah Perez',
    title: 'Crypto Markets Rally on New Regulations',
    description: 'Bitcoin and Ethereum see significant gains as new laws pass.',
    url: 'https://techcrunch.com',
    urlToImage: 'https://images.unsplash.com/photo-1518546305927-5a440bb11c19',
    publishedAt: new Date().toISOString(),
    content: 'The cryptocurrency market saw a major boost today...',
  },
];
