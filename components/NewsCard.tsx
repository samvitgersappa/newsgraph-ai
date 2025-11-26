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
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <Spotlight
                className="h-full p-0 transition-all bg-white dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00D166] dark:hover:border-[#00D166] shadow-none hover:shadow-lg duration-300"
                spotlightColor="rgba(0, 209, 102, 0.1)"
            >
                <div className="flex flex-col h-full">
                    {/* Image */}
                    {article.urlToImage && (
                        <div className="relative h-48 w-full overflow-hidden">
                            <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* The Verge style category badge */}
                            <div className="absolute top-3 left-3">
                                <span
                                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                                    style={{
                                        backgroundColor: biasInfo.color,
                                        color: '#1c1c1c',
                                    }}
                                >
                                    {biasInfo.label}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="p-5 flex flex-col flex-grow">
                        {/* Source and time */}
                        <div className="flex items-center justify-between text-xs mb-3 text-[#71767A]">
                            <div className="flex items-center gap-2">
                                <span className="font-bold uppercase tracking-wider text-[#00D166]">
                                    {article.source.name}
                                </span>
                            </div>
                            <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-[#1c1c1c] dark:text-white mb-3 line-clamp-3 group-hover:text-[#00D166] transition-colors leading-tight tracking-tight">
                            {article.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-[#71767A] line-clamp-2 mb-4 flex-grow leading-relaxed">
                            {article.description}
                        </p>

                        {/* Footer */}
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#E7E7E7] dark:border-[#3a3a3a]">
                            <div className="flex items-center gap-2">
                                <span
                                    className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-2"
                                    style={{
                                        borderColor: sentiment.classification === 'positive' ? '#00D166' : sentiment.classification === 'negative' ? '#FA3E3E' : '#71767A',
                                        color: sentiment.classification === 'positive' ? '#00D166' : sentiment.classification === 'negative' ? '#FA3E3E' : '#71767A',
                                    }}
                                >
                                    {sentiment.emoji} {sentiment.classification}
                                </span>
                            </div>
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs font-bold text-[#00D166] hover:text-[#00E676] transition-colors uppercase tracking-wider"
                            >
                                Read <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                </div>
            </Spotlight>
        </motion.div>
    );
}
