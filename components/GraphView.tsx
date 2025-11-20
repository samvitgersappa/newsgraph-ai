'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
    // Sort by date for a proper timeline
    const sortedArticles = [...articles].sort((a, b) =>
        new Date(a.metadata.publishedAt).getTime() - new Date(b.metadata.publishedAt).getTime()
    );

    const nodes: GraphNode[] = sortedArticles.map((item, i) => ({
        id: String(i),
        title: item.metadata.title,
        date: item.metadata.publishedAt,
        source: item.metadata.source,
        url: item.metadata.url,
        x: 100 + (i * 200), // Horizontal timeline spacing
        y: 300 + (i % 2 === 0 ? -50 : 50), // Zig-zag vertical offset
    }));

    return (
        <div className="relative w-full h-[600px] bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
            <TransformWrapper
                initialScale={0.8}
                initialPositionX={50}
                initialPositionY={50}
                minScale={0.5}
                maxScale={2}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            <button onClick={() => zoomIn()} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-white"><ZoomIn size={16} /></button>
                            <button onClick={() => zoomOut()} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-white"><ZoomOut size={16} /></button>
                            <button onClick={() => resetTransform()} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-white"><RotateCcw size={16} /></button>
                        </div>

                        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                            <div className="relative w-[2000px] h-[800px]"> {/* Large canvas for panning */}
                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                    {/* Timeline Line */}
                                    <line
                                        x1={nodes[0]?.x || 0}
                                        y1={300}
                                        x2={nodes[nodes.length - 1]?.x || 0}
                                        y2={300}
                                        stroke="#3f3f46"
                                        strokeWidth="2"
                                    />

                                    {/* Connecting lines to nodes */}
                                    {nodes.map((node, i) => (
                                        <line
                                            key={`link-${i}`}
                                            x1={node.x}
                                            y1={300}
                                            x2={node.x}
                                            y2={node.y}
                                            stroke="#52525b"
                                            strokeWidth="1"
                                            strokeDasharray="4 4"
                                        />
                                    ))}
                                </svg>

                                {nodes.map((node, i) => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: node.x, top: node.y }}
                                    >
                                        <a
                                            href={node.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group relative"
                                        >
                                            {/* Node Point with Glow */}
                                            <div className="relative z-10">
                                                <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-zinc-900 group-hover:bg-blue-400 transition-all mx-auto shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                                                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                                            </div>

                                            {/* Node Card */}
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-56 p-4 bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl transition-all group-hover:scale-105 group-hover:border-blue-500/50 z-20 opacity-80 group-hover:opacity-100">
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-t border-l border-white/10 transform rotate-45" />

                                                <div className="text-[10px] text-blue-400 font-mono mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                    {format(new Date(node.date), 'MMM d, yyyy')}
                                                </div>

                                                <h4 className="text-xs font-semibold text-zinc-100 line-clamp-3 leading-relaxed mb-2 group-hover:text-white">
                                                    {node.title}
                                                </h4>

                                                <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-2">
                                                    <span>{node.source}</span>
                                                    <span className="text-blue-400/50 group-hover:text-blue-400">Read &rarr;</span>
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
