/**
 * News Source Credibility Rating System
 * Based on multiple factors including fact-checking record, journalistic standards,
 * ownership transparency, and editorial independence
 */

export type CredibilityScore = 'high' | 'medium-high' | 'medium' | 'mixed' | 'low' | 'unknown';

export interface CredibilityInfo {
    score: CredibilityScore;
    rating: number; // 0-100
    label: string;
    color: string;
    description: string;
    factors: {
        factChecking: number; // 0-100
        editorialStandards: number; // 0-100
        transparency: number; // 0-100
    };
}

/**
 * Credibility ratings for major news sources
 * Based on evaluations from:
 * - Media Bias/Fact Check
 * - NewsGuard
 * - Poynter Institute
 * - International Fact-Checking Network
 */
const CREDIBILITY_MAP: Record<string, CredibilityInfo> = {
    // High Credibility
    'reuters': {
        score: 'high',
        rating: 95,
        label: 'Very High',
        color: '#22c55e',
        description: 'Excellent fact-checking record and editorial standards',
        factors: { factChecking: 98, editorialStandards: 95, transparency: 92 },
    },
    'associated press': {
        score: 'high',
        rating: 95,
        label: 'Very High',
        color: '#22c55e',
        description: 'Excellent fact-checking record and editorial standards',
        factors: { factChecking: 97, editorialStandards: 96, transparency: 92 },
    },
    'ap news': {
        score: 'high',
        rating: 95,
        label: 'Very High',
        color: '#22c55e',
        description: 'Excellent fact-checking record and editorial standards',
        factors: { factChecking: 97, editorialStandards: 96, transparency: 92 },
    },
    'bbc': {
        score: 'high',
        rating: 92,
        label: 'Very High',
        color: '#22c55e',
        description: 'Strong editorial standards and fact-checking',
        factors: { factChecking: 93, editorialStandards: 94, transparency: 89 },
    },
    'bbc news': {
        score: 'high',
        rating: 92,
        label: 'Very High',
        color: '#22c55e',
        description: 'Strong editorial standards and fact-checking',
        factors: { factChecking: 93, editorialStandards: 94, transparency: 89 },
    },
    'npr': {
        score: 'high',
        rating: 90,
        label: 'Very High',
        color: '#22c55e',
        description: 'High quality journalism with strong standards',
        factors: { factChecking: 92, editorialStandards: 91, transparency: 87 },
    },
    'pbs': {
        score: 'high',
        rating: 90,
        label: 'Very High',
        color: '#22c55e',
        description: 'High quality journalism with strong standards',
        factors: { factChecking: 91, editorialStandards: 92, transparency: 87 },
    },
    'the economist': {
        score: 'high',
        rating: 88,
        label: 'Very High',
        color: '#22c55e',
        description: 'Strong analytical journalism and fact-checking',
        factors: { factChecking: 89, editorialStandards: 90, transparency: 85 },
    },

    // Medium-High Credibility
    'the new york times': {
        score: 'medium-high',
        rating: 85,
        label: 'High',
        color: '#3b82f6',
        description: 'Generally reliable with strong editorial standards',
        factors: { factChecking: 87, editorialStandards: 88, transparency: 80 },
    },
    'nytimes': {
        score: 'medium-high',
        rating: 85,
        label: 'High',
        color: '#3b82f6',
        description: 'Generally reliable with strong editorial standards',
        factors: { factChecking: 87, editorialStandards: 88, transparency: 80 },
    },
    'the washington post': {
        score: 'medium-high',
        rating: 85,
        label: 'High',
        color: '#3b82f6',
        description: 'Generally reliable with strong editorial standards',
        factors: { factChecking: 86, editorialStandards: 87, transparency: 82 },
    },
    'washington post': {
        score: 'medium-high',
        rating: 85,
        label: 'High',
        color: '#3b82f6',
        description: 'Generally reliable with strong editorial standards',
        factors: { factChecking: 86, editorialStandards: 87, transparency: 82 },
    },
    'the wall street journal': {
        score: 'medium-high',
        rating: 84,
        label: 'High',
        color: '#3b82f6',
        description: 'Strong reporting with good fact-checking',
        factors: { factChecking: 85, editorialStandards: 86, transparency: 81 },
    },
    'wall street journal': {
        score: 'medium-high',
        rating: 84,
        label: 'High',
        color: '#3b82f6',
        description: 'Strong reporting with good fact-checking',
        factors: { factChecking: 85, editorialStandards: 86, transparency: 81 },
    },
    'the guardian': {
        score: 'medium-high',
        rating: 82,
        label: 'High',
        color: '#3b82f6',
        description: 'Generally reliable with good standards',
        factors: { factChecking: 83, editorialStandards: 84, transparency: 79 },
    },
    'cnn': {
        score: 'medium-high',
        rating: 78,
        label: 'High',
        color: '#3b82f6',
        description: 'Mostly reliable with some editorial bias',
        factors: { factChecking: 80, editorialStandards: 79, transparency: 75 },
    },
    'bloomberg': {
        score: 'medium-high',
        rating: 85,
        label: 'High',
        color: '#3b82f6',
        description: 'Strong financial journalism and fact-checking',
        factors: { factChecking: 88, editorialStandards: 86, transparency: 81 },
    },
    'financial times': {
        score: 'medium-high',
        rating: 85,
        label: 'High',
        color: '#3b82f6',
        description: 'Strong financial journalism and fact-checking',
        factors: { factChecking: 87, editorialStandards: 87, transparency: 81 },
    },

    // Medium Credibility
    'fox news': {
        score: 'medium',
        rating: 65,
        label: 'Medium',
        color: '#f59e0b',
        description: 'Mixed record on fact-checking and editorial standards',
        factors: { factChecking: 62, editorialStandards: 68, transparency: 65 },
    },
    'msnbc': {
        score: 'medium',
        rating: 68,
        label: 'Medium',
        color: '#f59e0b',
        description: 'Mixed record with some editorial bias',
        factors: { factChecking: 70, editorialStandards: 71, transparency: 63 },
    },
    'politico': {
        score: 'medium-high',
        rating: 80,
        label: 'High',
        color: '#3b82f6',
        description: 'Good political coverage with strong sourcing',
        factors: { factChecking: 82, editorialStandards: 81, transparency: 77 },
    },
    'axios': {
        score: 'medium-high',
        rating: 80,
        label: 'High',
        color: '#3b82f6',
        description: 'Concise reporting with good fact-checking',
        factors: { factChecking: 82, editorialStandards: 80, transparency: 78 },
    },
    'the hill': {
        score: 'medium-high',
        rating: 78,
        label: 'High',
        color: '#3b82f6',
        description: 'Generally reliable political coverage',
        factors: { factChecking: 79, editorialStandards: 80, transparency: 75 },
    },
    'usa today': {
        score: 'medium-high',
        rating: 78,
        label: 'High',
        color: '#3b82f6',
        description: 'Generally reliable mainstream reporting',
        factors: { factChecking: 80, editorialStandards: 78, transparency: 76 },
    },
    'abc news': {
        score: 'medium-high',
        rating: 80,
        label: 'High',
        color: '#3b82f6',
        description: 'Reliable broadcast journalism',
        factors: { factChecking: 82, editorialStandards: 81, transparency: 77 },
    },
    'cbs news': {
        score: 'medium-high',
        rating: 80,
        label: 'High',
        color: '#3b82f6',
        description: 'Reliable broadcast journalism',
        factors: { factChecking: 82, editorialStandards: 81, transparency: 77 },
    },
    'nbc news': {
        score: 'medium-high',
        rating: 80,
        label: 'High',
        color: '#3b82f6',
        description: 'Reliable broadcast journalism',
        factors: { factChecking: 82, editorialStandards: 81, transparency: 77 },
    },

    // Mixed/Lower Credibility
    'breitbart': {
        score: 'mixed',
        rating: 45,
        label: 'Mixed',
        color: '#ef4444',
        description: 'Frequent issues with factual accuracy',
        factors: { factChecking: 40, editorialStandards: 48, transparency: 47 },
    },
    'huffpost': {
        score: 'medium',
        rating: 70,
        label: 'Medium',
        color: '#f59e0b',
        description: 'Opinion-heavy with some factual reporting',
        factors: { factChecking: 72, editorialStandards: 70, transparency: 68 },
    },
    'huffington post': {
        score: 'medium',
        rating: 70,
        label: 'Medium',
        color: '#f59e0b',
        description: 'Opinion-heavy with some factual reporting',
        factors: { factChecking: 72, editorialStandards: 70, transparency: 68 },
    },
    'newsmax': {
        score: 'mixed',
        rating: 48,
        label: 'Mixed',
        color: '#ef4444',
        description: 'Significant issues with factual accuracy',
        factors: { factChecking: 45, editorialStandards: 50, transparency: 49 },
    },
    'the daily caller': {
        score: 'mixed',
        rating: 55,
        label: 'Mixed',
        color: '#ef4444',
        description: 'Mixed record on factual accuracy',
        factors: { factChecking: 52, editorialStandards: 58, transparency: 55 },
    },

    // Tech Sources
    'techcrunch': {
        score: 'medium-high',
        rating: 75,
        label: 'High',
        color: '#3b82f6',
        description: 'Reliable tech journalism',
        factors: { factChecking: 77, editorialStandards: 76, transparency: 72 },
    },
    'the verge': {
        score: 'medium-high',
        rating: 75,
        label: 'High',
        color: '#3b82f6',
        description: 'Reliable tech journalism',
        factors: { factChecking: 76, editorialStandards: 77, transparency: 72 },
    },
    'wired': {
        score: 'medium-high',
        rating: 78,
        label: 'High',
        color: '#3b82f6',
        description: 'Strong tech and science journalism',
        factors: { factChecking: 80, editorialStandards: 79, transparency: 75 },
    },
    'ars technica': {
        score: 'medium-high',
        rating: 80,
        label: 'High',
        color: '#3b82f6',
        description: 'Excellent technical journalism',
        factors: { factChecking: 82, editorialStandards: 81, transparency: 77 },
    },
};

const DEFAULT_CREDIBILITY: CredibilityInfo = {
    score: 'unknown',
    rating: 50,
    label: 'Unknown',
    color: '#9ca3af',
    description: 'No credibility rating available',
    factors: { factChecking: 50, editorialStandards: 50, transparency: 50 },
};

/**
 * Gets credibility information for a news source
 */
export function getCredibilityInfo(sourceName: string): CredibilityInfo {
    const normalized = sourceName.toLowerCase().trim();
    return CREDIBILITY_MAP[normalized] || DEFAULT_CREDIBILITY;
}

/**
 * Gets a simple credibility tier (high/medium/low)
 */
export function getCredibilityTier(sourceName: string): 'high' | 'medium' | 'low' | 'unknown' {
    const info = getCredibilityInfo(sourceName);
    if (info.rating >= 80) return 'high';
    if (info.rating >= 60) return 'medium';
    if (info.rating < 60 && info.score !== 'unknown') return 'low';
    return 'unknown';
}

/**
 * Sorts sources by credibility rating
 */
export function sortByCredibility(sources: string[]): string[] {
    return [...sources].sort((a, b) => {
        const ratingA = getCredibilityInfo(a).rating;
        const ratingB = getCredibilityInfo(b).rating;
        return ratingB - ratingA; // Higher rating first
    });
}
