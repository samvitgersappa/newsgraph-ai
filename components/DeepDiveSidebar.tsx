'use client';

import { Article } from '@/lib/news-service';
import { getRelatedContext } from '@/app/actions';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Loader2, MessageSquare, Send, User as UserIcon, Bot } from 'lucide-react';
import { GraphView } from './GraphView';
import { chatWithArticle } from '@/app/actions';
import { MultiPerspectiveView } from './MultiPerspectiveView';
import { Scale, FileText, MessageSquare as MessageSquareIcon } from 'lucide-react';

interface DeepDiveSidebarProps {
    article: Article | null;
    onClose: () => void;
}

export function DeepDiveSidebar({ article, onClose }: DeepDiveSidebarProps) {
    const [activeTab, setActiveTab] = useState<'context' | 'perspectives' | 'chat'>('context');
    const [related, setRelated] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [chatLoading, setChatLoading] = useState(false);

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || !article) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            // Combine article content and related context for the AI
            const context = `
                Main Article: ${article.title}\n${article.description}\n${article.content}
                
                Related Context:
                ${related.map(r => `- ${r.metadata.title}: ${r.pageContent}`).join('\n')}
            `;

            const response = await chatWithArticle(userMsg, context);
            setChatMessages(prev => [...prev, { role: 'assistant', content: String(response) }]);
        } catch (error) {
            console.error(error);
        } finally {
            setChatLoading(false);
        }
    };

    useEffect(() => {
        if (article) {
            setLoading(true);
            getRelatedContext(article.title)
                .then(setRelated)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [article]);

    return (
        <AnimatePresence>
            {article && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 dark:bg-[#1c1c1c] z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white dark:bg-[#2a2a2a] border-l-4 border-[#00D166] z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b-2 border-[#E7E7E7] dark:border-[#3a3a3a] bg-[#F5F5F5] dark:bg-[#2a2a2a] z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-[#00D166]" />
                                    <h2 className="text-xl font-bold text-[#1c1c1c] dark:text-white uppercase tracking-wide">
                                        Deep Dive
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#00D166] text-[#71767A] hover:text-[#1c1c1c] transition-colors border-2 border-transparent hover:border-[#00D166]"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs - The Verge style */}
                            <div className="flex gap-0 border-2 border-[#E7E7E7] dark:border-[#3a3a3a]">
                                <button
                                    onClick={() => setActiveTab('context')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all ${
                                        activeTab === 'context'
                                            ? 'bg-[#00D166] text-[#1c1c1c]'
                                            : 'text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white hover:bg-[#E7E7E7] dark:hover:bg-[#3a3a3a]'
                                    }`}
                                >
                                    <FileText size={16} />
                                    Context
                                </button>
                                <button
                                    onClick={() => setActiveTab('perspectives')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-l-2 border-[#E7E7E7] dark:border-[#3a3a3a] ${
                                        activeTab === 'perspectives'
                                            ? 'bg-[#00D166] text-[#1c1c1c]'
                                            : 'text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white hover:bg-[#E7E7E7] dark:hover:bg-[#3a3a3a]'
                                    }`}
                                >
                                    <Scale size={16} />
                                    Bias
                                </button>
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold uppercase tracking-wider transition-all border-l-2 border-[#E7E7E7] dark:border-[#3a3a3a] ${
                                        activeTab === 'chat'
                                            ? 'bg-[#00D166] text-[#1c1c1c]'
                                            : 'text-[#71767A] hover:text-[#1c1c1c] dark:hover:text-white hover:bg-[#E7E7E7] dark:hover:bg-[#3a3a3a]'
                                    }`}
                                >
                                    <MessageSquareIcon size={16} />
                                    Chat
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'context' && (
                                <div className="p-6">
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-[#1c1c1c] dark:text-white mb-2 leading-tight">{article.title}</h3>
                                        <p className="text-[#71767A] dark:text-[#a0a0a0] leading-relaxed">{article.description}</p>
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-4 text-sm text-[#00D166] hover:text-[#00E676] font-bold uppercase tracking-wider"
                                        >
                                            Read Full Article <LinkIcon size={14} />
                                        </a>
                                    </div>

                                    <div className="mb-8">
                                        <h4 className="text-sm font-bold text-[#71767A] uppercase tracking-wider mb-4">
                                            Knowledge Timeline Graph
                                            <span className="ml-2 text-[10px] text-[#00dc82] font-mono">(1, 3, 5, 10 Years)</span>
                                        </h4>
                                        <div className="h-[650px] bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] overflow-hidden">
                                            {loading ? (
                                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                                    <Loader2 className="animate-spin text-[#00D166]" size={32} />
                                                    <p className="text-[#71767A] text-xs uppercase tracking-wider">Loading Timeline...</p>
                                                </div>
                                            ) : related.length > 0 ? (
                                                <GraphView articles={related} showTimelineSearch={true} />
                                            ) : (
                                                <p className="text-[#71767A] text-sm text-center py-4 uppercase tracking-wider">
                                                    No related context found
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-[#71767A] uppercase tracking-wider mb-4">Related Coverage</h4>
                                        {loading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2 className="animate-spin text-[#00D166]" size={32} />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {related.map((item, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="p-4 bg-[#F5F5F5] dark:bg-[#1c1c1c] border-l-4 border-[#00D166] hover:border-[#00E676] transition-colors"
                                                    >
                                                        <h5 className="font-bold text-[#1c1c1c] dark:text-white mb-2">{item.metadata.title}</h5>
                                                        <p className="text-sm text-[#71767A] line-clamp-2">{item.pageContent}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'perspectives' && (
                                <div className="p-6">
                                    <MultiPerspectiveView topic={article.title} />
                                </div>
                            )}

                            {activeTab === 'chat' && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 p-6 space-y-4">
                                        {chatMessages.length === 0 && (
                                            <div className="text-center text-[#71767A] mt-12">
                                                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                                                <p className="uppercase tracking-wider text-sm">Ask me anything about this article</p>
                                            </div>
                                        )}
                                        {chatMessages.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                                                    msg.role === 'user' ? 'bg-[#00D166]' : 'bg-[#FA3E3E]'
                                                }`}>
                                                    {msg.role === 'user' ? <UserIcon size={14} className="text-[#1c1c1c]" /> : <Bot size={14} className="text-white dark:text-white" />}
                                                </div>
                                                <div className={`p-3 max-w-[80%] text-sm ${
                                                    msg.role === 'user' 
                                                        ? 'bg-[#00D166] text-[#1c1c1c]' 
                                                        : 'bg-[#F5F5F5] dark:bg-[#1c1c1c] text-[#1c1c1c] dark:text-white border-l-4 border-[#FA3E3E]'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 bg-[#FA3E3E] flex items-center justify-center flex-shrink-0">
                                                    <Bot size={14} className="text-white dark:text-white" />
                                                </div>
                                                <div className="bg-[#F5F5F5] dark:bg-[#1c1c1c] p-3 border-l-4 border-[#FA3E3E]">
                                                    <Loader2 className="animate-spin text-[#00D166]" size={16} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t-2 border-[#E7E7E7] dark:border-[#3a3a3a] bg-[#F5F5F5] dark:bg-[#2a2a2a]">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                                                placeholder="Ask a question..."
                                                className="flex-1 bg-white dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] py-3 px-4 text-[#1c1c1c] dark:text-white placeholder:text-[#71767A] focus:outline-none focus:border-[#00D166] transition-colors"
                                            />
                                            <button
                                                onClick={handleChatSubmit}
                                                disabled={!chatInput.trim() || chatLoading}
                                                className="p-3 bg-[#00D166] text-[#1c1c1c] hover:bg-[#00E676] disabled:opacity-50 disabled:hover:bg-[#00D166] transition-colors"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
