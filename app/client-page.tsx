'use client';

import { Article } from '@/lib/news-service';
import { NewsFeed } from '@/components/NewsFeed';
import { DeepDiveSidebar } from '@/components/DeepDiveSidebar';
import { PersonalBriefing } from '@/components/PersonalBriefing';
import { BiasHeatMap } from '@/components/BiasHeatMap';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ClientPageProps {
    initialArticles: Article[];
}

export function ClientPage({ initialArticles }: ClientPageProps) {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showBiasMap, setShowBiasMap] = useState(true);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-black dark:via-black dark:to-black selection:bg-blue-500/30 transition-colors duration-300">
            {/* Grid Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Dynamic Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300/30 dark:bg-blue-600/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-300/30 dark:bg-purple-600/10 blur-[150px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-cyan-200/20 dark:bg-cyan-600/5 blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                <header className="mb-16 text-center relative">
                    <div className="absolute right-0 top-0">
                        <ThemeToggle />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm text-xs font-medium text-blue-700 dark:text-zinc-400 shadow-sm"
                    >
                        ✨ AI-Powered News Intelligence
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600 dark:from-white dark:via-white/90 dark:to-white/50 bg-clip-text text-transparent mb-6 tracking-tight drop-shadow-sm"
                    >
                        NewsGraph AI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-700 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed"
                    >
                        Navigate the noise with <span className="text-blue-700 dark:text-blue-400 font-semibold">Deep Dive Context</span> and <span className="text-purple-700 dark:text-purple-400 font-semibold">Personalized Briefings</span>.
                    </motion.p>
                </header>

                <section className="mb-20">
                    <PersonalBriefing />
                </section>

                {/* Political Bias Heat Map Section */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-1.5 bg-gradient-to-b from-blue-500 via-zinc-400 to-red-500 rounded-full shadow-sm" />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Political Bias Analysis</h2>
                                <p className="text-xs text-slate-600 dark:text-zinc-500 mt-0.5">Source bias classification (Left/Center/Right)</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowBiasMap(!showBiasMap)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                        >
                            {showBiasMap ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {showBiasMap ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {showBiasMap && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <BiasHeatMap articles={initialArticles} />
                        </motion.div>
                    )}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-1.5 bg-blue-500 rounded-full shadow-sm" />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Top Headlines</h2>
                                <p className="text-xs text-slate-600 dark:text-zinc-500 mt-0.5">Latest breaking news stories</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-green-200 dark:border-white/10 text-xs font-medium text-green-700 dark:text-green-400 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
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
