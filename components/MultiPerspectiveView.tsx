'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMultiPerspectives, MultiPerspectiveResult } from '@/app/multi-perspective-actions';
import { getSourceBiasInfo } from '@/lib/bias-detector';
import { getCredibilityInfo } from '@/lib/credibility-ratings';
import { Article } from '@/lib/news-service';
import {
    ArrowRight,
    Loader2,
    AlertCircle,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    Award,
    Hash,
    BarChart3,
    TrendingUp,
} from 'lucide-react';

interface MultiPerspectiveViewProps {
    topic: string;
    onBack?: () => void;
}

export function MultiPerspectiveView({ topic, onBack }: MultiPerspectiveViewProps) {
    const [data, setData] = useState<MultiPerspectiveResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDifferences, setShowDifferences] = useState(false);
    const [activeTab, setActiveTab] = useState<'left' | 'center' | 'right'>('center');

    const fetchPerspectives = async () => {
        setLoading(true);
        try {
            const result = await getMultiPerspectives(topic, 5);
            setData(result);
        } catch (error) {
            console.error('Error fetching perspectives:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (topic) {
            fetchPerspectives();
        }
    }, [topic]);

    const renderArticleCard = (article: Article, index: number) => {
        const biasInfo = getSourceBiasInfo(article.source.name);
        const credibilityInfo = getCredibilityInfo(article.source.name);

        return (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-l-4 hover:border-[#00D166] transition-all group"
                style={{ borderLeftColor: biasInfo.color }}
            >
                {/* Source Badge */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs font-bold text-[#71767A] uppercase tracking-wider">
                        {article.source.name}
                    </span>
                    <span
                        className="text-xs px-2 py-0.5 font-bold uppercase tracking-wider"
                        style={{
                            backgroundColor: biasInfo.color,
                            color: '#1c1c1c',
                        }}
                    >
                        {biasInfo.label}
                    </span>
                    {credibilityInfo.score !== 'unknown' && (
                        <span
                            className="ml-auto text-xs px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1"
                            style={{
                                backgroundColor: credibilityInfo.color,
                                color: '#1c1c1c',
                            }}
                            title={`${credibilityInfo.description}\nFact-checking: ${credibilityInfo.factors.factChecking}/100\nEditorial: ${credibilityInfo.factors.editorialStandards}/100`}
                        >
                            <Award size={10} />
                            {credibilityInfo.label}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-[#1c1c1c] dark:text-white mb-2 line-clamp-3 leading-relaxed group-hover:text-[#00D166] transition-colors">
                    {article.title}
                </h4>

                {/* Description */}
                {article.description && (
                    <p className="text-xs text-[#71767A] line-clamp-2 mb-3">
                        {article.description}
                    </p>
                )}

                {/* Read Link */}
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#00D166] hover:text-[#00E676] font-bold uppercase tracking-wider"
                >
                    Read <ExternalLink size={12} />
                </a>
            </motion.div>
        );
    };

    const renderPerspectiveColumn = (
        bias: 'left' | 'center' | 'right',
        title: string,
        color: string
    ) => {
        const perspective = data?.perspectives[bias];
        if (!perspective) return null;

        return (
            <div className="flex-1 min-w-[300px]">
                <div className="sticky top-0 z-10 pb-4 bg-white dark:bg-[#1c1c1c]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-8" style={{ backgroundColor: color }} />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide">{title}</h3>
                            <p className="text-xs text-[#71767A] uppercase tracking-wider">
                                {perspective.articleCount} article{perspective.articleCount !== 1 ? 's' : ''} • {perspective.uniqueSourceCount} source{perspective.uniqueSourceCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Theme Tags */}
                    {perspective.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {perspective.themes.map((theme, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 font-bold bg-[#F5F5F5] dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] text-[#71767A] uppercase tracking-wider"
                                >
                                    <Hash size={10} />
                                    {theme}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {perspective.articles.length > 0 ? (
                        perspective.articles.map((article, index) => renderArticleCard(article, index))
                    ) : (
                        <div className="p-6 text-center bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                            <AlertCircle className="mx-auto mb-2 text-[#71767A]" size={24} />
                            <p className="text-sm text-[#71767A] uppercase tracking-wider">
                                No {bias} perspective articles found
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="animate-spin text-[#00D166] mb-4" size={40} />
                <p className="text-[#71767A] uppercase tracking-wider">
                    Analyzing perspectives...
                </p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { balanceStats } = data;

    return (
        <div className="space-y-6">
            {/* Header with Balance Visualization */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide mb-1">
                            Multi-Perspective Analysis
                        </h2>
                        <p className="text-sm text-[#71767A] uppercase tracking-wider">
                            Viewing "{topic}" from {data.totalArticles} sources
                        </p>
                    </div>
                </div>

                {/* Balance Chart */}
                <div className="bg-[#F5F5F5] dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-[#00D166]" size={20} />
                        <h3 className="text-sm font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wider">Perspective Balance</h3>
                        <span className={`ml-auto text-xs px-3 py-1 font-bold uppercase tracking-wider ${balanceStats.dominantPerspective === 'balanced'
                            ? 'bg-[#00D166] text-[#1c1c1c]'
                            : 'bg-[#FFD600] text-[#1c1c1c]'
                            }`}>
                            {balanceStats.dominantPerspective === 'balanced' ? '⚖️ Balanced' : `${balanceStats.dominantPerspective.charAt(0).toUpperCase() + balanceStats.dominantPerspective.slice(1)}-leaning`}
                        </span>
                    </div>

                    {/* Visual Bar Chart */}
                    <div className="space-y-3">
                        {[
                            { label: 'Left', percentage: balanceStats.leftPercentage, color: '#5458F7' },
                            { label: 'Center', percentage: balanceStats.centerPercentage, color: '#71767A' },
                            { label: 'Right', percentage: balanceStats.rightPercentage, color: '#FA3E3E' },
                        ].map((item) => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wider">{item.label}</span>
                                    <span className="text-[#71767A] font-bold">{item.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-[#E7E7E7] dark:bg-[#1c1c1c] overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats Summary */}
                    <div className="mt-4 pt-4 border-t-2 border-[#E7E7E7] dark:border-[#3a3a3a] grid grid-cols-3 gap-3 text-center">
                        <div>
                            <div className="text-lg font-bold text-[#5458F7]">
                                {data.perspectives.left.articleCount}
                            </div>
                            <div className="text-xs text-[#71767A] uppercase tracking-wider">Left</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-[#71767A]">
                                {data.perspectives.center.articleCount}
                            </div>
                            <div className="text-xs text-[#71767A] uppercase tracking-wider">Center</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-[#FA3E3E]">
                                {data.perspectives.right.articleCount}
                            </div>
                            <div className="text-xs text-[#71767A] uppercase tracking-wider">Right</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex gap-0 border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                {(['left', 'center', 'right'] as const).map((bias) => {
                    const colors = {
                        left: '#5458F7',
                        center: '#71767A',
                        right: '#FA3E3E',
                    };
                    const labels = {
                        left: 'Left',
                        center: 'Center',
                        right: 'Right',
                    };

                    return (
                        <button
                            key={bias}
                            onClick={() => setActiveTab(bias)}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-r-2 last:border-r-0 border-[#E7E7E7] dark:border-[#3a3a3a] ${activeTab === bias
                                ? 'text-white'
                                : 'text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white'
                                }`}
                            style={{
                                backgroundColor: activeTab === bias ? colors[bias] : 'transparent',
                            }}
                        >
                            {labels[bias]}
                        </button>
                    );
                })}
            </div>

            {/* Desktop: Three Columns */}
            <div className="hidden md:flex gap-6 overflow-x-auto pb-4">
                {renderPerspectiveColumn('left', 'Left Perspective', '#5458F7')}
                {renderPerspectiveColumn('center', 'Center Perspective', '#71767A')}
                {renderPerspectiveColumn('right', 'Right Perspective', '#FA3E3E')}
            </div>

            {/* Mobile: Active Tab Content */}
            <div className="md:hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'left' && renderPerspectiveColumn('left', 'Left Perspective', '#5458F7')}
                        {activeTab === 'center' && renderPerspectiveColumn('center', 'Center Perspective', '#71767A')}
                        {activeTab === 'right' && renderPerspectiveColumn('right', 'Right Perspective', '#FA3E3E')}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Info Footer */}
            <div className="mt-8 space-y-3">
                <div className="p-4 bg-[#5458F7]/10 border-l-4 border-[#5458F7]">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-[#5458F7] flex-shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-[#1c1c1c] dark:text-white">
                            <strong className="uppercase tracking-wider">About Political Bias Ratings:</strong> <span className="text-[#71767A]">Source classifications based on AllSides, Ad Fontes Media, and Pew Research. Bias ratings indicate editorial perspective, not factual accuracy.</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-[#00D166]/10 border-l-4 border-[#00D166]">
                    <div className="flex items-start gap-3">
                        <Award className="text-[#00D166] flex-shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-[#1c1c1c] dark:text-white">
                            <strong className="uppercase tracking-wider">About Credibility Ratings:</strong> <span className="text-[#71767A]">Credibility scores from Media Bias/Fact Check, NewsGuard, and IFCN. Always verify important information across multiple sources.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
