'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
    ZoomIn, ZoomOut, RotateCcw, ExternalLink, Maximize2, Minimize2,
    FileText, Calendar, Clock, History, Search, Loader2, Filter,
    TrendingUp
} from 'lucide-react';
import { getRelatedContext } from '@/app/actions';

// ============================================================================
// INTERFACES
// ============================================================================

interface GraphNode {
    id: string;
    title: string;
    date: string;
    source: string;
    url: string;
    x: number;
    y: number;
    timeframe: TimeframeKey;
    isHistorical?: boolean;
}

interface TimeframeData {
    label: string;
    yearsAgo: number;
    color: string;
    bgColor: string;
    articles: any[];
}

type TimeframeKey = 'current' | '1year' | '3years' | '5years' | '10years';

interface GraphViewProps {
    articles: any[];
    showTimelineSearch?: boolean;
}

// ============================================================================
// TIMEFRAME CONFIGURATION
// ============================================================================

const TIMEFRAMES: Record<TimeframeKey, { label: string; yearsAgo: number; color: string; bgColor: string; icon: React.ReactNode }> = {
    current: {
        label: 'Current',
        yearsAgo: 0,
        color: '#00dc82',
        bgColor: 'rgba(0, 220, 130, 0.15)',
        icon: <TrendingUp size={14} />
    },
    '1year': {
        label: '1 Year',
        yearsAgo: 1,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        icon: <Clock size={14} />
    },
    '3years': {
        label: '3 Years',
        yearsAgo: 3,
        color: '#8B5CF6',
        bgColor: 'rgba(139, 92, 246, 0.15)',
        icon: <History size={14} />
    },
    '5years': {
        label: '5 Years',
        yearsAgo: 5,
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        icon: <Calendar size={14} />
    },
    '10years': {
        label: '10 Years',
        yearsAgo: 10,
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        icon: <History size={14} />
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function categorizeByTimeframe(articles: any[]): Record<TimeframeKey, any[]> {
    const now = new Date();
    const result: Record<TimeframeKey, any[]> = {
        current: [],
        '1year': [],
        '3years': [],
        '5years': [],
        '10years': [],
    };

    articles.forEach(article => {
        const publishedAt = new Date(article.metadata?.publishedAt || article.publishedAt);
        const yearsDiff = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 365);

        // Check if it's marked as historical
        if (article.metadata?.isHistorical) {
            const title = article.metadata?.title || '';
            if (title.includes('10 year')) result['10years'].push(article);
            else if (title.includes('5 year')) result['5years'].push(article);
            else if (title.includes('3 year')) result['3years'].push(article);
            else if (title.includes('1 year')) result['1year'].push(article);
            else result['5years'].push(article); // Default historical to 5 years
            return;
        }

        if (yearsDiff < 0.25) result.current.push(article);
        else if (yearsDiff < 2) result['1year'].push(article);
        else if (yearsDiff < 4) result['3years'].push(article);
        else if (yearsDiff < 7) result['5years'].push(article);
        else result['10years'].push(article);
    });

    return result;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GraphView({ articles, showTimelineSearch = false }: GraphViewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTimeframes, setActiveTimeframes] = useState<Set<TimeframeKey>>(
        new Set(['current', '1year', '3years', '5years', '10years'])
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // Combine initial articles with search results
    const allArticles = useMemo(() => {
        return hasSearched ? searchResults : articles;
    }, [articles, searchResults, hasSearched]);

    // Categorize articles by timeframe
    const categorizedArticles = useMemo(() => {
        return categorizeByTimeframe(allArticles);
    }, [allArticles]);

    // Filter by active timeframes
    const filteredArticles = useMemo(() => {
        const result: any[] = [];
        activeTimeframes.forEach(tf => {
            result.push(...categorizedArticles[tf].map(a => ({ ...a, timeframe: tf })));
        });
        return result.sort((a, b) =>
            new Date(b.metadata?.publishedAt || b.publishedAt).getTime() -
            new Date(a.metadata?.publishedAt || a.publishedAt).getTime()
        );
    }, [categorizedArticles, activeTimeframes]);

    // Handle search
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await getRelatedContext(searchQuery);
            setSearchResults(results);
            setHasSearched(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    // Toggle timeframe
    const toggleTimeframe = (tf: TimeframeKey) => {
        setActiveTimeframes(prev => {
            const next = new Set(prev);
            if (next.has(tf)) {
                if (next.size > 1) next.delete(tf);
            } else {
                next.add(tf);
            }
            return next;
        });
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    // Dynamic sizing
    const nodeSpacing = 280;
    const startPadding = 200;
    const canvasWidth = Math.max(1400, (filteredArticles.length * nodeSpacing) + (startPadding * 2));
    const canvasHeight = isFullscreen ? (typeof window !== 'undefined' ? window.innerHeight : 800) : 650;
    const centerY = canvasHeight / 2;

    // Create nodes
    const nodes: GraphNode[] = filteredArticles.map((item, i) => {
        const timeframe = item.timeframe as TimeframeKey;
        return {
            id: String(i),
            title: item.metadata?.title || item.title,
            date: item.metadata?.publishedAt || item.publishedAt,
            source: item.metadata?.source || item.source,
            url: item.metadata?.url || item.url,
            x: startPadding + (i * nodeSpacing),
            y: centerY + (i % 2 === 0 ? -120 : 120),
            timeframe,
            isHistorical: item.metadata?.isHistorical,
        };
    });

    // Count articles per timeframe
    const timeframeCounts = useMemo(() => {
        const counts: Record<TimeframeKey, number> = {
            current: 0, '1year': 0, '3years': 0, '5years': 0, '10years': 0
        };
        Object.entries(categorizedArticles).forEach(([key, arr]) => {
            counts[key as TimeframeKey] = arr.length;
        });
        return counts;
    }, [categorizedArticles]);

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-[#1c1c1c]' : 'relative w-full bg-[#F5F5F5] dark:bg-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a]'} overflow-hidden transition-all duration-300`}>

            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-[#F5F5F5] dark:from-[#1c1c1c] via-[#F5F5F5]/90 dark:via-[#1c1c1c]/90 to-transparent">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Search & Timeframe Filters */}
                    <div className="flex-1">
                        {/* Search Bar */}
                        {showTimelineSearch && (
                            <div className="flex gap-2 mb-4 max-w-md">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71767A]" size={16} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search timeline (e.g., AI, climate)..."
                                        className="w-full bg-white dark:bg-[#2a2a2a] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] focus:border-[#00dc82] text-[#1c1c1c] dark:text-white text-sm pl-10 pr-4 py-2 outline-none transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="px-4 py-2 bg-[#00dc82] hover:bg-[#00ff99] text-[#1c1c1c] font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                                </button>
                                {hasSearched && (
                                    <button
                                        onClick={clearSearch}
                                        className="px-3 py-2 bg-white dark:bg-[#2a2a2a] hover:bg-[#E7E7E7] dark:hover:bg-[#3a3a3a] text-[#1c1c1c] dark:text-white border-2 border-[#E7E7E7] dark:border-[#3a3a3a] text-sm transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Timeframe Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-[#71767A] uppercase tracking-wider flex items-center gap-2 mr-2">
                                <Filter size={12} /> Timeframes:
                            </span>
                            {(Object.entries(TIMEFRAMES) as [TimeframeKey, typeof TIMEFRAMES[TimeframeKey]][]).map(([key, tf]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleTimeframe(key)}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border-2 ${activeTimeframes.has(key)
                                            ? 'text-[#1c1c1c] border-transparent'
                                            : 'bg-transparent text-[#71767A] border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#71767A]'
                                        }`}
                                    style={activeTimeframes.has(key) ? {
                                        backgroundColor: tf.color,
                                        borderColor: tf.color
                                    } : {}}
                                >
                                    {tf.icon}
                                    {tf.label}
                                    <span className={`px-1.5 py-0.5 text-[10px] ${activeTimeframes.has(key) ? 'bg-[#1c1c1c]/20' : 'bg-[#E7E7E7] dark:bg-[#3a3a3a]'
                                        }`}>
                                        {timeframeCounts[key]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: View Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 bg-white dark:bg-[#2a2a2a] hover:bg-[#00dc82] text-[#1c1c1c] dark:text-white hover:text-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00dc82] transition-all"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-20 flex gap-3 bg-white/90 dark:bg-[#2a2a2a]/90 backdrop-blur-sm border border-[#E7E7E7] dark:border-[#3a3a3a] px-4 py-2 shadow-sm">
                <span className="text-[10px] text-[#71767A] uppercase tracking-wider">Legend:</span>
                {(Object.entries(TIMEFRAMES) as [TimeframeKey, typeof TIMEFRAMES[TimeframeKey]][]).map(([key, tf]) => (
                    activeTimeframes.has(key) && (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-3 h-3" style={{ backgroundColor: tf.color }} />
                            <span className="text-[10px] text-[#1c1c1c] dark:text-white uppercase tracking-wider">{tf.label}</span>
                        </div>
                    )
                ))}
            </div>

            {/* Main Graph Area */}
            <TransformWrapper
                initialScale={0.7}
                centerOnInit={true}
                minScale={0.3}
                maxScale={2}
                limitToBounds={false}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                            <button onClick={() => zoomIn()} className="p-2 bg-white dark:bg-[#2a2a2a] hover:bg-[#00dc82] text-[#1c1c1c] dark:text-white hover:text-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00dc82] transition-all" title="Zoom In"><ZoomIn size={16} /></button>
                            <button onClick={() => zoomOut()} className="p-2 bg-white dark:bg-[#2a2a2a] hover:bg-[#00dc82] text-[#1c1c1c] dark:text-white hover:text-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00dc82] transition-all" title="Zoom Out"><ZoomOut size={16} /></button>
                            <button onClick={() => resetTransform()} className="p-2 bg-white dark:bg-[#2a2a2a] hover:bg-[#00dc82] text-[#1c1c1c] dark:text-white hover:text-[#1c1c1c] border-2 border-[#E7E7E7] dark:border-[#3a3a3a] hover:border-[#00dc82] transition-all" title="Reset View"><RotateCcw size={16} /></button>
                        </div>

                        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                            <div
                                className="relative"
                                style={{ width: canvasWidth, height: canvasHeight, paddingTop: showTimelineSearch ? 100 : 80 }}
                            >
                                {/* Empty State */}
                                {nodes.length === 0 && !isSearching && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <History size={48} className="mx-auto mb-4 text-[#71767A] dark:text-[#3a3a3a]" />
                                            <p className="text-[#71767A] text-lg uppercase tracking-wider">No articles in selected timeframes</p>
                                            <p className="text-[#71767A] dark:text-[#3a3a3a] text-sm mt-2">Try selecting different timeframes above</p>
                                        </div>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isSearching && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-[#1c1c1c]/80 z-30">
                                        <div className="text-center">
                                            <Loader2 size={48} className="mx-auto mb-4 text-[#00dc82] animate-spin" />
                                            <p className="text-[#1c1c1c] dark:text-white text-lg uppercase tracking-wider">Searching Timeline...</p>
                                            <p className="text-[#71767A] text-sm mt-2">Including historical context</p>
                                        </div>
                                    </div>
                                )}

                                {/* SVG Layer */}
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                    <defs>
                                        {/* Gradients for each timeframe */}
                                        {(Object.entries(TIMEFRAMES) as [TimeframeKey, typeof TIMEFRAMES[TimeframeKey]][]).map(([key, tf]) => (
                                            <linearGradient key={`gradient-${key}`} id={`timeline-gradient-${key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor={`${tf.color}00`} />
                                                <stop offset="10%" stopColor={`${tf.color}80`} />
                                                <stop offset="90%" stopColor={`${tf.color}80`} />
                                                <stop offset="100%" stopColor={`${tf.color}00`} />
                                            </linearGradient>
                                        ))}
                                        <linearGradient id="timeline-gradient-main" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="rgba(113,118,122,0)" />
                                            <stop offset="10%" stopColor="rgba(113,118,122,0.3)" />
                                            <stop offset="90%" stopColor="rgba(113,118,122,0.3)" />
                                            <stop offset="100%" stopColor="rgba(113,118,122,0)" />
                                        </linearGradient>
                                    </defs>

                                    {/* Main Timeline Line */}
                                    <line
                                        x1={0}
                                        y1={centerY}
                                        x2={canvasWidth}
                                        y2={centerY}
                                        stroke="url(#timeline-gradient-main)"
                                        strokeWidth="3"
                                    />

                                    {/* Year Markers on Timeline */}
                                    {[0, 1, 3, 5, 10].map((year, idx) => {
                                        const x = startPadding + (idx * (canvasWidth - startPadding * 2) / 4);
                                        return (
                                            <g key={`year-marker-${year}`}>
                                                <line
                                                    x1={x}
                                                    y1={centerY - 15}
                                                    x2={x}
                                                    y2={centerY + 15}
                                                    stroke="#3a3a3a"
                                                    strokeWidth="2"
                                                />
                                                <text
                                                    x={x}
                                                    y={centerY + 35}
                                                    textAnchor="middle"
                                                    fill="#71767A"
                                                    fontSize="11"
                                                    className="font-mono uppercase"
                                                >
                                                    {year === 0 ? 'Now' : `${year}y ago`}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Connecting lines to nodes */}
                                    {nodes.map((node, i) => {
                                        const tf = TIMEFRAMES[node.timeframe];
                                        return (
                                            <line
                                                key={`link-${i}`}
                                                x1={node.x}
                                                y1={centerY}
                                                x2={node.x}
                                                y2={node.y}
                                                stroke={`${tf.color}40`}
                                                strokeWidth="2"
                                                strokeDasharray="4 4"
                                            />
                                        );
                                    })}

                                    {/* Date Markers on Timeline */}
                                    {nodes.map((node, i) => {
                                        const tf = TIMEFRAMES[node.timeframe];
                                        return (
                                            <g key={`date-${i}`}>
                                                <circle
                                                    cx={node.x}
                                                    cy={centerY}
                                                    r="5"
                                                    fill={tf.color}
                                                    className="cursor-pointer"
                                                />
                                                <text
                                                    x={node.x}
                                                    y={centerY + (node.y > centerY ? -10 : 25)}
                                                    textAnchor="middle"
                                                    fill={tf.color}
                                                    fontSize="9"
                                                    className="font-mono uppercase"
                                                >
                                                    {node.isHistorical
                                                        ? format(new Date(node.date), 'yyyy')
                                                        : format(new Date(node.date), 'MMM d')
                                                    }
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Node Cards */}
                                <AnimatePresence>
                                    {nodes.map((node, i) => {
                                        const tf = TIMEFRAMES[node.timeframe];
                                        return (
                                            <motion.div
                                                key={`${node.id}-${node.title}`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                                                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                                                style={{ left: node.x, top: node.y }}
                                            >
                                                <a
                                                    href={node.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block group relative"
                                                    onClick={(e) => {
                                                        if (selectedNode === node.id) {
                                                            // Allow link click
                                                        } else {
                                                            e.preventDefault();
                                                            setSelectedNode(node.id);
                                                        }
                                                    }}
                                                >
                                                    {/* Node Icon */}
                                                    <div className="relative z-10 cursor-pointer flex flex-col items-center">
                                                        <div
                                                            className="w-14 h-14 border-2 group-hover:scale-110 transition-all flex items-center justify-center shadow-lg"
                                                            style={{
                                                                backgroundColor: tf.bgColor,
                                                                borderColor: tf.color,
                                                                boxShadow: `0 0 20px ${tf.color}40`
                                                            }}
                                                        >
                                                            {node.isHistorical ? (
                                                                <History size={22} style={{ color: tf.color }} />
                                                            ) : (
                                                                <FileText size={22} style={{ color: tf.color }} />
                                                            )}
                                                        </div>

                                                        {/* Title Label */}
                                                        <div className="mt-3 w-44 text-center">
                                                            <p
                                                                className="text-[10px] font-mono mb-0.5 uppercase tracking-wider"
                                                                style={{ color: tf.color }}
                                                            >
                                                                {node.isHistorical
                                                                    ? format(new Date(node.date), 'yyyy')
                                                                    : formatDistanceToNow(new Date(node.date), { addSuffix: true })
                                                                }
                                                            </p>
                                                            <p className="text-xs font-bold text-[#1c1c1c] dark:text-white line-clamp-2 leading-tight group-hover:text-[#00dc82] transition-colors bg-white dark:bg-[#2a2a2a] px-2 py-1.5 border border-[#E7E7E7] dark:border-[#3a3a3a] shadow-sm">
                                                                {node.title}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details Card */}
                                                    <div
                                                        className={`absolute left-1/2 -translate-x-1/2 w-80 p-5 bg-white dark:bg-[#2a2a2a] border-2 shadow-2xl transition-all duration-300 z-30 
                                                            ${i % 2 === 0 ? 'top-full mt-4' : 'bottom-full mb-36'} 
                                                            opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto scale-95 group-hover:scale-100 origin-center`}
                                                        style={{ borderColor: tf.color }}
                                                    >
                                                        {/* Timeframe Badge */}
                                                        <div
                                                            className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider mb-3"
                                                            style={{ backgroundColor: tf.bgColor, color: tf.color }}
                                                        >
                                                            {tf.icon}
                                                            {tf.label}
                                                            {node.isHistorical && ' • Historical'}
                                                        </div>

                                                        <div
                                                            className="text-xs font-mono mb-2 flex items-center gap-2 uppercase tracking-wider"
                                                            style={{ color: tf.color }}
                                                        >
                                                            <span className="w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: tf.color }} />
                                                            {format(new Date(node.date), 'MMM d, yyyy')}
                                                        </div>

                                                        <h4 className="text-sm font-bold text-[#1c1c1c] dark:text-white leading-snug mb-3">
                                                            {node.title}
                                                        </h4>

                                                        <div className="flex items-center justify-between text-xs text-[#71767A] border-t-2 border-[#E7E7E7] dark:border-[#3a3a3a] pt-3">
                                                            <span className="font-bold text-[#1c1c1c] dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                                                <span className="w-2 h-2" style={{ backgroundColor: tf.color }} />
                                                                {node.source}
                                                            </span>
                                                            <span
                                                                className="flex items-center gap-1 font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform"
                                                                style={{ color: tf.color }}
                                                            >
                                                                Read <ExternalLink size={12} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>

            {/* Stats Bar */}
            <div className="absolute top-4 right-20 z-20 flex gap-3">
                <div className="bg-white/90 dark:bg-[#2a2a2a]/90 backdrop-blur-sm border border-[#E7E7E7] dark:border-[#3a3a3a] px-3 py-1.5 text-center shadow-sm">
                    <p className="text-lg font-bold text-[#1c1c1c] dark:text-white">{nodes.length}</p>
                    <p className="text-[9px] text-[#71767A] uppercase tracking-wider">Articles</p>
                </div>
                <div className="bg-white/90 dark:bg-[#2a2a2a]/90 backdrop-blur-sm border border-[#E7E7E7] dark:border-[#3a3a3a] px-3 py-1.5 text-center shadow-sm">
                    <p className="text-lg font-bold text-[#00dc82]">{activeTimeframes.size}</p>
                    <p className="text-[9px] text-[#71767A] uppercase tracking-wider">Timeframes</p>
                </div>
            </div>
        </div>
    );
}
