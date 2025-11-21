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
                className="p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-white/20 transition-all hover:shadow-md group"
            >
                {/* Source Badge */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: biasInfo.color }}
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                        {article.source.name}
                    </span>
                    <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold border"
                        style={{
                            backgroundColor: biasInfo.color + '15',
                            borderColor: biasInfo.color + '40',
                            color: biasInfo.color,
                        }}
                    >
                        {biasInfo.label}
                    </span>
                    {credibilityInfo.score !== 'unknown' && (
                        <span
                            className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1"
                            style={{
                                backgroundColor: credibilityInfo.color + '15',
                                borderColor: credibilityInfo.color + '40',
                                color: credibilityInfo.color,
                            }}
                            title={`${credibilityInfo.description}\nFact-checking: ${credibilityInfo.factors.factChecking}/100\nEditorial: ${credibilityInfo.factors.editorialStandards}/100`}
                        >
                            <Award size={10} />
                            {credibilityInfo.label}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 line-clamp-3 leading-relaxed group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                </h4>

                {/* Description */}
                {article.description && (
                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 mb-3">
                        {article.description}
                    </p>
                )}

                {/* Read Link */}
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Read article <ExternalLink size={12} />
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
                <div className="sticky top-0 z-10 pb-4 bg-zinc-50 dark:bg-black">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: color }} />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300"
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
                        <div className="p-6 text-center bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                            <AlertCircle className="mx-auto mb-2 text-slate-400 dark:text-zinc-400" size={24} />
                            <p className="text-sm text-slate-600 dark:text-zinc-400">
                                No {bias} perspective articles found for this topic
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
                <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                <p className="text-zinc-600 dark:text-zinc-400">
                    Analyzing perspectives from multiple sources...
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
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            Multi-Perspective Analysis
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-zinc-400">
                            Viewing "{topic}" from {data.totalArticles} sources across the political spectrum
                        </p>
                    </div>
                </div>

                {/* Balance Chart */}
                <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Perspective Balance</h3>
                        <span className={`ml-auto text-xs px-2 py-1 rounded-full font-semibold ${balanceStats.dominantPerspective === 'balanced'
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                            }`}>
                            {balanceStats.dominantPerspective === 'balanced' ? '⚖️ Balanced' : `${balanceStats.dominantPerspective.charAt(0).toUpperCase() + balanceStats.dominantPerspective.slice(1)}-leaning`}
                        </span>
                    </div>

                    {/* Visual Bar Chart */}
                    <div className="space-y-3">
                        {[
                            { label: 'Left', percentage: balanceStats.leftPercentage, color: '#3b82f6' },
                            { label: 'Center', percentage: balanceStats.centerPercentage, color: '#9ca3af' },
                            { label: 'Right', percentage: balanceStats.rightPercentage, color: '#ef4444' },
                        ].map((item) => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.label}</span>
                                    <span className="text-slate-600 dark:text-zinc-400">{item.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats Summary */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-3 text-center">
                        <div>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {data.perspectives.left.articleCount}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-zinc-400">Left Articles</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                {data.perspectives.center.articleCount}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-zinc-400">Center Articles</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {data.perspectives.right.articleCount}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-zinc-400">Right Articles</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex gap-2 border-b border-zinc-200 dark:border-white/10">
                {(['left', 'center', 'right'] as const).map((bias) => {
                    const colors = {
                        left: '#3b82f6',
                        center: '#9ca3af',
                        right: '#ef4444',
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
                            className={`flex-1 py-3 text-sm transition-colors ${activeTab === bias
                                ? 'text-slate-900 dark:text-white border-b-2 font-semibold'
                                : 'text-slate-600 dark:text-zinc-400'
                                }`}
                            style={{
                                borderColor: activeTab === bias ? colors[bias] : 'transparent',
                            }}
                        >
                            {labels[bias]}
                        </button>
                    );
                })}
            </div>

            {/* Desktop: Three Columns */}
            <div className="hidden md:flex gap-6 overflow-x-auto pb-4">
                {renderPerspectiveColumn('left', 'Left Perspective', '#3b82f6')}
                {renderPerspectiveColumn('center', 'Center Perspective', '#9ca3af')}
                {renderPerspectiveColumn('right', 'Right Perspective', '#ef4444')}
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
                        {activeTab === 'left' && renderPerspectiveColumn('left', 'Left Perspective', '#3b82f6')}
                        {activeTab === 'center' && renderPerspectiveColumn('center', 'Center Perspective', '#9ca3af')}
                        {activeTab === 'right' && renderPerspectiveColumn('right', 'Right Perspective', '#ef4444')}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Info Footer */}
            <div className="mt-8 space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-blue-900 dark:text-blue-200">
                            <strong>About Political Bias Ratings:</strong> Source classifications (Left/Center/Right) are based on established media bias research from AllSides, Ad Fontes Media, and Pew Research Center. Bias ratings indicate editorial perspective and do not reflect factual accuracy.
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl shadow-sm">
                    <div className="flex items-start gap-3">
                        <Award className="text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-green-900 dark:text-green-200">
                            <strong>About Credibility Ratings:</strong> Credibility scores are based on fact-checking records, editorial standards, and transparency from Media Bias/Fact Check, NewsGuard, and the International Fact-Checking Network. Always verify important information across multiple sources.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
