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
                        <div className="p-6 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md z-10">
                            <div className="flex items-center justify-between mb-4">
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

                            {/* Tabs */}
                            <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('context')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                        activeTab === 'context'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <FileText size={16} />
                                    Context
                                </button>
                                <button
                                    onClick={() => setActiveTab('perspectives')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                        activeTab === 'perspectives'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Scale size={16} />
                                    Bias Check
                                </button>
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                        activeTab === 'chat'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
                                        <h3 className="text-2xl font-bold text-white mb-2">{article.title}</h3>
                                        <p className="text-zinc-400 leading-relaxed">{article.description}</p>
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-4 text-sm text-blue-400 hover:text-blue-300"
                                        >
                                            Read Full Article <LinkIcon size={14} />
                                        </a>
                                    </div>

                                    <div className="mb-8">
                                        <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Knowledge Graph</h4>
                                        <div className="h-[300px] bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                                            {loading ? (
                                                <div className="flex justify-center py-12">
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
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Related Coverage</h4>
                                        {loading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2 className="animate-spin text-blue-500" size={32} />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {related.map((item, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                                                    >
                                                        <h5 className="font-medium text-zinc-200 mb-2">{item.metadata.title}</h5>
                                                        <p className="text-sm text-zinc-400 line-clamp-2">{item.pageContent}</p>
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
                                            <div className="text-center text-zinc-500 mt-12">
                                                <Bot size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>Ask me anything about this article or related context.</p>
                                            </div>
                                        )}
                                        {chatMessages.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                                                }`}>
                                                    {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                                                </div>
                                                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                                                    msg.role === 'user' 
                                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                                        : 'bg-white/10 text-zinc-200 rounded-tl-none'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <Bot size={14} />
                                                </div>
                                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none">
                                                    <Loader2 className="animate-spin" size={16} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-white/10 bg-zinc-900/50 backdrop-blur-sm">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                                                placeholder="Ask a question..."
                                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <button
                                                onClick={handleChatSubmit}
                                                disabled={!chatInput.trim() || chatLoading}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
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
