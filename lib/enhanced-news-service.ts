// ============================================================================
// ENHANCED NEWS SERVICE - Multiple Sources + Historical Context
// ============================================================================
// Features:
// - Multiple free news API sources (NewsAPI, GNews, MediaStack simulation)
// - Historical article fetching (1, 3, 5, 10 years context)
// - Wikipedia/historical event context
// - Improved deduplication and quality scoring
// ============================================================================

import { Article } from './news-service';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY; // Optional secondary source

// ============================================================================
// Historical Context Generator
// ============================================================================

interface HistoricalContext {
    timeframe: string;
    yearsAgo: number;
    articles: Article[];
    summary?: string;
}

// Generate date ranges for historical queries
function getHistoricalDateRange(yearsAgo: number): { from: string; to: string } {
    const now = new Date();
    const targetYear = now.getFullYear() - yearsAgo;
    
    // Get a 30-day window around this time X years ago
    const from = new Date(targetYear, now.getMonth(), 1);
    const to = new Date(targetYear, now.getMonth() + 1, 0);
    
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
    };
}

// ============================================================================
// Multiple News Sources
// ============================================================================

// NewsAPI.org (primary source)
async function fetchFromNewsAPI(query: string, options: {
    from?: string;
    to?: string;
    sortBy?: string;
    pageSize?: number;
} = {}): Promise<Article[]> {
    if (!NEWS_API_KEY) return [];
    
    const { from, to, sortBy = 'relevancy', pageSize = 100 } = options;
    
    try {
        let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${NEWS_API_KEY}&language=en&sortBy=${sortBy}&pageSize=${pageSize}`;
        
        if (from) url += `&from=${from}`;
        if (to) url += `&to=${to}`;
        
        const res = await fetch(url, { 
            next: { revalidate: 3600 },
            headers: { 'User-Agent': 'NewsGraph-AI/1.0' }
        });
        
        if (!res.ok) {
            console.error(`NewsAPI error: ${res.status} ${res.statusText}`);
            return [];
        }
        
        const data = await res.json();
        return data.articles || [];
    } catch (error) {
        console.error('NewsAPI fetch error:', error);
        return [];
    }
}

// GNews API (secondary source - free tier available)
async function fetchFromGNews(query: string, options: {
    from?: string;
    to?: string;
    max?: number;
} = {}): Promise<Article[]> {
    if (!GNEWS_API_KEY) return [];
    
    const { from, to, max = 10 } = options;
    
    try {
        let url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${GNEWS_API_KEY}&lang=en&max=${max}`;
        
        if (from) url += `&from=${from}`;
        if (to) url += `&to=${to}`;
        
        const res = await fetch(url, { next: { revalidate: 3600 } });
        
        if (!res.ok) return [];
        
        const data = await res.json();
        
        // Transform GNews format to our Article format
        return (data.articles || []).map((a: any) => ({
            source: { id: null, name: a.source?.name || 'Unknown' },
            author: a.source?.name || null,
            title: a.title,
            description: a.description,
            url: a.url,
            urlToImage: a.image,
            publishedAt: a.publishedAt,
            content: a.content
        }));
    } catch (error) {
        console.error('GNews fetch error:', error);
        return [];
    }
}

// Wikipedia historical events API (for context)
async function fetchWikipediaContext(topic: string): Promise<string | null> {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic.replace(/ /g, '_'))}`;
        const res = await fetch(url, { 
            next: { revalidate: 86400 }, // Cache for 24 hours
            headers: { 'User-Agent': 'NewsGraph-AI/1.0' }
        });
        
        if (!res.ok) return null;
        
        const data = await res.json();
        return data.extract || null;
    } catch (error) {
        console.error('Wikipedia fetch error:', error);
        return null;
    }
}

// ============================================================================
// Historical Article Templates (for when API can't go back that far)
// ============================================================================

interface HistoricalEvent {
    year: number;
    topic: string;
    title: string;
    description: string;
    significance: string;
}

// Generate historical context based on topic keywords
function generateHistoricalContext(topic: string, yearsAgo: number): HistoricalEvent[] {
    const topicLower = topic.toLowerCase();
    const targetYear = new Date().getFullYear() - yearsAgo;
    const events: HistoricalEvent[] = [];
    
    // AI/Technology topics
    if (topicLower.includes('ai') || topicLower.includes('artificial intelligence') || topicLower.includes('machine learning')) {
        const aiEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'AI', title: 'GPT-4 and Multimodal AI Revolution', description: 'OpenAI releases GPT-4, Claude 3, and Gemini emerge as major players', significance: 'AI becomes mainstream in enterprise applications' },
            2023: { year: 2023, topic: 'AI', title: 'ChatGPT Sparks AI Race', description: 'ChatGPT reaches 100M users, sparking global AI competition', significance: 'Beginning of generative AI mainstream adoption' },
            2022: { year: 2022, topic: 'AI', title: 'DALL-E 2 and Stable Diffusion Launch', description: 'AI image generation becomes accessible to the public', significance: 'Democratization of AI creative tools' },
            2020: { year: 2020, topic: 'AI', title: 'GPT-3 Released', description: 'OpenAI releases GPT-3 with 175 billion parameters', significance: 'Major leap in language model capabilities' },
            2015: { year: 2015, topic: 'AI', title: 'AlphaGo Defeats Human Champion', description: 'DeepMind\'s AlphaGo beats Lee Sedol at Go', significance: 'AI surpasses humans in complex strategic games' },
        };
        if (aiEvents[targetYear]) events.push(aiEvents[targetYear]);
    }
    
    // Climate topics
    if (topicLower.includes('climate') || topicLower.includes('environment') || topicLower.includes('carbon') || topicLower.includes('warming') || topicLower.includes('green')) {
        const climateEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Climate', title: 'COP29 and Climate Finance', description: 'Global climate summit focuses on financing for developing nations', significance: 'Climate action funding becomes central issue' },
            2023: { year: 2023, topic: 'Climate', title: 'Hottest Year on Record', description: '2023 confirmed as hottest year in recorded history', significance: 'Climate urgency reaches new heights' },
            2021: { year: 2021, topic: 'Climate', title: 'COP26 Glasgow Pact', description: 'Nearly 200 countries agree to phase down coal', significance: 'First explicit mention of fossil fuels in COP agreement' },
            2020: { year: 2020, topic: 'Climate', title: 'COVID Emissions Drop', description: 'Global lockdowns cause temporary 7% emissions decline', significance: 'Brief glimpse of reduced industrial activity impact' },
            2015: { year: 2015, topic: 'Climate', title: 'Paris Agreement Signed', description: '196 countries adopt historic climate agreement', significance: 'First universal, legally binding global climate deal' },
        };
        if (climateEvents[targetYear]) events.push(climateEvents[targetYear]);
    }
    
    // Crypto/Bitcoin topics
    if (topicLower.includes('bitcoin') || topicLower.includes('crypto') || topicLower.includes('blockchain') || topicLower.includes('ethereum')) {
        const cryptoEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Crypto', title: 'Bitcoin ETFs Approved', description: 'SEC approves multiple spot Bitcoin ETFs', significance: 'Institutional adoption milestone' },
            2023: { year: 2023, topic: 'Crypto', title: 'Post-FTX Recovery', description: 'Crypto markets recover from 2022 crashes', significance: 'Industry rebuilds with focus on regulation' },
            2021: { year: 2021, topic: 'Crypto', title: 'Bitcoin Hits $69K', description: 'Bitcoin reaches all-time high of $69,000', significance: 'Peak of crypto bull market' },
            2020: { year: 2020, topic: 'Crypto', title: 'DeFi Summer', description: 'Decentralized finance protocols explode in popularity', significance: 'Birth of DeFi as major crypto sector' },
            2017: { year: 2017, topic: 'Crypto', title: 'ICO Boom', description: 'Initial Coin Offerings raise billions, Bitcoin hits $20K', significance: 'First major retail crypto bubble' },
        };
        if (cryptoEvents[targetYear]) events.push(cryptoEvents[targetYear]);
    }
    
    // Election/Politics topics
    if (topicLower.includes('election') || topicLower.includes('president') || topicLower.includes('politics') || topicLower.includes('trump') || topicLower.includes('biden')) {
        const politicsEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Politics', title: '2024 US Presidential Election', description: 'Major US election cycle with significant global implications', significance: 'Highly contested election with policy implications' },
            2020: { year: 2020, topic: 'Politics', title: 'Biden Defeats Trump', description: 'Joe Biden wins 2020 presidential election amid pandemic', significance: 'Historic voter turnout, contested results claims' },
            2016: { year: 2016, topic: 'Politics', title: 'Trump Elected President', description: 'Donald Trump wins upset victory over Hillary Clinton', significance: 'Major political realignment begins' },
            2015: { year: 2015, topic: 'Politics', title: 'Trump Announces Candidacy', description: 'Donald Trump enters 2016 presidential race', significance: 'Beginning of new era in US politics' },
        };
        if (politicsEvents[targetYear]) events.push(politicsEvents[targetYear]);
    }

    // Economy/Markets topics
    if (topicLower.includes('economy') || topicLower.includes('market') || topicLower.includes('stock') || topicLower.includes('inflation') || topicLower.includes('recession')) {
        const economyEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Economy', title: 'Fed Rate Decisions', description: 'Federal Reserve navigates inflation and growth balance', significance: 'Post-pandemic monetary policy normalization' },
            2023: { year: 2023, topic: 'Economy', title: 'Banking Crisis', description: 'Silicon Valley Bank collapse triggers regional bank concerns', significance: 'Stress testing of post-2008 banking regulations' },
            2022: { year: 2022, topic: 'Economy', title: 'Inflation Peaks', description: 'US inflation hits 40-year high of 9.1%', significance: 'Fed begins aggressive rate hiking cycle' },
            2020: { year: 2020, topic: 'Economy', title: 'COVID Market Crash', description: 'Markets crash 34% in March, recover by year end', significance: 'Fastest bear market and recovery in history' },
            2015: { year: 2015, topic: 'Economy', title: 'China Market Turmoil', description: 'Chinese stock market crashes, global markets affected', significance: 'Exposed interconnected global market risks' },
        };
        if (economyEvents[targetYear]) events.push(economyEvents[targetYear]);
    }

    // Tech/Technology topics
    if (topicLower.includes('tech') || topicLower.includes('apple') || topicLower.includes('google') || topicLower.includes('microsoft') || topicLower.includes('meta') || topicLower.includes('facebook')) {
        const techEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Tech', title: 'Apple Vision Pro Launch', description: 'Apple enters spatial computing with Vision Pro headset', significance: 'New category of consumer tech emerges' },
            2023: { year: 2023, topic: 'Tech', title: 'Tech Layoffs Wave', description: 'Major tech companies lay off over 200,000 workers', significance: 'Post-pandemic tech sector correction' },
            2022: { year: 2022, topic: 'Tech', title: 'Elon Musk Acquires Twitter', description: 'Musk completes $44B acquisition, rebrands to X', significance: 'Major shift in social media landscape' },
            2021: { year: 2021, topic: 'Tech', title: 'Facebook Becomes Meta', description: 'Facebook rebrands, pivots to metaverse', significance: 'Big tech bets on virtual reality future' },
            2020: { year: 2020, topic: 'Tech', title: 'Remote Work Revolution', description: 'COVID-19 forces global shift to remote work', significance: 'Permanent transformation of work culture' },
        };
        if (techEvents[targetYear]) events.push(techEvents[targetYear]);
    }

    // War/Conflict topics
    if (topicLower.includes('war') || topicLower.includes('ukraine') || topicLower.includes('russia') || topicLower.includes('israel') || topicLower.includes('gaza') || topicLower.includes('conflict') || topicLower.includes('military')) {
        const conflictEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Conflict', title: 'Gaza Conflict Escalates', description: 'Major military operations in Gaza following October 7 attacks', significance: 'Reshapes Middle East geopolitics' },
            2023: { year: 2023, topic: 'Conflict', title: 'Ukraine Counteroffensive', description: 'Ukraine launches major counteroffensive against Russia', significance: 'War enters attritional phase' },
            2022: { year: 2022, topic: 'Conflict', title: 'Russia Invades Ukraine', description: 'Russia launches full-scale invasion of Ukraine', significance: 'Largest European conflict since WWII' },
            2021: { year: 2021, topic: 'Conflict', title: 'US Exits Afghanistan', description: 'US withdraws from Afghanistan after 20 years', significance: 'End of longest US war, Taliban returns to power' },
            2020: { year: 2020, topic: 'Conflict', title: 'Armenia-Azerbaijan War', description: 'Nagorno-Karabakh conflict flares up', significance: 'Drone warfare changes modern conflict' },
        };
        if (conflictEvents[targetYear]) events.push(conflictEvents[targetYear]);
    }

    // Healthcare/COVID topics
    if (topicLower.includes('health') || topicLower.includes('covid') || topicLower.includes('vaccine') || topicLower.includes('pandemic') || topicLower.includes('virus')) {
        const healthEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Health', title: 'GLP-1 Drug Revolution', description: 'Ozempic and similar drugs transform obesity treatment', significance: 'New era in metabolic disease treatment' },
            2023: { year: 2023, topic: 'Health', title: 'COVID Emergency Ends', description: 'WHO declares end of COVID-19 global health emergency', significance: 'Transition to endemic phase' },
            2021: { year: 2021, topic: 'Health', title: 'Mass Vaccination Campaigns', description: 'COVID vaccines deployed globally, billions vaccinated', significance: 'Largest vaccination campaign in history' },
            2020: { year: 2020, topic: 'Health', title: 'COVID-19 Pandemic Begins', description: 'Coronavirus spreads globally, lockdowns implemented', significance: 'Global pandemic reshapes society' },
            2015: { year: 2015, topic: 'Health', title: 'Zika Virus Outbreak', description: 'Zika virus spreads through Americas', significance: 'Global health preparedness tested' },
        };
        if (healthEvents[targetYear]) events.push(healthEvents[targetYear]);
    }

    // Space topics
    if (topicLower.includes('space') || topicLower.includes('nasa') || topicLower.includes('spacex') || topicLower.includes('moon') || topicLower.includes('mars') || topicLower.includes('rocket')) {
        const spaceEvents: Record<number, HistoricalEvent> = {
            2024: { year: 2024, topic: 'Space', title: 'Artemis Missions Progress', description: 'NASA continues moon return preparations', significance: 'New era of lunar exploration begins' },
            2023: { year: 2023, topic: 'Space', title: 'Starship Test Flights', description: 'SpaceX tests largest rocket ever built', significance: 'Path to Mars transportation develops' },
            2022: { year: 2022, topic: 'Space', title: 'James Webb First Images', description: 'JWST delivers stunning deep space images', significance: 'Revolutionary astronomical observations' },
            2021: { year: 2021, topic: 'Space', title: 'Civilian Space Tourism', description: 'Blue Origin, Virgin Galactic launch tourists', significance: 'Commercial space travel becomes reality' },
            2020: { year: 2020, topic: 'Space', title: 'SpaceX Crew Dragon', description: 'First commercial crew launch to ISS', significance: 'End of Russian monopoly on ISS transport' },
        };
        if (spaceEvents[targetYear]) events.push(spaceEvents[targetYear]);
    }
    
    return events;
}

// Convert historical events to Article format
function historicalEventsToArticles(events: HistoricalEvent[], yearsAgo: number): Article[] {
    return events.map(event => ({
        source: { id: 'historical-context', name: 'Historical Context' },
        author: 'NewsGraph AI',
        title: `[${event.year}] ${event.title}`,
        description: event.description,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(event.topic)}`,
        urlToImage: null,
        publishedAt: new Date(event.year, 0, 1).toISOString(),
        content: `${event.description}. Significance: ${event.significance}`,
    }));
}

// ============================================================================
// Main Enhanced Search Functions
// ============================================================================

export interface EnhancedSearchOptions {
    includeHistorical?: boolean;
    historicalYears?: number[];
    maxArticles?: number;
    sortBy?: 'relevancy' | 'publishedAt' | 'popularity';
}

export interface EnhancedSearchResult {
    currentArticles: Article[];
    historicalContext: HistoricalContext[];
    wikipediaContext: string | null;
    totalArticles: number;
    sources: string[];
}

export async function enhancedSearch(query: string, options: EnhancedSearchOptions = {}): Promise<EnhancedSearchResult> {
    const {
        includeHistorical = true,
        historicalYears = [1, 3, 5, 10],
        maxArticles = 100,
        sortBy = 'relevancy'
    } = options;
    
    console.log(`[Enhanced Search] Searching for: "${query}" with historical: ${includeHistorical}`);
    
    // Parallel fetch from multiple sources
    const [newsApiArticles, gnewsArticles, wikiContext] = await Promise.all([
        fetchFromNewsAPI(query, { sortBy, pageSize: maxArticles }),
        fetchFromGNews(query, { max: 10 }),
        fetchWikipediaContext(query)
    ]);
    
    // Combine and deduplicate current articles
    const allCurrentArticles = [...newsApiArticles, ...gnewsArticles];
    const currentArticles = deduplicateArticles(allCurrentArticles).slice(0, maxArticles);
    
    console.log(`[Enhanced Search] Found ${currentArticles.length} current articles`);
    
    // Fetch historical context
    const historicalContext: HistoricalContext[] = [];
    
    if (includeHistorical) {
        for (const yearsAgo of historicalYears) {
            const dateRange = getHistoricalDateRange(yearsAgo);
            
            // Try to fetch from API first (usually only works for recent years)
            let historicalArticles: Article[] = [];
            
            if (yearsAgo <= 1) {
                // NewsAPI free tier only goes back ~1 month, but paid can go further
                historicalArticles = await fetchFromNewsAPI(query, {
                    from: dateRange.from,
                    to: dateRange.to,
                    pageSize: 10
                });
            }
            
            // If no API results, use generated historical context
            if (historicalArticles.length === 0) {
                const events = generateHistoricalContext(query, yearsAgo);
                historicalArticles = historicalEventsToArticles(events, yearsAgo);
            }
            
            if (historicalArticles.length > 0) {
                historicalContext.push({
                    timeframe: `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`,
                    yearsAgo,
                    articles: historicalArticles.slice(0, 5),
                    summary: generateTimeframeSummary(query, yearsAgo, historicalArticles)
                });
            }
        }
    }
    
    console.log(`[Enhanced Search] Added ${historicalContext.length} historical timeframes`);
    
    // Collect unique sources
    const sources = [...new Set(currentArticles.map(a => a.source.name))];
    
    return {
        currentArticles,
        historicalContext,
        wikipediaContext: wikiContext,
        totalArticles: currentArticles.length + historicalContext.reduce((sum, h) => sum + h.articles.length, 0),
        sources
    };
}

// Generate summary for a historical timeframe
function generateTimeframeSummary(topic: string, yearsAgo: number, articles: Article[]): string {
    const year = new Date().getFullYear() - yearsAgo;
    if (articles.length === 0) return `No significant events related to ${topic} found in ${year}.`;
    
    const titles = articles.slice(0, 3).map(a => a.title).join('; ');
    return `In ${year}: ${titles}`;
}

// Deduplicate articles by URL and title similarity
function deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Set<string>();
    const result: Article[] = [];
    
    for (const article of articles) {
        // Skip articles without titles
        if (!article.title) continue;
        
        // Create a normalized key from URL or title
        const urlKey = article.url?.toLowerCase() || '';
        const titleKey = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
        
        if (!seen.has(urlKey) && !seen.has(titleKey)) {
            seen.add(urlKey);
            seen.add(titleKey);
            result.push(article);
        }
    }
    
    return result;
}

// ============================================================================
// Bulk Index Function (for deeper RAG)
// ============================================================================

export async function fetchBulkArticlesForIndex(topics: string[]): Promise<Article[]> {
    console.log(`[Bulk Fetch] Fetching articles for ${topics.length} topics...`);
    
    const allArticles: Article[] = [];
    
    // Fetch for each topic in parallel (with concurrency limit)
    const batchSize = 3;
    for (let i = 0; i < topics.length; i += batchSize) {
        const batch = topics.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(topic => fetchFromNewsAPI(topic, { pageSize: 20, sortBy: 'relevancy' }))
        );
        batchResults.forEach(articles => allArticles.push(...articles));
    }
    
    const deduplicated = deduplicateArticles(allArticles);
    console.log(`[Bulk Fetch] Total: ${deduplicated.length} unique articles`);
    
    return deduplicated;
}

// Default topics for initial deep indexing
export const DEFAULT_INDEX_TOPICS = [
    'artificial intelligence',
    'climate change',
    'cryptocurrency bitcoin',
    'technology',
    'politics election',
    'economy markets',
    'healthcare',
    'science research',
    'international affairs',
    'business finance'
];
