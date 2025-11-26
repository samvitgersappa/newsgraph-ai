'use client';

import { Article } from '@/lib/news-service';
import { NewsFeed } from '@/components/NewsFeed';
import { DeepDiveSidebar } from '@/components/DeepDiveSidebar';
import { PersonalBriefing } from '@/components/PersonalBriefing';
import { BiasHeatMap } from '@/components/BiasHeatMap';
import { RAG3DView } from '@/components/RAG3DView';
import { RAGInsightsPanel } from '@/components/RAGInsightsPanel';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChevronDown, ChevronUp, Brain, Sparkles, BarChart3 } from 'lucide-react';

interface ClientPageProps {
    initialArticles: Article[];
}

export function ClientPage({ initialArticles }: ClientPageProps) {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showBiasMap, setShowBiasMap] = useState(true);
    const [showRAG3D, setShowRAG3D] = useState(true);
    const [showRAGInsights, setShowRAGInsights] = useState(false);

    return (
        <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#1c1c1c] selection:bg-[#00D166]/30 transition-colors duration-300">
            {/* The Verge style subtle grid */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#1c1c1c 1px, transparent 1px), linear-gradient(90deg, #1c1c1c 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
            />

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* The Verge style header */}
                <header className="mb-12 relative">
                    <div className="absolute right-0 top-0">
                        <ThemeToggle />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-2 h-16 bg-[#00D166]"
                        />
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1c1c1c] dark:text-white uppercase"
                            >
                                NewsGraph AI
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-sm text-[#71767A] dark:text-[#71767A] mt-2 font-medium tracking-wide"
                            >
                                AI-POWERED NEWS INTELLIGENCE
                            </motion.p>
                        </div>
                    </div>

                    {/* The Verge style navigation hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 text-sm"
                    >
                        <span className="px-3 py-1.5 bg-[#00D166] text-[#1c1c1c] font-bold text-xs uppercase tracking-wider">
                            Live
                        </span>
                        <span className="text-[#71767A] dark:text-[#71767A]">
                            Navigate the noise with <span className="text-[#00D166] font-semibold">Deep Dive Context</span> and <span className="text-[#FA3E3E] font-semibold">Personalized Briefings</span>
                        </span>
                    </motion.div>
                </header>

                <section className="mb-16">
                    <PersonalBriefing />
                </section>

                {/* 3D RAG Knowledge Graph Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#00D166] flex items-center justify-center">
                                <Brain className="w-6 h-6 text-[#1c1c1c]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide flex items-center gap-2">
                                    RAG Knowledge Graph
                                    <Sparkles className="w-5 h-5 text-[#00D166]" />
                                </h2>
                                <p className="text-xs text-[#71767A] mt-0.5 uppercase tracking-wider">Interactive 3D visualization of document retrieval</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRAG3D(!showRAG3D)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1c1c1c] dark:text-white bg-[#E7E7E7] dark:bg-[#2a2a2a] border-2 border-[#1c1c1c] dark:border-white/20 hover:bg-[#00D166] hover:text-[#1c1c1c] hover:border-[#00D166] transition-all uppercase tracking-wider"
                        >
                            {showRAG3D ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {showRAG3D ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {showRAG3D && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-2 border-[#3a3a3a] overflow-hidden"
                        >
                            <RAG3DView />
                        </motion.div>
                    )}
                </section>

                {/* RAG Insights Panel Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FA3E3E] flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide flex items-center gap-2">
                                    RAG Scoring Analysis
                                </h2>
                                <p className="text-xs text-[#71767A] mt-0.5 uppercase tracking-wider">Multi-signal document ranking breakdown</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRAGInsights(!showRAGInsights)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1c1c1c] dark:text-white bg-[#E7E7E7] dark:bg-[#2a2a2a] border-2 border-[#1c1c1c] dark:border-white/20 hover:bg-[#00D166] hover:text-[#1c1c1c] hover:border-[#00D166] transition-all uppercase tracking-wider"
                        >
                            {showRAGInsights ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {showRAGInsights ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {showRAGInsights && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <RAGInsightsPanel />
                        </motion.div>
                    )}
                </section>

                {/* Political Bias Heat Map Section */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 bg-gradient-to-b from-[#5458F7] via-[#71767A] to-[#FA3E3E]" />
                            <div>
                                <h2 className="text-xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide">Political Bias Analysis</h2>
                                <p className="text-xs text-[#71767A] mt-0.5 uppercase tracking-wider">Source bias classification</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowBiasMap(!showBiasMap)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1c1c1c] dark:text-white bg-[#E7E7E7] dark:bg-[#2a2a2a] border-2 border-[#1c1c1c] dark:border-white/20 hover:bg-[#00D166] hover:text-[#1c1c1c] hover:border-[#00D166] transition-all uppercase tracking-wider"
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
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 bg-[#00D166]" />
                            <div>
                                <h2 className="text-xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide">Top Stories</h2>
                                <p className="text-xs text-[#71767A] mt-0.5 uppercase tracking-wider">Breaking news</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 bg-[#FA3E3E] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
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
