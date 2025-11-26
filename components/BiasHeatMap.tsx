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
        <div className="bg-white dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide mb-3">Political Bias by Source</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-4 px-4 py-2 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-[#5458F7]"></span>
                            <span className="text-[#1c1c1c] dark:text-white font-bold uppercase tracking-wider">Left: {stats.left}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-[#71767A]"></span>
                            <span className="text-[#1c1c1c] dark:text-white font-bold uppercase tracking-wider">Center: {stats.center}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-[#FA3E3E]"></span>
                            <span className="text-[#1c1c1c] dark:text-white font-bold uppercase tracking-wider">Right: {stats.right}</span>
                        </div>
                        {stats.unknown > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 bg-[#71767A] opacity-50"></span>
                                <span className="text-[#71767A] font-bold uppercase tracking-wider">Unknown: {stats.unknown}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Heat Map Grid */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {heatMapData.map((cell, index) => {
                    const biasInfo = getBiasInfo(cell.bias);
                    return (
                        <motion.div
                            key={cell.source}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-4 transition-all cursor-pointer border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00D166] bg-[#F5F5F5] dark:bg-[#1c1c1c]"
                            style={{ borderLeftColor: biasInfo.color, borderLeftWidth: '4px' }}
                            onMouseEnter={() => setSelectedCell(cell)}
                            onMouseLeave={() => setSelectedCell(null)}
                        >
                            {/* Source Name */}
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-[#1c1c1c] dark:text-white truncate uppercase tracking-wide">
                                    {cell.source}
                                </h4>
                            </div>

                            {/* Bias Label */}
                            <div className="flex items-baseline gap-2">
                                <span
                                    className="text-sm font-bold uppercase tracking-wider"
                                    style={{ color: biasInfo.color }}
                                >
                                    {biasInfo.label}
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
                                    <div className="font-bold text-[#1c1c1c] dark:text-white mb-1 uppercase tracking-wide">{cell.source}</div>
                                    <div className="text-[#71767A] mb-2 italic">{biasInfo.description}</div>
                                    <div className="font-bold text-[#1c1c1c] dark:text-white mb-1 uppercase tracking-wider">Articles:</div>
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
                    <span className="uppercase tracking-wider">Political bias ratings based on media analysis research</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="w-20 h-3 bg-gradient-to-r from-[#5458F7] via-[#71767A] to-[#FA3E3E]" />
                        <span className="uppercase tracking-wider">Left → Center → Right</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
