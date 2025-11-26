'use client';

import { useState, useCallback } from 'react';
import { generateBriefingAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Loader2, Eye, FileText, Copy, Download, Share2, 
    Bookmark, Clock, TrendingUp, Globe2, Brain, Zap, ChevronRight,
    CheckCircle2, Circle, ArrowRight, RotateCcw, Maximize2, Minimize2,
    Target, Lightbulb, AlertTriangle, Calendar, Star
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { MultiPerspectiveView } from './MultiPerspectiveView';

// ============================================================================
// CONFIGURATION
// ============================================================================

const STEPS = [
    { id: 1, label: 'Scanning Global News Network...', icon: Globe2 },
    { id: 2, label: 'Extracting Key Entities & Signals...', icon: Brain },
    { id: 3, label: 'Synthesizing Intelligence Report...', icon: Zap },
];

const QUICK_TOPICS = [
    { label: 'AI & Tech', query: 'artificial intelligence technology trends' },
    { label: 'Markets', query: 'stock market financial news' },
    { label: 'Climate', query: 'climate change environmental policy' },
    { label: 'Geopolitics', query: 'global politics international relations' },
    { label: 'Crypto', query: 'cryptocurrency bitcoin blockchain' },
    { label: 'Healthcare', query: 'healthcare medical breakthroughs' },
];

const SECTION_ICONS: Record<string, React.ReactNode> = {
    'Executive Summary': <Target size={18} />,
    'Key Developments': <TrendingUp size={18} />,
    'Strategic Context': <Brain size={18} />,
    'Future Implications': <Lightbulb size={18} />,
    'Risk Factors': <AlertTriangle size={18} />,
    'Timeline': <Calendar size={18} />,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PersonalBriefing() {
    const [topic, setTopic] = useState('');
    const [briefing, setBriefing] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMultiPerspective, setIsMultiPerspective] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
    const [usedTopic, setUsedTopic] = useState('');

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        if (briefing) {
            await navigator.clipboard.writeText(briefing);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [briefing]);

    // Download as markdown
    const handleDownload = useCallback(() => {
        if (briefing && usedTopic) {
            const blob = new Blob([`# Intelligence Briefing: ${usedTopic}\n\n${briefing}`], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `briefing-${usedTopic.toLowerCase().replace(/\s+/g, '-')}.md`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [briefing, usedTopic]);

    // Share (Web Share API)
    const handleShare = useCallback(async () => {
        if (briefing && navigator.share) {
            try {
                await navigator.share({
                    title: `Intelligence Briefing: ${usedTopic}`,
                    text: briefing.substring(0, 500) + '...',
                });
            } catch (e) {
                console.log('Share cancelled');
            }
        }
    }, [briefing, usedTopic]);

    // Generate briefing
    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setBriefing(null);
        setCurrentStep(1);
        setUsedTopic(topic);

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
                    setGeneratedAt(new Date());
                    setLoading(false);
                    setCurrentStep(0);
                }, 800);
            } catch (error) {
                console.error(error);
                setLoading(false);
                clearInterval(stepInterval);
            }
        } else {
            clearInterval(stepInterval);
            setTimeout(() => {
                setLoading(false);
                setCurrentStep(0);
            }, 4500);
        }
    };

    // Reset
    const handleReset = () => {
        setTopic('');
        setBriefing(null);
        setUsedTopic('');
        setGeneratedAt(null);
        setIsBookmarked(false);
    };

    // Parse sections from briefing
    const parseSections = (text: string) => {
        const sections = text.split(/##\s+/).filter(Boolean);
        return sections.map(section => {
            const lines = section.trim().split('\n');
            const titleLine = lines[0];
            // Remove emoji from title for matching
            const cleanTitle = titleLine.replace(/[🎯🔑🧠🔮⚠️📅]/g, '').trim();
            const content = lines.slice(1).join('\n').trim();
            return { title: titleLine, cleanTitle, content };
        });
    };

    return (
        <div className={`w-full mx-auto mt-8 transition-all duration-300 ${isExpanded ? 'max-w-6xl' : 'max-w-4xl'}`}>
            <div className="p-8 bg-white dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-[#00dc82]">
                        <Sparkles className="text-[#1c1c1c]" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide flex items-center gap-2">
                            Intelligence Desk
                            <span className="text-[10px] font-mono text-[#00dc82] bg-[#00dc82]/10 px-2 py-0.5">AI-POWERED</span>
                        </h3>
                        <p className="text-sm text-[#71767A] uppercase tracking-wider">Generate synthesized intelligence briefings on any topic</p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-0 border-2 border-[#1c1c1c] dark:border-white/20">
                        <button
                            onClick={() => setIsMultiPerspective(false)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${!isMultiPerspective
                                ? 'bg-[#00dc82] text-[#1c1c1c]'
                                : 'bg-transparent text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white'
                            }`}
                        >
                            <FileText size={14} />
                            Briefing
                        </button>
                        <button
                            onClick={() => setIsMultiPerspective(true)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-l-2 border-[#1c1c1c] dark:border-white/20 flex items-center gap-1.5 ${isMultiPerspective
                                ? 'bg-[#00dc82] text-[#1c1c1c]'
                                : 'bg-transparent text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white'
                            }`}
                        >
                            <Eye size={14} />
                            Multi-View
                        </button>
                    </div>

                    {/* Expand Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 bg-[#F5F5F5] dark:bg-[#1c1c1c] hover:bg-[#00dc82] text-[#71767A] hover:text-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00dc82] transition-all"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>

                {/* Quick Topic Pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs text-[#71767A] uppercase tracking-wider flex items-center gap-1 mr-2">
                        <Zap size={12} /> Quick:
                    </span>
                    {QUICK_TOPICS.map((qt) => (
                        <button
                            key={qt.label}
                            onClick={() => setTopic(qt.query)}
                            className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#F5F5F5] dark:bg-[#1c1c1c] text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white hover:bg-[#00dc82] border border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00dc82] transition-all"
                        >
                            {qt.label}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter topic: 'AI regulation', 'Federal Reserve policy', 'Ukraine conflict'..."
                            className="w-full bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] px-5 py-4 pr-12 text-base text-[#1c1c1c] dark:text-white placeholder:text-[#71767A] focus:outline-none focus:border-[#00dc82] transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        {topic && (
                            <button
                                onClick={handleReset}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !topic.trim()}
                        className="bg-[#00dc82] hover:bg-[#00ff99] disabled:opacity-50 disabled:cursor-not-allowed text-[#1c1c1c] font-bold px-8 py-4 transition-all flex items-center gap-2 uppercase tracking-wider"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                        Analyze
                    </button>
                </div>

                {/* Loading Steps */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 space-y-3 p-5 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-l-4 border-[#00dc82]"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-[#00dc82] animate-pulse" />
                                <span className="text-xs text-[#00dc82] font-bold uppercase tracking-wider">Processing Intelligence Request</span>
                            </div>
                            {STEPS.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className="flex items-center gap-3 text-sm">
                                        {currentStep > step.id ? (
                                            <CheckCircle2 className="text-[#00dc82]" size={18} />
                                        ) : currentStep === step.id ? (
                                            <Loader2 className="animate-spin text-[#00dc82]" size={18} />
                                        ) : (
                                            <Circle className="text-[#3a3a3a]" size={18} />
                                        )}
                                        <Icon size={14} className={currentStep >= step.id ? 'text-[#00dc82]' : 'text-[#3a3a3a]'} />
                                        <span className={`uppercase tracking-wider ${currentStep === step.id ? 'text-[#1c1c1c] dark:text-white font-bold' : currentStep > step.id ? 'text-[#00dc82]' : 'text-[#71767A]'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Multi-Perspective View */}
                {!loading && topic && isMultiPerspective ? (
                    <MultiPerspectiveView topic={topic} />
                ) : null}

                {/* Briefing Results */}
                {briefing && !isMultiPerspective ? (
                    <div className="space-y-6">
                        {/* Results Header */}
                        <div className="flex items-center justify-between pb-4 border-b-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Star className="text-[#00dc82]" size={16} />
                                    <span className="text-sm font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wider">
                                        {usedTopic}
                                    </span>
                                </div>
                                {generatedAt && (
                                    <span className="text-xs text-[#71767A] flex items-center gap-1">
                                        <Clock size={12} />
                                        Generated {generatedAt.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsBookmarked(!isBookmarked)}
                                    className={`p-2 border transition-all ${isBookmarked ? 'bg-[#00dc82] border-[#00dc82] text-[#1c1c1c]' : 'bg-transparent border-[#3a3a3a] text-[#71767A] hover:border-[#00dc82] hover:text-[#00dc82]'}`}
                                    title="Bookmark"
                                >
                                    <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-transparent border border-[#3a3a3a] text-[#71767A] hover:border-[#00dc82] hover:text-[#00dc82] transition-all"
                                    title="Copy to Clipboard"
                                >
                                    {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-2 bg-transparent border border-[#3a3a3a] text-[#71767A] hover:border-[#00dc82] hover:text-[#00dc82] transition-all"
                                    title="Download as Markdown"
                                >
                                    <Download size={14} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 bg-transparent border border-[#3a3a3a] text-[#71767A] hover:border-[#00dc82] hover:text-[#00dc82] transition-all"
                                    title="Share"
                                >
                                    <Share2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Parsed Sections */}
                        {parseSections(briefing).map((section, index) => {
                            const iconKey = Object.keys(SECTION_ICONS).find(k => section.cleanTitle.includes(k));
                            const icon = iconKey ? SECTION_ICONS[iconKey] : <ChevronRight size={18} />;
                            
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative overflow-hidden bg-[#F5F5F5] dark:bg-[#1c1c1c] border-l-4 border-[#00dc82] hover:border-[#00ff99] transition-all group"
                                >
                                    {/* Section Header */}
                                    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E7E7E7] dark:border-[#3a3a3a] bg-[#F5F5F5] dark:bg-[#1c1c1c]">
                                        <div className="p-2 bg-[#00dc82]/10 text-[#00dc82]">
                                            {icon}
                                        </div>
                                        <h3 className="text-base font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide flex-1">
                                            {section.title}
                                        </h3>
                                        <span className="text-[10px] text-[#71767A] font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                            Section {index + 1}
                                        </span>
                                    </div>
                                    
                                    {/* Section Content */}
                                    <div className="px-6 py-5">
                                        <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none 
                                            prose-p:text-[#71767A] dark:prose-p:text-[#a0a0a0] prose-p:leading-relaxed prose-p:my-2
                                            prose-strong:text-[#1c1c1c] dark:prose-strong:text-white prose-strong:font-bold
                                            prose-ul:my-3 prose-ul:space-y-1
                                            prose-li:text-[#71767A] dark:prose-li:text-[#a0a0a0] prose-li:marker:text-[#00dc82]
                                            prose-h4:text-sm prose-h4:uppercase prose-h4:tracking-wider prose-h4:text-[#1c1c1c] dark:prose-h4:text-white prose-h4:font-bold prose-h4:mt-4 prose-h4:mb-2
                                            prose-a:text-[#00dc82] prose-a:no-underline hover:prose-a:underline
                                            prose-blockquote:border-l-4 prose-blockquote:border-[#00dc82] prose-blockquote:bg-[#00dc82]/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic">
                                            <ReactMarkdown>{section.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Regenerate Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[#3a3a3a] text-[#71767A] hover:border-[#00dc82] hover:text-[#00dc82] font-bold uppercase tracking-wider transition-all"
                            >
                                <RotateCcw size={16} />
                                Regenerate Briefing
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* Empty State */}
                {!loading && !briefing && !isMultiPerspective && (
                    <div className="text-center py-12 border-2 border-dashed border-[#E7E7E7] dark:border-[#3a3a3a]">
                        <Brain className="mx-auto mb-4 text-[#3a3a3a]" size={48} />
                        <p className="text-[#71767A] uppercase tracking-wider text-sm mb-2">Enter a topic to generate an intelligence briefing</p>
                        <p className="text-[#3a3a3a] text-xs">Our AI analyzes multiple news sources to synthesize actionable insights</p>
                    </div>
                )}
            </div>
        </div>
    );
}
