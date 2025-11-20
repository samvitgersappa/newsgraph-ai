'use client';

import { Article } from '@/lib/news-service';
import { NewsCard } from './NewsCard';
import { motion } from 'framer-motion';

interface NewsFeedProps {
    articles: Article[];
    onArticleSelect: (article: Article) => void;
}

export function NewsFeed({ articles, onArticleSelect }: NewsFeedProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {articles.map((article, index) => (
                <motion.div
                    key={article.url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <NewsCard article={article} onClick={onArticleSelect} />
                </motion.div>
            ))}
        </div>
    );
}
