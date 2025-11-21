import Sentiment from 'sentiment';
import { Article } from './news-service';

const sentiment = new Sentiment();

export interface SentimentResult {
    score: number; // Raw score (sum of word scores)
    comparative: number; // Normalized score (-5 to +5 typically)
    classification: 'positive' | 'neutral' | 'negative';
    emoji: string;
    tokens: string[];
    positive: string[];
    negative: string[];
}

/**
 * Analyzes the sentiment of a given text
 * @param text - Text to analyze
 * @returns Sentiment analysis result
 */
export function analyzeSentiment(text: string): SentimentResult {
    const result = sentiment.analyze(text);

    // More dynamic classification with lower thresholds
    // News articles typically have subtle sentiment, so we use smaller thresholds
    let classification: 'positive' | 'neutral' | 'negative';
    let emoji: string;

    if (result.comparative > 0.05) {
        // Positive sentiment
        if (result.comparative > 0.3) {
            classification = 'positive';
            emoji = '😊';
        } else if (result.comparative > 0.15) {
            classification = 'positive';
            emoji = '🙂';
        } else {
            classification = 'positive';
            emoji = '🙂';
        }
    } else if (result.comparative < -0.05) {
        // Negative sentiment
        if (result.comparative < -0.3) {
            classification = 'negative';
            emoji = '😢';
        } else if (result.comparative < -0.15) {
            classification = 'negative';
            emoji = '😟';
        } else {
            classification = 'negative';
            emoji = '😟';
        }
    } else {
        // Truly neutral (between -0.05 and 0.05)
        classification = 'neutral';
        emoji = '😐';
    }

    return {
        score: result.score,
        comparative: result.comparative,
        classification,
        emoji,
        tokens: result.tokens,
        positive: result.positive,
        negative: result.negative,
    };
}

/**
 * Analyzes sentiment for an article (title + description)
 * @param article - Article to analyze
 * @returns Sentiment result
 */
export function analyzeArticleSentiment(article: Article): SentimentResult {
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`;
    return analyzeSentiment(text);
}

/**
 * Gets a color based on sentiment score for UI display
 * @param comparative - Comparative sentiment score
 * @returns CSS color string
 */
export function getSentimentColor(comparative: number): string {
    if (comparative > 0.3) {
        return 'rgb(34, 197, 94)'; // green-500 - Strong positive
    } else if (comparative > 0.15) {
        return 'rgb(132, 204, 22)'; // lime-500 - Moderate positive
    } else if (comparative > 0.05) {
        return 'rgb(163, 230, 53)'; // lime-400 - Slight positive
    } else if (comparative < -0.3) {
        return 'rgb(239, 68, 68)'; // red-500 - Strong negative
    } else if (comparative < -0.15) {
        return 'rgb(248, 113, 113)'; // red-400 - Moderate negative
    } else if (comparative < -0.05) {
        return 'rgb(251, 146, 60)'; // orange-400 - Slight negative
    } else {
        return 'rgb(161, 161, 170)'; // zinc-400 - Neutral
    }
}

/**
 * Gets a gradient color for heat maps
 * @param comparative - Comparative sentiment score
 * @returns HSL color string for gradients
 */
export function getSentimentGradient(comparative: number): string {
    // Map -3 to +3 range to 0-120 hue (red to green)
    const normalized = Math.max(-3, Math.min(3, comparative));
    const hue = ((normalized + 3) / 6) * 120; // 0 (red) to 120 (green)
    const saturation = Math.abs(normalized) * 20 + 40; // 40-100%
    const lightness = 50;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Aggregates sentiment across multiple articles
 * @param articles - Array of articles
 * @returns Aggregate statistics
 */
export function aggregateSentiment(articles: Article[]): {
    averageScore: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    totalCount: number;
} {
    const sentiments = articles.map(analyzeArticleSentiment);

    const positiveCount = sentiments.filter(s => s.classification === 'positive').length;
    const neutralCount = sentiments.filter(s => s.classification === 'neutral').length;
    const negativeCount = sentiments.filter(s => s.classification === 'negative').length;

    const averageScore = sentiments.reduce((sum, s) => sum + s.comparative, 0) / sentiments.length;

    return {
        averageScore,
        positiveCount,
        neutralCount,
        negativeCount,
        totalCount: articles.length,
    };
}

/**
 * Groups articles by sentiment classification
 * @param articles - Array of articles
 * @returns Articles grouped by sentiment
 */
export function groupBySentiment(articles: Article[]): {
    positive: Article[];
    neutral: Article[];
    negative: Article[];
} {
    const result = {
        positive: [] as Article[],
        neutral: [] as Article[],
        negative: [] as Article[],
    };

    articles.forEach(article => {
        const sentiment = analyzeArticleSentiment(article);
        result[sentiment.classification].push(article);
    });

    return result;
}
