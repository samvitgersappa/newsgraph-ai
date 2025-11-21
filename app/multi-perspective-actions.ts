'use server';

import { searchNews } from '@/lib/news-service';
import { getBiasRating, getSimplifiedBias, BiasRating } from '@/lib/bias-detector';
import { Article } from '@/lib/news-service';

export interface PerspectiveGroup {
    bias: 'left' | 'center' | 'right';
    articles: Article[];
    sources: string[];
    themes: string[]; // Key themes/topics
    articleCount: number;
    uniqueSourceCount: number;
}

export interface MultiPerspectiveResult {
    topic: string;
    perspectives: {
        left: PerspectiveGroup;
        center: PerspectiveGroup;
        right: PerspectiveGroup;
    };
    totalArticles: number;
    balanceStats: {
        leftPercentage: number;
        centerPercentage: number;
        rightPercentage: number;
        dominantPerspective: 'left' | 'center' | 'right' | 'balanced';
    };
}

/**
 * Extracts key themes from article titles and descriptions
 */
function extractThemes(articles: Article[]): string[] {
    const keywords = new Map<string, number>();

    // Common words to filter out
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'when',
        'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
        'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
        'same', 'so', 'than', 'too', 'very', 'says', 'said', 'new', 'after'
    ]);

    articles.forEach(article => {
        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        const words = text.match(/\b[a-z]{4,}\b/g) || [];

        words.forEach(word => {
            if (!stopWords.has(word)) {
                keywords.set(word, (keywords.get(word) || 0) + 1);
            }
        });
    });

    // Get top 5 most frequent keywords
    return Array.from(keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

/**
 * Fetches articles from multiple political perspectives on a given topic
 * @param topic - Topic to search for
 * @param articlesPerPerspective - Number of articles to fetch per perspective (default: 5)
 * @returns Articles grouped by political bias with enhanced analytics
 */
export async function getMultiPerspectives(
    topic: string,
    articlesPerPerspective: number = 5
): Promise<MultiPerspectiveResult> {
    // Fetch a larger set of articles to ensure diverse sources
    const allArticles = await searchNews(topic);

    // Group articles by simplified bias
    const grouped: Record<'left' | 'center' | 'right' | 'unknown', Article[]> = {
        left: [],
        center: [],
        right: [],
        unknown: [],
    };

    allArticles.forEach(article => {
        const bias = getBiasRating(article.source.name);
        const simplified = getSimplifiedBias(bias);

        if (simplified !== 'unknown') {
            grouped[simplified].push(article);
        } else {
            // Strict mode: Do not default to center. 
            // Keep them as unknown, they won't be displayed in the main columns
            // This ensures "Center" really means Center.
            grouped.unknown.push(article);
        }
    });

    // Create perspective groups with enhanced data
    const createPerspectiveGroup = (bias: 'left' | 'center' | 'right'): PerspectiveGroup => {
        const articles = grouped[bias].slice(0, articlesPerPerspective);
        const sources = [...new Set(articles.map(a => a.source.name))];
        const themes = extractThemes(articles);

        return {
            bias,
            articles,
            sources,
            themes,
            articleCount: articles.length,
            uniqueSourceCount: sources.length,
        };
    };

    const leftGroup = createPerspectiveGroup('left');
    const centerGroup = createPerspectiveGroup('center');
    const rightGroup = createPerspectiveGroup('right');

    // Calculate balance statistics
    const total = leftGroup.articleCount + centerGroup.articleCount + rightGroup.articleCount;
    const leftPct = total > 0 ? (leftGroup.articleCount / total) * 100 : 0;
    const centerPct = total > 0 ? (centerGroup.articleCount / total) * 100 : 0;
    const rightPct = total > 0 ? (rightGroup.articleCount / total) * 100 : 0;

    let dominantPerspective: 'left' | 'center' | 'right' | 'balanced';
    if (Math.max(leftPct, centerPct, rightPct) - Math.min(leftPct, centerPct, rightPct) < 20) {
        dominantPerspective = 'balanced';
    } else if (leftPct > centerPct && leftPct > rightPct) {
        dominantPerspective = 'left';
    } else if (rightPct > centerPct && rightPct > leftPct) {
        dominantPerspective = 'right';
    } else {
        dominantPerspective = 'center';
    }

    const result: MultiPerspectiveResult = {
        topic,
        perspectives: {
            left: leftGroup,
            center: centerGroup,
            right: rightGroup,
        },
        totalArticles: allArticles.length,
        balanceStats: {
            leftPercentage: leftPct,
            centerPercentage: centerPct,
            rightPercentage: rightPct,
            dominantPerspective,
        },
    };

    return result;
}

/**
 * Analyzes the balance of perspectives in search results
 * @param topic - Topic to analyze
 * @returns Statistics about bias distribution
 */
export async function analyzePerspectiveBalance(topic: string): Promise<{
    topic: string;
    leftCount: number;
    centerCount: number;
    rightCount: number;
    unknownCount: number;
    totalCount: number;
    balance: 'balanced' | 'left-leaning' | 'right-leaning' | 'center-heavy';
}> {
    const allArticles = await searchNews(topic);

    let leftCount = 0;
    let centerCount = 0;
    let rightCount = 0;
    let unknownCount = 0;

    allArticles.forEach(article => {
        const bias = getBiasRating(article.source.name);
        const simplified = getSimplifiedBias(bias);

        switch (simplified) {
            case 'left': leftCount++; break;
            case 'center': centerCount++; break;
            case 'right': rightCount++; break;
            case 'unknown': unknownCount++; break;
        }
    });

    // Determine overall balance
    const total = allArticles.length;
    const leftPct = (leftCount / total) * 100;
    const rightPct = (rightCount / total) * 100;
    const centerPct = (centerCount / total) * 100;

    let balance: 'balanced' | 'left-leaning' | 'right-leaning' | 'center-heavy';
    if (centerPct > 60) {
        balance = 'center-heavy';
    } else if (Math.abs(leftPct - rightPct) < 15) {
        balance = 'balanced';
    } else if (leftPct > rightPct) {
        balance = 'left-leaning';
    } else {
        balance = 'right-leaning';
    }

    return {
        topic,
        leftCount,
        centerCount,
        rightCount,
        unknownCount,
        totalCount: total,
        balance,
    };
}
