'use client';

import { Article } from '@/lib/news-service';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { analyzeArticleSentiment } from '@/lib/sentiment-analyzer';
import { getSourceBiasInfo } from '@/lib/bias-detector';
import { useMemo } from 'react';

interface NewsCardProps {
    article: Article;
    onClick: (article: Article) => void;
}

import { Spotlight } from './Spotlight';

export function NewsCard({ article, onClick }: NewsCardProps) {
    // Analyze sentiment and bias
    const sentiment = useMemo(() => analyzeArticleSentiment(article), [article]);
    const biasInfo = useMemo(() => getSourceBiasInfo(article.source.name), [article.source.name]);

    return (
        <motion.div
            layoutId={`card-${article.url}`}
            onClick={() => onClick(article)}
            className="group cursor-pointer h-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Spotlight
                className="h-full p-5 transition-all bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-white/20 shadow-md hover:shadow-xl dark:shadow-none hover:-translate-y-1 duration-300"
                spotlightColor="rgba(59, 130, 246, 0.15)"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5 font-medium">
                                <User size={10} />
                                {article.source.name}
                            </span>
                            <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                                style={{
                                    backgroundColor: biasInfo.color + '15',
                                    borderColor: biasInfo.color + '40',
                                    color: biasInfo.color,
                                }}
                                title={biasInfo.description}
                            >
                                {biasInfo.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="px-2.5 py-1 rounded-full border text-[10px] font-semibold"
                                style={{
                                    borderColor: sentiment.classification === 'positive' ? '#22c55e' : sentiment.classification === 'negative' ? '#ef4444' : '#9ca3af',
                                    backgroundColor: sentiment.classification === 'positive' ? '#22c55e15' : sentiment.classification === 'negative' ? '#ef444415' : '#9ca3af15',
                                    color: sentiment.classification === 'positive' ? '#16a34a' : sentiment.classification === 'negative' ? '#dc2626' : '#6b7280',
                                }}
                                title={`Sentiment: ${sentiment.comparative.toFixed(2)}`}
                            >
                                {sentiment.emoji} {sentiment.classification}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-500">
                                <Calendar size={12} />
                                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {article.title}
                    </h3>

                    {article.urlToImage && (
                        <div className="relative h-40 w-full overflow-hidden rounded-lg mb-4 ring-1 ring-slate-200 dark:ring-white/10">
                            <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-105"
                            />
                        </div>
                    )}

                    <p className="text-sm text-slate-700 dark:text-zinc-400 line-clamp-3 mb-4 flex-grow leading-relaxed">
                        {article.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse delay-75" />
                            <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse delay-150" />
                        </div>
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                        >
                            Read Source <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            </Spotlight>
        </motion.div>
    );
}
