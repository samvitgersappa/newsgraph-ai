'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    Search, 
    FileText, 
    BarChart3, 
    TrendingUp, 
    Clock, 
    Shield,
    Zap,
    ChevronRight,
    Loader2,
    Target,
    Sparkles,
    Database,
    Network,
    Hash
} from 'lucide-react';
import { getRAGScoredResults, getRAGStatistics } from '@/app/actions';

interface RAGResult {
    content: string;
    metadata: Record<string, any>;
    score: number;
    breakdown: {
        titleMatch: number;
        contentMatch: number;
        phraseMatch: number;
        recency: number;
        sourceCredibility: number;
    };
}

interface RAGStats {
    totalDocuments: number;
    uniqueTerms: number;
    avgEntitiesPerDoc: number;
    sources: string[];
}

export function RAGInsightsPanel() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RAGResult[]>([]);
    const [stats, setStats] = useState<RAGStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedResult, setSelectedResult] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        // Load initial stats
        getRAGStatistics().then(setStats);
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const scoredResults = await getRAGScoredResults(query, 8);
            setResults(scoredResults);
            setSelectedResult(scoredResults.length > 0 ? 0 : null);
        } catch (error) {
            console.error('RAG search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-[#00dc82]';
        if (score >= 0.6) return 'text-[#FFD700]';
        if (score >= 0.4) return 'text-[#FF8C00]';
        return 'text-[#FF4444]';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 0.8) return 'bg-[#00dc82]';
        if (score >= 0.6) return 'bg-[#FFD700]';
        if (score >= 0.4) return 'bg-[#FF8C00]';
        return 'bg-[#FF4444]';
    };

    const scoreLabels: Record<keyof RAGResult['breakdown'], { label: string; icon: React.ReactNode; description: string }> = {
        titleMatch: { 
            label: 'Title Match', 
            icon: <FileText size={14} />,
            description: 'How well the query matches the article title - the strongest relevance signal'
        },
        contentMatch: { 
            label: 'Content Match', 
            icon: <Hash size={14} />,
            description: 'Term frequency in article description and content body'
        },
        phraseMatch: { 
            label: 'Phrase Match', 
            icon: <Target size={14} />,
            description: 'Exact multi-word phrase matches (e.g., "climate change" as one phrase)'
        },
        recency: { 
            label: 'Recency', 
            icon: <Clock size={14} />,
            description: 'Fresher articles score higher, with decay over time'
        },
        sourceCredibility: { 
            label: 'Source Credibility', 
            icon: <Shield size={14} />,
            description: 'Pre-defined credibility scores (Reuters: 1.0, The Verge: 0.85, etc.)'
        },
    };

    return (
        <div className="bg-[#2a2a2a] border-2 border-[#3a3a3a] p-6">
            {/* Header with Stats */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#00dc82] flex items-center justify-center">
                        <Brain className="w-7 h-7 text-[#1c1c1c]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            RAG Engine Insights
                            <Sparkles className="w-4 h-4 text-[#00dc82]" />
                        </h2>
                        <p className="text-xs text-[#71767A] uppercase tracking-wider">
                            Multi-signal document retrieval analysis
                        </p>
                    </div>
                </div>

                {stats && (
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{stats.totalDocuments}</p>
                            <p className="text-[10px] text-[#71767A] uppercase tracking-wider">Indexed Docs</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-[#00dc82]">{stats.uniqueTerms.toLocaleString()}</p>
                            <p className="text-[10px] text-[#71767A] uppercase tracking-wider">Unique Terms</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{stats.avgEntitiesPerDoc.toFixed(1)}</p>
                            <p className="text-[10px] text-[#71767A] uppercase tracking-wider">Avg Entities</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Input */}
            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71767A]" size={18} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter a query to see RAG scoring breakdown..."
                        className="w-full bg-[#1c1c1c] border-2 border-[#3a3a3a] focus:border-[#00dc82] text-white pl-12 pr-4 py-3 outline-none transition-colors"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="px-6 py-3 bg-[#00dc82] hover:bg-[#00ff99] text-[#1c1c1c] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            <Zap size={18} />
                            Analyze
                        </>
                    )}
                </button>
            </div>

            {/* How It Works Toggle */}
            <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-2 text-xs text-[#71767A] hover:text-[#00dc82] mb-4 uppercase tracking-wider transition-colors"
            >
                <ChevronRight size={14} className={`transition-transform ${showExplanation ? 'rotate-90' : ''}`} />
                How the scoring works
            </button>

            <AnimatePresence>
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-[#1c1c1c] border-l-4 border-[#00dc82] text-sm"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(scoreLabels).map(([key, { label, icon, description }]) => (
                                <div key={key} className="group">
                                    <div className="flex items-center gap-2 text-white mb-1">
                                        <span className="text-[#00dc82]">{icon}</span>
                                        <span className="font-bold text-xs uppercase tracking-wider">{label}</span>
                                    </div>
                                    <p className="text-[10px] text-[#71767A] leading-relaxed">{description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
                            <p className="text-xs text-[#a0a0a0]">
                                <strong className="text-white">Final Score Formula:</strong>{' '}
                                <span className="font-mono text-[#00dc82]">
                                    (Title × 0.40) + (Content × 0.25) + (Phrase × 0.15) + (Recency × 0.10) + (Credibility × 0.10)
                                </span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            {results.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Results List */}
                    <div className="lg:col-span-2 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {results.map((result, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedResult(index)}
                                className={`p-4 cursor-pointer transition-all ${
                                    selectedResult === index
                                        ? 'bg-[#1c1c1c] border-2 border-[#00dc82]'
                                        : 'bg-[#1c1c1c] border-2 border-[#3a3a3a] hover:border-[#71767A]'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-[#00dc82] font-mono uppercase tracking-wider">
                                            {result.metadata.source}
                                        </span>
                                        <h4 className="font-bold text-white text-sm line-clamp-2 mt-1">
                                            {result.metadata.title}
                                        </h4>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                                            {(result.score * 100).toFixed(0)}
                                        </div>
                                        <div className="text-[10px] text-[#71767A] uppercase tracking-wider">Score</div>
                                    </div>
                                </div>

                                {/* Mini Score Bars */}
                                <div className="flex gap-1 mt-3">
                                    {Object.entries(result.breakdown).map(([key, value]) => (
                                        <div key={key} className="flex-1">
                                            <div className="h-1 bg-[#3a3a3a]">
                                                <div 
                                                    className={`h-full ${getScoreBarColor(value)}`}
                                                    style={{ width: `${value * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Selected Result Details */}
                    {selectedResult !== null && results[selectedResult] && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#1c1c1c] border-2 border-[#00dc82] p-4"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="text-[#00dc82]" size={18} />
                                <span className="text-sm font-bold text-white uppercase tracking-wider">Score Breakdown</span>
                            </div>

                            <div className="text-center mb-6 py-4 border-b border-[#3a3a3a]">
                                <div className={`text-5xl font-bold ${getScoreColor(results[selectedResult].score)}`}>
                                    {(results[selectedResult].score * 100).toFixed(0)}%
                                </div>
                                <p className="text-xs text-[#71767A] mt-2 uppercase tracking-wider">Relevance Score</p>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(results[selectedResult].breakdown).map(([key, value]) => {
                                    const { label, icon } = scoreLabels[key as keyof typeof scoreLabels];
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
                                                    <span className="text-[#00dc82]">{icon}</span>
                                                    <span className="uppercase tracking-wider">{label}</span>
                                                </div>
                                                <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                                                    {(value * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-[#3a3a3a]">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${value * 100}%` }}
                                                    className={`h-full ${getScoreBarColor(value)}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
                                <a
                                    href={results[selectedResult].metadata.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-2 text-center text-[#00dc82] hover:bg-[#00dc82] hover:text-[#1c1c1c] border-2 border-[#00dc82] font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                    View Article
                                </a>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {results.length === 0 && !loading && query && (
                <div className="text-center py-12">
                    <Database size={48} className="mx-auto mb-4 text-[#3a3a3a]" />
                    <p className="text-[#71767A] uppercase tracking-wider text-sm">No results found</p>
                    <p className="text-[#3a3a3a] text-xs mt-2">Try a different query or index more documents</p>
                </div>
            )}

            {/* Initial State */}
            {results.length === 0 && !loading && !query && (
                <div className="text-center py-12">
                    <Network size={48} className="mx-auto mb-4 text-[#3a3a3a]" />
                    <p className="text-[#71767A] uppercase tracking-wider text-sm">Enter a query to analyze RAG scoring</p>
                    <p className="text-[#3a3a3a] text-xs mt-2">See how documents are ranked with multi-signal scoring</p>
                </div>
            )}
        </div>
    );
}
