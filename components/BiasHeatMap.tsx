'use client';

import { Article } from '@/lib/news-service';
import { getBiasRating, getBiasInfo, BiasRating } from '@/lib/bias-detector';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface BiasHeatMapProps {
    articles: Article[];
}

interface HeatMapCell {
    source: string;
    bias: BiasRating;
    count: number;
    articles: Article[];
}

export function BiasHeatMap({ articles }: BiasHeatMapProps) {
    const [selectedCell, setSelectedCell] = useState<HeatMapCell | null>(null);

    // Group articles by source and get bias rating
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
            const bias = getBiasRating(source);

            data.push({
                source,
                bias,
                count: sourceArticles.length,
                articles: sourceArticles,
            });
        });

        // Sort by bias rating (left to right)
        const biasOrder: BiasRating[] = ['left', 'center-left', 'center', 'center-right', 'right', 'unknown'];
        return data.sort((a, b) => biasOrder.indexOf(a.bias) - biasOrder.indexOf(b.bias));
    }, [articles]);

    // Calculate overall statistics
    const stats = useMemo(() => {
        const biasCounts: Record<string, number> = {
            left: 0,
            'center-left': 0,
            center: 0,
            'center-right': 0,
            right: 0,
            unknown: 0,
        };

        articles.forEach(article => {
            const bias = getBiasRating(article.source.name);
            biasCounts[bias]++;
        });

        // Simplified counts for display
        const leftTotal = biasCounts.left + biasCounts['center-left'];
        const centerTotal = biasCounts.center;
        const rightTotal = biasCounts.right + biasCounts['center-right'];
        const unknownTotal = biasCounts.unknown;

        return {
            left: leftTotal,
            center: centerTotal,
            right: rightTotal,
            unknown: unknownTotal,
            total: articles.length
        };
    }, [articles]);

    return (
        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Political Bias by Source</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">Left: {stats.left}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">Center: {stats.center}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">Right: {stats.right}</span>
                        </div>
                        {stats.unknown > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                                <span className="text-slate-700 dark:text-zinc-300 font-medium">Unknown: {stats.unknown}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Heat Map Grid */}
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {heatMapData.map((cell, index) => {
                    const biasInfo = getBiasInfo(cell.bias);
                    const bgColor = biasInfo.color + '20'; // Add transparency
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
                            </div>

                            {/* Bias Label */}
                            <div className="flex items-baseline gap-2">
                                <span
                                    className="text-lg font-bold"
                                    style={{ color: biasInfo.color }}
                                >
                                    {biasInfo.label}
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
                                    <div className="font-bold text-slate-900 dark:text-white mb-1">{cell.source}</div>
                                    <div className="text-slate-600 dark:text-zinc-400 mb-2 italic">{biasInfo.description}</div>
                                    <div className="font-semibold text-slate-900 dark:text-white mb-1">Articles:</div>
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
                    <span>Political bias ratings based on media analysis research</span>
                    <div className="flex items-center gap-1 ml-auto">
                        <div className="w-16 h-3 rounded-full bg-gradient-to-r from-blue-500 via-zinc-400 to-red-500" />
                        <span className="ml-2">Left → Center → Right</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
