'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw, ExternalLink, Maximize2, Minimize2, FileText } from 'lucide-react';

interface GraphNode {
    id: string;
    title: string;
    date: string;
    source: string;
    url: string;
    x: number;
    y: number;
}

interface GraphViewProps {
    articles: any[];
}

export function GraphView({ articles }: GraphViewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Sort by date for a proper timeline
    const sortedArticles = [...articles].sort((a, b) =>
        new Date(a.metadata.publishedAt).getTime() - new Date(b.metadata.publishedAt).getTime()
    );

    // Dynamic sizing
    const nodeSpacing = 300; // Increased spacing for bigger nodes
    const startPadding = 150;
    const canvasWidth = Math.max(1200, (sortedArticles.length * nodeSpacing) + (startPadding * 2));
    const canvasHeight = isFullscreen ? window.innerHeight : 600;
    const centerY = canvasHeight / 2;

    const nodes: GraphNode[] = sortedArticles.map((item, i) => ({
        id: String(i),
        title: item.metadata.title,
        date: item.metadata.publishedAt,
        source: item.metadata.source,
        url: item.metadata.url,
        x: startPadding + (i * nodeSpacing),
        y: centerY + (i % 2 === 0 ? -100 : 100), // Increased vertical separation
    }));

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-[#1c1c1c]' : 'relative w-full h-[600px] bg-[#1c1c1c] border-2 border-[#3a3a3a]'} overflow-hidden transition-all duration-300`}>
            <TransformWrapper
                initialScale={0.8}
                centerOnInit={true}
                minScale={0.4}
                maxScale={2}
                limitToBounds={false}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-[#2a2a2a] hover:bg-[#00D166] text-white hover:text-[#1c1c1c] border-2 border-[#3a3a3a] hover:border-[#00D166] transition-all" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <div className="w-px h-8 bg-[#3a3a3a] mx-1" />
                            <button onClick={() => zoomIn()} className="p-2 bg-[#2a2a2a] hover:bg-[#00D166] text-white hover:text-[#1c1c1c] border-2 border-[#3a3a3a] hover:border-[#00D166] transition-all" title="Zoom In"><ZoomIn size={16} /></button>
                            <button onClick={() => zoomOut()} className="p-2 bg-[#2a2a2a] hover:bg-[#00D166] text-white hover:text-[#1c1c1c] border-2 border-[#3a3a3a] hover:border-[#00D166] transition-all" title="Zoom Out"><ZoomOut size={16} /></button>
                            <button onClick={() => resetTransform()} className="p-2 bg-[#2a2a2a] hover:bg-[#00D166] text-white hover:text-[#1c1c1c] border-2 border-[#3a3a3a] hover:border-[#00D166] transition-all" title="Reset View"><RotateCcw size={16} /></button>
                        </div>

                        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                            <div 
                                className="relative" 
                                style={{ width: canvasWidth, height: canvasHeight }}
                            >
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                    {/* Gradient Definition */}
                                    <defs>
                                        <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="rgba(0, 209, 102, 0)" />
                                            <stop offset="10%" stopColor="rgba(0, 209, 102, 0.5)" />
                                            <stop offset="90%" stopColor="rgba(0, 209, 102, 0.5)" />
                                            <stop offset="100%" stopColor="rgba(0, 209, 102, 0)" />
                                        </linearGradient>
                                    </defs>

                                    {/* Main Timeline Line */}
                                    <line
                                        x1={0}
                                        y1={centerY}
                                        x2={canvasWidth}
                                        y2={centerY}
                                        stroke="url(#timeline-gradient)"
                                        strokeWidth="2"
                                    />

                                    {/* Connecting lines to nodes */}
                                    {nodes.map((node, i) => (
                                        <line
                                            key={`link-${i}`}
                                            x1={node.x}
                                            y1={centerY}
                                            x2={node.x}
                                            y2={node.y}
                                            stroke="rgba(0, 209, 102, 0.2)"
                                            strokeWidth="1"
                                            strokeDasharray="4 4"
                                        />
                                    ))}
                                    
                                    {/* Date Markers on Timeline */}
                                    {nodes.map((node, i) => (
                                        <g key={`date-${i}`}>
                                            <circle cx={node.x} cy={centerY} r="3" fill="#00D166" />
                                            <text 
                                                x={node.x} 
                                                y={centerY + 20} 
                                                textAnchor="middle" 
                                                fill="rgba(113,118,122,0.8)" 
                                                fontSize="10"
                                                className="font-mono uppercase"
                                            >
                                                {format(new Date(node.date), 'MMM d')}
                                            </text>
                                        </g>
                                    ))}
                                </svg>

                                {nodes.map((node, i) => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                                        style={{ left: node.x, top: node.y }}
                                    >
                                        <a
                                            href={node.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group relative"
                                        >
                                            {/* Bigger Node Point with Icon */}
                                            <div className="relative z-10 cursor-pointer flex flex-col items-center">
                                                <div className="w-12 h-12 bg-[#2a2a2a] border-2 border-[#00D166] group-hover:bg-[#00D166] transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,209,102,0.3)] group-hover:shadow-[0_0_30px_rgba(0,209,102,0.6)]">
                                                    <FileText size={20} className="text-[#00D166] group-hover:text-[#1c1c1c] transition-colors" />
                                                </div>
                                                
                                                {/* Always Visible Title Label */}
                                                <div className="mt-3 w-40 text-center">
                                                    <p className="text-[10px] font-mono text-[#00D166] mb-0.5 uppercase tracking-wider">{format(new Date(node.date), 'MMM d')}</p>
                                                    <p className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-[#00D166] transition-colors bg-[#2a2a2a] px-2 py-1 border border-[#3a3a3a]">
                                                        {node.title}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Expanded Details Card (Hover) */}
                                            <div className={`absolute left-1/2 -translate-x-1/2 w-72 p-5 bg-[#2a2a2a] border-2 border-[#00D166] shadow-2xl transition-all duration-300 z-30 
                                                ${i % 2 === 0 ? 'top-full mt-2' : 'bottom-full mb-32'} 
                                                opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto scale-95 group-hover:scale-100 origin-center`}
                                            >
                                                <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#2a2a2a] border-l-2 border-t-2 border-[#00D166] transform rotate-45
                                                    ${i % 2 === 0 ? '-top-1.5 border-b-0 border-r-0' : '-bottom-1.5 border-l-0 border-t-0 border-r-2 border-b-2'}`} 
                                                />

                                                <div className="text-xs text-[#00D166] font-mono mb-2 flex items-center gap-2 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 bg-[#00D166] animate-pulse" />
                                                    {format(new Date(node.date), 'MMM d, yyyy • h:mm a')}
                                                </div>

                                                <h4 className="text-sm font-bold text-white leading-snug mb-3">
                                                    {node.title}
                                                </h4>

                                                <div className="flex items-center justify-between text-xs text-[#71767A] border-t-2 border-[#3a3a3a] pt-3">
                                                    <span className="font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                                        <span className="w-2 h-2 bg-[#FA3E3E]"></span>
                                                        {node.source}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[#00D166] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                                                        Read <ExternalLink size={12} />
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
}
