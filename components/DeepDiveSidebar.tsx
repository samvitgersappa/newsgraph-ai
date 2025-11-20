'use client';

import { Article } from '@/lib/news-service';
import { getRelatedContext } from '@/app/actions';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Loader2, MessageSquare, Send, User as UserIcon, Bot } from 'lucide-react';
import { GraphView } from './GraphView';
import { chatWithArticle } from '@/app/actions';

interface DeepDiveSidebarProps {
    article: Article | null;
    onClose: () => void;
}

export function DeepDiveSidebar({ article, onClose }: DeepDiveSidebarProps) {
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
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-zinc-900 border-l border-white/10 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md z-10">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Deep Dive Context
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">{article.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{article.description}</p>
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-4 text-sm text-blue-400 hover:text-blue-300"
                                >
                                    Read Full Article <LinkIcon size={12} />
                                </a>
                            </div>

                            {/* Knowledge Graph */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                                    <h4 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Knowledge Graph</h4>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-12 bg-white/5 rounded-xl">
                                        <Loader2 className="animate-spin text-blue-400" />
                                    </div>
                                ) : related.length > 0 ? (
                                    <GraphView articles={related} />
                                ) : (
                                    <p className="text-zinc-500 text-sm text-center py-4">
                                        No related context found in the graph.
                                    </p>
                                )}
                            </div>

                            {/* Chat Interface */}
                            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-purple-400" />
                                    <h4 className="text-sm font-medium text-white">Ask AI about this story</h4>
                                </div>

                                <div className="h-64 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                                    {chatMessages.length === 0 && (
                                        <div className="text-center text-zinc-500 text-sm py-8">
                                            Ask questions like "What is the background?" or "Who are the key players?"
                                        </div>
                                    )}
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                                            </div>
                                            <div className={`rounded-lg p-3 text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500/10 text-blue-100 border border-blue-500/20' : 'bg-zinc-800 text-zinc-300'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                                <Bot size={14} />
                                            </div>
                                            <div className="bg-zinc-800 rounded-lg p-3">
                                                <Loader2 className="animate-spin text-zinc-500" size={16} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                                        placeholder="Type your question..."
                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                    <button
                                        onClick={handleChatSubmit}
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-white transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
