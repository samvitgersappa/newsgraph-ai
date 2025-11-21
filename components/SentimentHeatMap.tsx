'use client';

import { Article } from '@/lib/news-service';
import { analyzeArticleSentiment, getSentimentGradient } from '@/lib/sentiment-analyzer';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { scaleLinear } from 'd3-scale';

interface SentimentHeatMapProps {
    articles: Article[];
}

interface HeatMapCell {
    source: string;
    sentiment: number;
    count: number;
    articles: Article[];
}

export function SentimentHeatMap({ articles }: SentimentHeatMapProps) {
    const [selectedCell, setSelectedCell] = useState<HeatMapCell | null>(null);

    // Group articles by source and calculate average sentiment
    const heatMapData = useMemo(() => {
        const sourceMap = new Map<string, Article[]>();

        articles.forEach(article => {
            const source = article.source.name;
            if (!sourceMap.has(source)) {
                sourceMap.set(source, []);
            }
            sourceMap.get(source)!.push(article);
        });

        const data: HeatMapCell[] = [];
        sourceMap.forEach((sourceArticles, source) => {
            const sentiments = sourceArticles.map(a => analyzeArticleSentiment(a).comparative);
            const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

            data.push({
                source,
                sentiment: avgSentiment,
                count: sourceArticles.length,
                articles: sourceArticles,
            });
        });

        // Sort by sentiment (most negative to most positive)
        return data.sort((a, b) => a.sentiment - b.sentiment);
    }, [articles]);

    // Calculate overall statistics
    const stats = useMemo(() => {
        const allSentiments = articles.map(a => analyzeArticleSentiment(a));
        const avgSentiment = allSentiments.reduce((sum, s) => sum + s.comparative, 0) / allSentiments.length;
        const positive = allSentiments.filter(s => s.classification === 'positive').length;
        const negative = allSentiments.filter(s => s.classification === 'negative').length;
        const neutral = allSentiments.filter(s => s.classification === 'neutral').length;

        return { avgSentiment, positive, negative, neutral, total: articles.length };
    }, [articles]);

    const getTrendIcon = (sentiment: number) => {
        if (sentiment > 0.5) return <TrendingUp className="text-green-500" size={16} />;
        if (sentiment < -0.5) return <TrendingDown className="text-red-500" size={16} />;
        return <Minus className="text-zinc-400" size={16} />;
    };

    const getSentimentLabel = (sentiment: number) => {
        if (sentiment > 0.5) return 'Positive';
        if (sentiment < -0.5) return 'Negative';
        return 'Neutral';
    };

    const getSentimentColor = (score: number) => {
        if (score > 0.5) return '#22C55E'; // Green
        if (score < -0.5) return '#EF4444'; // Red
        return '#A1A1AA'; // Gray
    };

    return (
        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Sentiment by Source</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">Avg Score:</span>
                        <span className="font-mono font-bold" style={{ color: getSentimentColor(stats.avgSentiment) }}>
                            {stats.avgSentiment.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">{stats.positive}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">{stats.neutral}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">{stats.negative}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Heat Map Grid */}
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {heatMapData.map((cell, index) => {
                    const bgColor = getSentimentGradient(cell.sentiment) + '20';
                    const sentimentColor = getSentimentColor(cell.sentiment);
                    return (
                        <motion.div
                            key={cell.source}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-4 rounded-xl transition-all cursor-pointer hover:scale-105 border border-slate-200 dark:border-white/10 hover:shadow-lg"
                            style={{ backgroundColor: bgColor }}
                            onMouseEnter={() => setSelectedCell(cell)}
                            onMouseLeave={() => setSelectedCell(null)}
                        >
                            {/* Source Name */}
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {cell.source}
                                </h4>
                                {getTrendIcon(cell.sentiment)}
                            </div>

                            {/* Sentiment Score */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {cell.sentiment.toFixed(2)}
                                </span>
                                <span className="text-xs font-medium" style={{ color: sentimentColor }}>
                                    {getSentimentLabel(cell.sentiment)}
                                </span>
                            </div>

                            {/* Article Count */}
                            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                {cell.count} article{cell.count !== 1 ? 's' : ''}
                            </div>

                            {/* Hover Tooltip */}
                            {selectedCell === cell && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute left-0 right-0 top-full mt-2 z-20 p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl text-xs"
                                >
                                    <div className="font-bold text-slate-900 dark:text-white mb-2">{cell.source} Articles:</div>
                                    <ul className="space-y-1 max-h-32 overflow-y-auto text-slate-600 dark:text-zinc-400">
                                        {cell.articles.slice(0, 5).map((article, i) => (
                                            <li key={i} className="truncate">
                                                • {article.title}
                                            </li>
                                        ))}
                                        {cell.articles.length > 5 && (
                                            <li className="opacity-60">+ {cell.articles.length - 5} more</li>
                                        )}
                                    </ul>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                    <Info size={14} />
                    <span>Color intensity indicates sentiment strength</span>
                    <div className="flex items-center gap-1 ml-auto">
                        <div className="w-16 h-3 rounded-full bg-gradient-to-r from-red-500 via-zinc-400 to-green-500" />
                        <span className="ml-2">Negative → Neutral → Positive</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
