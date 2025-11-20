'use client';

import { useState } from 'react';
import { generateBriefingAction } from '@/app/actions';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Spotlight } from './Spotlight';


import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

const STEPS = [
    { id: 1, label: 'Scanning Global News Network...' },
    { id: 2, label: 'Extracting Key Entities...' },
    { id: 3, label: 'Synthesizing Intelligence Report...' },
];

export function PersonalBriefing() {
    const [topic, setTopic] = useState('');
    const [briefing, setBriefing] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setBriefing(null);
        setCurrentStep(1);

        // Simulate steps for visual feedback
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= 3) {
                    clearInterval(stepInterval);
                    return 3;
                }
                return prev + 1;
            });
        }, 1500);

        try {
            const result = await generateBriefingAction(topic);
            clearInterval(stepInterval);
            setCurrentStep(3);
            setTimeout(() => {
                setBriefing(String(result));
                setLoading(false);
                setCurrentStep(0);
            }, 800);
        } catch (error) {
            console.error(error);
            setLoading(false);
            clearInterval(stepInterval);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <Spotlight className="p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 rounded-xl ring-1 ring-zinc-200 dark:ring-white/10">
                        <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Personal Editor</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Generate a synthesized briefing on any topic using RAG</p>
                    </div>
                </div>

                <div className="relative flex gap-2 mb-8 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'Impact of AI on healthcare' or 'Crypto regulation'"
                        className="relative flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-5 py-4 text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !topic.trim()}
                        className="relative bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-6 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                    </button>
                </div>

                {loading && (
                    <div className="mb-8 space-y-3">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex items-center gap-3 text-sm">
                                {currentStep > step.id ? (
                                    <CheckCircle2 className="text-green-500 dark:text-green-400" size={16} />
                                ) : currentStep === step.id ? (
                                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={16} />
                                ) : (
                                    <Circle className="text-zinc-300 dark:text-zinc-700" size={16} />
                                )}
                                <span className={`${currentStep === step.id ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-500'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {briefing && (
                    <div className="space-y-6">
                        {briefing.split('## ').filter(Boolean).map((section, index) => {
                            const lines = section.trim().split('\n');
                            const title = lines[0];
                            const content = lines.slice(1).join('\n');

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative overflow-hidden rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 hover:border-blue-500/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100 dark:border-white/5">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                                            {title}
                                        </h3>
                                    </div>
                                    <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none 
                                        prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
                                        prose-strong:text-zinc-900 dark:prose-strong:text-white prose-strong:font-semibold
                                        prose-ul:my-2 prose-li:text-zinc-600 dark:prose-li:text-zinc-300 prose-li:marker:text-blue-500">
                                        <ReactMarkdown>{content}</ReactMarkdown>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </Spotlight>
        </div>
    );
}
