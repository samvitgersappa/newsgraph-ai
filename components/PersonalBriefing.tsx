'use client';

import { useState } from 'react';
import { generateBriefingAction } from '@/app/actions';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, Eye, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Spotlight } from './Spotlight';
import { MultiPerspectiveView } from './MultiPerspectiveView';


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
    const [viewMode, setViewMode] = useState<'briefing' | 'perspectives'>('briefing');
    const [isMultiPerspective, setIsMultiPerspective] = useState(false);

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

        if (!isMultiPerspective) {
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
        } else {
            // For multi-perspective, just clear loading after steps
            clearInterval(stepInterval);
            setTimeout(() => {
                setLoading(false);
                setCurrentStep(0);
            }, 4500);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <div className="p-8 bg-white dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#00D166]">
                        <Sparkles className="text-[#1c1c1c]" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide">Personal Editor</h3>
                        <p className="text-sm text-[#71767A] uppercase tracking-wider">Generate a synthesized briefing on any topic</p>
                    </div>

                    {/* Mode Toggle - The Verge style */}
                    <div className="flex items-center gap-0 border-2 border-[#1c1c1c] dark:border-white/20">
                        <button
                            onClick={() => setIsMultiPerspective(false)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${!isMultiPerspective
                                    ? 'bg-[#00D166] text-[#1c1c1c]'
                                    : 'bg-transparent text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white'
                                }`}
                        >
                            <FileText className="inline-block mr-1" size={12} />
                            Briefing
                        </button>
                        <button
                            onClick={() => setIsMultiPerspective(true)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-l-2 border-[#1c1c1c] dark:border-white/20 ${isMultiPerspective
                                    ? 'bg-[#00D166] text-[#1c1c1c]'
                                    : 'bg-transparent text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white'
                                }`}
                        >
                            <Eye className="inline-block mr-1" size={12} />
                            Perspectives
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 mb-8">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'Impact of AI on healthcare' or 'Crypto regulation'"
                        className="flex-1 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] px-5 py-4 text-base text-[#1c1c1c] dark:text-white placeholder:text-[#71767A] focus:outline-none focus:border-[#00D166] transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !topic.trim()}
                        className="bg-[#00D166] hover:bg-[#00E676] disabled:opacity-50 disabled:cursor-not-allowed text-[#1c1c1c] font-bold px-6 py-4 transition-all flex items-center gap-2 uppercase tracking-wider"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                        Go
                    </button>
                </div>

                {loading && (
                    <div className="mb-8 space-y-3 p-4 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-l-4 border-[#00D166]">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex items-center gap-3 text-sm">
                                {currentStep > step.id ? (
                                    <CheckCircle2 className="text-[#00D166]" size={16} />
                                ) : currentStep === step.id ? (
                                    <Loader2 className="animate-spin text-[#00D166]" size={16} />
                                ) : (
                                    <Circle className="text-[#71767A]" size={16} />
                                )}
                                <span className={`uppercase tracking-wider ${currentStep === step.id ? 'text-[#1c1c1c] dark:text-white font-bold' : 'text-[#71767A]'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Show multi-perspective view or regular briefing */}
                {!loading && topic && isMultiPerspective ? (
                    <MultiPerspectiveView topic={topic} />
                ) : briefing && !isMultiPerspective ? (
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
                                    className="relative overflow-hidden bg-[#F5F5F5] dark:bg-[#1c1c1c] border-l-4 border-[#00D166] p-6 hover:border-[#00E676] transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E7E7E7] dark:border-[#3a3a3a]">
                                        <h3 className="text-lg font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide">
                                            {title}
                                        </h3>
                                    </div>
                                    <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none 
                                        prose-p:text-[#71767A] dark:prose-p:text-[#a0a0a0] prose-p:leading-relaxed
                                        prose-strong:text-[#1c1c1c] dark:prose-strong:text-white prose-strong:font-bold
                                        prose-ul:my-2 prose-li:text-[#71767A] dark:prose-li:text-[#a0a0a0] prose-li:marker:text-[#00D166]">
                                        <ReactMarkdown>{content}</ReactMarkdown>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
