'use client';

import { Article } from '@/lib/news-service';
import { NewsFeed } from '@/components/NewsFeed';
import { DeepDiveSidebar } from '@/components/DeepDiveSidebar';
import { PersonalBriefing } from '@/components/PersonalBriefing';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface ClientPageProps {
    initialArticles: Article[];
}

export function ClientPage({ initialArticles }: ClientPageProps) {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    return (
        <div className="min-h-screen relative overflow-hidden bg-zinc-50 dark:bg-black selection:bg-blue-500/30 transition-colors duration-300">
            {/* Grid Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20"
                style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
            />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-20"
                style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
            />

            {/* Dynamic Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[150px] animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                <header className="mb-16 text-center relative">
                    <div className="absolute right-0 top-0">
                        <ThemeToggle />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-xs font-medium text-zinc-600 dark:text-zinc-400 shadow-sm"
                    >
                        ✨ AI-Powered News Intelligence
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-white/90 dark:to-white/50 bg-clip-text text-transparent mb-6 tracking-tight"
                    >
                        NewsGraph AI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed"
                    >
                        Navigate the noise with <span className="text-blue-600 dark:text-blue-400 font-medium">Deep Dive Context</span> and <span className="text-purple-600 dark:text-purple-400 font-medium">Personalized Briefings</span>.
                    </motion.p>
                </header>

                <section className="mb-20">
                    <PersonalBriefing />
                </section>

                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1 bg-blue-500 rounded-full" />
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Top Headlines</h2>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-500 dark:text-zinc-400 shadow-sm">
                            Live Updates
                        </div>
                    </div>
                    <NewsFeed
                        articles={initialArticles}
                        onArticleSelect={setSelectedArticle}
                    />
                </section>

                <DeepDiveSidebar
                    article={selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                />
            </div>
        </div>
    );
}
