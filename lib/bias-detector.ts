export type BiasRating = 'left' | 'center-left' | 'center' | 'center-right' | 'right' | 'unknown';

export interface BiasInfo {
    rating: BiasRating;
    label: string;
    color: string;
    description: string;
}

/**
 * Comprehensive bias mapping for major news sources
 * Based on media bias research from multiple sources including:
 * - AllSides Media Bias Ratings
 * - Ad Fontes Media Bias Chart
 * - Pew Research Center studies
 */
const BIAS_MAP: Record<string, BiasRating> = {
    // Left
    'msnbc': 'left',
    'huffpost': 'left',
    'huffington post': 'left',
    'the huffington post': 'left',
    'motherjones': 'left',
    'mother jones': 'left',
    'jacobin': 'left',
    'the nation': 'left',
    'democracy now': 'left',
    'alternet': 'left',
    'thinkprogress': 'left',

    // Center-Left
    'cnn': 'center-left',
    'the new york times': 'center-left',
    'nytimes': 'center-left',
    'new york times': 'center-left',
    'the washington post': 'center-left',
    'washington post': 'center-left',
    'npr': 'center-left',
    'the guardian': 'center-left',
    'politico': 'center-left',
    'slate': 'center-left',
    'vox': 'center-left',
    'the atlantic': 'center-left',
    'nbc news': 'center-left',
    'abc news': 'center-left',
    'cbs news': 'center-left',
    'time': 'center-left',
    'newsweek': 'center-left',

    // Center
    'reuters': 'center',
    'associated press': 'center',
    'ap news': 'center',
    'bbc': 'center',
    'bbc news': 'center',
    'the hill': 'center',
    'axios': 'center',
    'bloomberg': 'center',
    'marketwatch': 'center',
    'the economist': 'center',
    'usa today': 'center',
    'pbs': 'center',
    'c-span': 'center',
    'the independent': 'center',
    'financial times': 'center',

    // Center-Right
    'the wall street journal': 'center-right',
    'wall street journal': 'center-right',
    'wsj': 'center-right',
    'forbes': 'center-right',
    'the washington times': 'center-right',
    'washington times': 'center-right',
    'reason': 'center-right',
    'the dispatch': 'center-right',
    'national review': 'center-right',
    'the bulwark': 'center-right',

    // Right
    'fox news': 'right',
    'breitbart': 'right',
    'the daily caller': 'right',
    'daily caller': 'right',
    'the federalist': 'right',
    'townhall': 'right',
    'newsmax': 'right',
    'oann': 'right',
    'the blaze': 'right',
    'red state': 'right',
    'gateway pundit': 'right',
    'the american conservative': 'right',

    // Tech/General (mostly center)
    'techcrunch': 'center',
    'the verge': 'center',
    'wired': 'center',
    'ars technica': 'center',
    'engadget': 'center',
    'cnet': 'center',
    'gizmodo': 'center-left',
    'mashable': 'center-left',
    'zdnet': 'center',
    'venturebeat': 'center',
    'recode': 'center-left',
    'polygon': 'center-left',
    'kotaku': 'center-left',

    // International
    'al jazeera': 'center-left',
    'al jazeera english': 'center-left',
    'deutsche welle': 'center',
    'dw': 'center',
    'france 24': 'center',
    'rt': 'right', // State-controlled, often aligns with right-wing narratives in West
    'sputnik': 'right',
    'xinhua': 'center', // State-controlled
    'scmp': 'center',
    'south china morning post': 'center',
    'times of israel': 'center',
    'jerusalem post': 'center-right',
    'haaretz': 'left',
    'kyiv independent': 'center',
    'moscow times': 'center-left', // Independent Russian media
    'cbc': 'center-left',
    'cbc news': 'center-left',
    'global news': 'center',
    'ctv news': 'center',
    'toronto star': 'left',
    'national post': 'center-right',
    'the globe and mail': 'center-right',
    'sky news': 'center-right', // UK
    'sky news australia': 'right',
    'daily mail': 'right',
    'the sun': 'right',
    'the mirror': 'left',
    'the telegraph': 'right',
    'daily telegraph': 'right',
    'financial review': 'center-right',
    'smh': 'center-left',
    'sydney morning herald': 'center-left',
    'the age': 'center-left',
    'abc news (au)': 'center-left',

    // Other US
    'new york post': 'right',
    'nypost': 'right',
    'chicago tribune': 'center',
    'los angeles times': 'center-left',
    'la times': 'center-left',
    'sf chronicle': 'center-left',
    'boston globe': 'center-left',
    'miami herald': 'center',
    'dallas morning news': 'center-right',
    'houston chronicle': 'center-left',
    'denver post': 'center',
    'seattle times': 'center-left',
    'star tribune': 'center-left',
    'philadelphia inquirer': 'center-left',
    'atlanta journal-constitution': 'center',
    'detroit free press': 'center-left',
    'arizona republic': 'center-right',
    'las vegas review-journal': 'center-right',
    'san diego union-tribune': 'center-left',
    'orange county register': 'center-right',
    'new york daily news': 'left',
    'newsday': 'center',
    'christian science monitor': 'center',
    'cs monitor': 'center',
    'propublica': 'center-left',
    'the intercept': 'left',
    'democracy now!': 'left',
    'common dreams': 'left',
    'truthout': 'left',
    'raw story': 'left',
    'daily kos': 'left',
    'salon': 'left',
    'rolling stone': 'left',
    'vanity fair': 'left',
    'the new yorker': 'left',
    'esquire': 'left',
    'gq': 'left',
    'vogue': 'left',
    'teen vogue': 'left',
    'vice': 'left',
    'vice news': 'left',
    'buzzfeed': 'left',
    'buzzfeed news': 'left',
    'daily beast': 'left',
    'talking points memo': 'left',
    'crooks and liars': 'left',
    'palmer report': 'left',
    'wonkette': 'left',
    'jezebel': 'left',
    'the root': 'left',
    'theroot': 'left',
    'essence': 'left',
    'ebony': 'left',
    'bet': 'left',
    'advocate': 'left',
    'out': 'left',
    'pinknews': 'left',
    'auto blog': 'center',
    'jalopnik': 'left',
    'deadspin': 'left',
    'bleacher report': 'center',
    'espn': 'center',
    'sports illustrated': 'center',
    'cbssports': 'center',
    'nbcsports': 'center',
    'foxsports': 'center', // Sports division is less biased than news
    'mlb': 'center',
    'nfl': 'center',
    'nba': 'center',
    'nhl': 'center',
    'scientific american': 'center-left',
    'national geographic': 'center',
    'smithsonian': 'center',
    'popular science': 'center',
    'popular mechanics': 'center',
    'discover': 'center',
    'nature': 'center',
    'science': 'center',
    'new scientist': 'center',
    'phys.org': 'center',
    'space.com': 'center',
    'nasa': 'center',
    'jpl': 'center',
    'noaa': 'center',
    'cdc': 'center',
    'who': 'center',
    'nih': 'center',
    'fda': 'center',
    'epa': 'center',
    'fbi': 'center',
    'cia': 'center',
    'dod': 'center',
    'state department': 'center',
    'white house': 'center', // Official statements
    'congress': 'center', // Official records
    'supremecourt': 'center', // Official records
    'un': 'center',
    'united nations': 'center',
    'imf': 'center',
    'world bank': 'center',
    'wto': 'center',
    'nato': 'center',
    'eu': 'center',
    'european union': 'center',
    'oecd': 'center',
    'wef': 'center',
    'world economic forum': 'center',
    'ted': 'center-left',
    'project syndicate': 'center-left',
    'foreign affairs': 'center',
    'foreign policy': 'center-left',
    'the diplomat': 'center',
    'stratfor': 'center',
    'rand corporation': 'center',
    'brookings': 'center-left',
    'cato': 'center-right', // Libertarian
    'heritage foundation': 'right',
    'american enterprise institute': 'right',
    'center for american progress': 'left',
    'urban institute': 'center-left',
    'pew research center': 'center',
    'gallup': 'center',
    'rasmussen reports': 'center-right',
    'five thirty eight': 'center',
    'fivethirtyeight': 'center',
    'real clear politics': 'center-right',
    'realclearpolitics': 'center-right',
    'cook political report': 'center',
    'sabato\'s crystal ball': 'center',
    'inside elections': 'center',
    'ballotpedia': 'center',
    'opensecrets': 'center',
    'factcheck.org': 'center',
    'politifact': 'center-left',
    'snopes': 'center-left',
    'washington post fact checker': 'center-left',
    'cnn fact check': 'center-left',
    'ap fact check': 'center',
    'reuters fact check': 'center',
    'afp fact check': 'center',
    'full fact': 'center',
    'bbc reality check': 'center',
    'channel 4 factcheck': 'center',
    'the conversation': 'center-left',
    'medium': 'center-left', // Platform, but tends left
    'substack': 'center', // Platform, varies widely
    'youtube': 'center', // Platform
    'twitter': 'center', // Platform
    'facebook': 'center', // Platform
    'reddit': 'center-left', // Platform
    'google news': 'center', // Aggregator
    'apple news': 'center', // Aggregator
    'yahoo news': 'center', // Aggregator
    'msn': 'center', // Aggregator
    'flipboard': 'center', // Aggregator
    'smartnews': 'center', // Aggregator
    'newsbreak': 'center', // Aggregator
    'drudge report': 'right',
    'zerohedge': 'right',
    'infowars': 'right', // Extreme right
    'natural news': 'right', // Pseudoscience/Right
    'before it\'s news': 'right',
    'western journal': 'right',
    'wnd': 'right',
    'world net daily': 'right',
    'pj media': 'right',
    'twitchy': 'right',
    'hot air': 'right',
    'power line': 'right',
    'legal insurrection': 'right',
    'american thinker': 'right',
    'frontpage mag': 'right',
    'mrc': 'right',
    'media research center': 'right',
    'newsbusters': 'right',
    'cns news': 'right',
    'free beacon': 'right',
    'washington free beacon': 'right',
    'daily wire': 'right',
    'the daily wire': 'right',
    'daily signal': 'right',
    'heritage': 'right',
    'judicial watch': 'right',
    'project veritas': 'right',
    'epoch times': 'right',
    'the epoch times': 'right',
    'ntd': 'right',
    'one america news': 'right',
    'oan': 'right',
    'newsmax tv': 'right',
    'blaze media': 'right',
    'glenn beck': 'right',
    'rush limbaugh': 'right',
    'sean hannity': 'right',
    'tucker carlson': 'right',
    'mark levin': 'right',
    'ben shapiro': 'right',
    'steven crowder': 'right',
    'charlie kirk': 'right',
    'turning point usa': 'right',
    'prageru': 'right',
    'daily mail online': 'right',
    'mail online': 'right',
    'express': 'right',
    'daily express': 'right',
    'daily star': 'right',
    'breitbart news': 'right',
};

/**
 * Gets the bias rating for a news source
 * @param sourceName - Name of the news source
 * @returns Bias rating (defaults to 'unknown' if not found)
 */
export function getBiasRating(sourceName: string): BiasRating {
    if (!sourceName) return 'unknown';
    
    const normalized = sourceName.toLowerCase().trim();
    
    // Direct match
    if (BIAS_MAP[normalized]) {
        return BIAS_MAP[normalized];
    }

    // Partial match (check if any key is contained in the source name or vice versa)
    // This helps with variations like "The New York Times" vs "New York Times"
    for (const [key, rating] of Object.entries(BIAS_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            // Be careful with short common words, but keys are mostly specific
            if (key.length > 3) { 
                return rating;
            }
        }
    }

    return 'unknown';
}

/**
 * Gets comprehensive bias information for UI display
 * @param rating - Bias rating
 * @returns Bias info with color, label, and description
 */
export function getBiasInfo(rating: BiasRating): BiasInfo {
    const infoMap: Record<BiasRating, BiasInfo> = {
        'left': {
            rating: 'left',
            label: 'Left',
            color: '#3b82f6', // blue-500
            description: 'Generally supports progressive policies',
        },
        'center-left': {
            rating: 'center-left',
            label: 'Center-Left',
            color: '#60a5fa', // blue-400
            description: 'Leans left but maintains mainstream reporting',
        },
        'center': {
            rating: 'center',
            label: 'Center',
            color: '#9ca3af', // gray-400
            description: 'Balanced reporting with minimal bias',
        },
        'center-right': {
            rating: 'center-right',
            label: 'Center-Right',
            color: '#fb923c', // orange-400
            description: 'Leans right but maintains mainstream reporting',
        },
        'right': {
            rating: 'right',
            label: 'Right',
            color: '#ef4444', // red-500
            description: 'Generally supports conservative policies',
        },
        'unknown': {
            rating: 'unknown',
            label: 'Unknown',
            color: '#71717a', // zinc-500
            description: 'No bias rating available',
        },
    };

    return infoMap[rating];
}

/**
 * Gets bias info directly from source name
 * @param sourceName - Name of the news source
 * @returns Bias info
 */
export function getSourceBiasInfo(sourceName: string): BiasInfo {
    const rating = getBiasRating(sourceName);
    return getBiasInfo(rating);
}

/**
 * Groups sources by bias rating
 * @param sources - Array of source names
 * @returns Object with sources grouped by bias
 */
export function groupSourcesByBias(sources: string[]): Record<BiasRating, string[]> {
    const groups: Record<BiasRating, string[]> = {
        left: [],
        'center-left': [],
        center: [],
        'center-right': [],
        right: [],
        unknown: [],
    };

    sources.forEach(source => {
        const rating = getBiasRating(source);
        groups[rating].push(source);
    });

    return groups;
}

/**
 * Checks if a bias rating is on the left side of the spectrum
 * @param rating - Bias rating
 * @returns True if left or center-left
 */
export function isLeftBias(rating: BiasRating): boolean {
    return rating === 'left' || rating === 'center-left';
}

/**
 * Checks if a bias rating is on the right side of the spectrum
 * @param rating - Bias rating
 * @returns True if right or center-right
 */
export function isRightBias(rating: BiasRating): boolean {
    return rating === 'right' || rating === 'center-right';
}

/**
 * Gets a simplified bias category (left/center/right)
 * @param rating - Bias rating
 * @returns Simplified category
 */
export function getSimplifiedBias(rating: BiasRating): 'left' | 'center' | 'right' | 'unknown' {
    if (rating === 'left' || rating === 'center-left') return 'left';
    if (rating === 'right' || rating === 'center-right') return 'right';
    if (rating === 'center') return 'center';
    return 'unknown';
}
