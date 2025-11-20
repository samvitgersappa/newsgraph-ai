'use client';

import { Article } from '@/lib/news-service';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
    article: Article;
    onClick: (article: Article) => void;
}

import { Spotlight } from './Spotlight';

export function NewsCard({ article, onClick }: NewsCardProps) {
    return (
        <motion.div
            layoutId={`card-${article.url}`}
            onClick={() => onClick(article)}
            className="group cursor-pointer h-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Spotlight
                className="h-full p-5 transition-colors bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-white/20 shadow-sm hover:shadow-md dark:shadow-none"
                spotlightColor="rgba(59, 130, 246, 0.1)"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                        <span className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-full border border-zinc-200 dark:border-white/5 font-medium">
                            <User size={10} />
                            {article.source.name}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                    </h3>

                    {article.urlToImage && (
                        <div className="relative h-40 w-full overflow-hidden rounded-lg mb-4 ring-1 ring-zinc-200 dark:ring-white/10">
                            <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                    )}

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 flex-grow leading-relaxed">
                        {article.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
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
