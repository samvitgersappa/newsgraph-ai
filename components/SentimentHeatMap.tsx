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
        if (sentiment > 0.5) return <TrendingUp className="text-[#00D166]" size={16} />;
        if (sentiment < -0.5) return <TrendingDown className="text-[#FA3E3E]" size={16} />;
        return <Minus className="text-[#71767A]" size={16} />;
    };

    const getSentimentLabel = (sentiment: number) => {
        if (sentiment > 0.5) return 'Positive';
        if (sentiment < -0.5) return 'Negative';
        return 'Neutral';
    };

    const getSentimentColor = (score: number) => {
        if (score > 0.5) return '#00D166'; // Green
        if (score < -0.5) return '#FA3E3E'; // Red
        return '#71767A'; // Gray
    };

    return (
        <div className="bg-white dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[#1c1c1c] dark:text-white mb-3 uppercase tracking-wide">Sentiment by Source</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                        <span className="font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wider">Avg Score:</span>
                        <span className="font-mono font-bold" style={{ color: getSentimentColor(stats.avgSentiment) }}>
                            {stats.avgSentiment.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-2 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-[#00D166]"></span>
                            <span className="text-[#1c1c1c] dark:text-white font-bold">{stats.positive}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-[#71767A]"></span>
                            <span className="text-[#1c1c1c] dark:text-white font-bold">{stats.neutral}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-[#FA3E3E]"></span>
                            <span className="text-[#1c1c1c] dark:text-white font-bold">{stats.negative}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Heat Map Grid */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {heatMapData.map((cell, index) => {
                    const sentimentColor = getSentimentColor(cell.sentiment);
                    return (
                        <motion.div
                            key={cell.source}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-4 transition-all cursor-pointer border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00D166] bg-[#F5F5F5] dark:bg-[#1c1c1c]"
                            style={{ borderLeftColor: sentimentColor, borderLeftWidth: '4px' }}
                            onMouseEnter={() => setSelectedCell(cell)}
                            onMouseLeave={() => setSelectedCell(null)}
                        >
                            {/* Source Name */}
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-[#1c1c1c] dark:text-white truncate uppercase tracking-wide">
                                    {cell.source}
                                </h4>
                                {getTrendIcon(cell.sentiment)}
                            </div>

                            {/* Sentiment Score */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-[#1c1c1c] dark:text-white">
                                    {cell.sentiment.toFixed(2)}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: sentimentColor }}>
                                    {getSentimentLabel(cell.sentiment)}
                                </span>
                            </div>

                            {/* Article Count */}
                            <div className="text-xs text-[#71767A] mt-1 uppercase tracking-wider">
                                {cell.count} article{cell.count !== 1 ? 's' : ''}
                            </div>

                            {/* Hover Tooltip */}
                            {selectedCell === cell && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute left-0 right-0 top-full mt-2 z-20 p-4 bg-white dark:bg-[#2a2a2a] border-2 border-[#00D166] shadow-xl text-xs"
                                >
                                    <div className="font-bold text-[#1c1c1c] dark:text-white mb-2 uppercase tracking-wide">{cell.source} Articles:</div>
                                    <ul className="space-y-1 max-h-32 overflow-y-auto text-[#71767A]">
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
            <div className="mt-6 pt-4 border-t-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                <div className="flex items-center gap-2 text-xs text-[#71767A]">
                    <Info size={14} />
                    <span className="uppercase tracking-wider">Color intensity indicates sentiment strength</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="w-20 h-3 bg-gradient-to-r from-[#FA3E3E] via-[#71767A] to-[#00D166]" />
                        <span className="uppercase tracking-wider">Negative → Neutral → Positive</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
