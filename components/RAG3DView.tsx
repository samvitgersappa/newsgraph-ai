'use client';

import { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Line, Sphere, Box } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
    Brain, 
    Search, 
    Zap, 
    Network, 
    Eye, 
    RotateCcw, 
    Maximize2, 
    Minimize2,
    Info,
    FileText,
    ArrowRight,
    Loader2,
    Database,
    GitBranch,
    Target,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { fetchRAGArticlesForQuery } from '@/app/actions';

// ============================================================================
// TYPES
// ============================================================================

interface RAGNode {
    id: string;
    title: string;
    source: string;
    position: [number, number, number];
    score: number;
    breakdown: {
        titleMatch: number;
        contentMatch: number;
        phraseMatch: number;
        recency: number;
        sourceCredibility: number;
    };
    publishedAt: string;
    url: string;
    description?: string;
}

interface RAGEdge {
    from: string;
    to: string;
    weight: number;
    type: 'similarity' | 'entity' | 'source' | 'temporal';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate 3D positions for nodes in a sphere layout
function generateNodePositions(count: number): [number, number, number][] {
    const positions: [number, number, number][] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < count; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const radius = 3 + (i * 0.3); // Spread out based on index (relevance)
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        positions.push([x, y, z]);
    }
    
    return positions;
}

// Generate edges based on source similarity
function generateEdges(nodes: RAGNode[]): RAGEdge[] {
    const edges: RAGEdge[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];
            
            // Source similarity
            if (node1.source === node2.source) {
                edges.push({
                    from: node1.id,
                    to: node2.id,
                    weight: 0.7,
                    type: 'source'
                });
            }
            
            // Score similarity (connect nodes with similar relevance)
            const scoreDiff = Math.abs(node1.score - node2.score);
            if (scoreDiff < 0.15) {
                edges.push({
                    from: node1.id,
                    to: node2.id,
                    weight: 1 - scoreDiff,
                    type: 'similarity'
                });
            }
        }
    }
    
    return edges;
}

// ============================================================================
// 3D COMPONENTS
// ============================================================================

interface ArticleNodeProps {
    node: RAGNode;
    isSelected: boolean;
    isHovered: boolean;
    onSelect: () => void;
    onHover: (hovered: boolean) => void;
    queryNode?: boolean;
}

function ArticleNode({ node, isSelected, isHovered, onSelect, onHover, queryNode }: ArticleNodeProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    
    // Animate the node
    useFrame((state) => {
        if (meshRef.current) {
            // Gentle floating animation
            meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime + parseInt(node.id)) * 0.1;
            
            // Scale on hover
            const targetScale = isHovered || isSelected ? 1.3 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
        
        if (glowRef.current) {
            // Pulse the glow
            const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
            glowRef.current.scale.setScalar((isSelected ? 2.5 : 2) + pulse * 0.5);
        }
    });
    
    // Color based on score
    const getNodeColor = () => {
        if (queryNode) return '#00dc82';
        if (node.score > 0.8) return '#00dc82';
        if (node.score > 0.6) return '#FFD700';
        if (node.score > 0.4) return '#FF8C00';
        return '#FF4444';
    };
    
    const nodeSize = 0.3 + node.score * 0.3;
    
    return (
        <group position={node.position}>
            {/* Glow effect */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[nodeSize * 1.5, 16, 16]} />
                <meshBasicMaterial 
                    color={getNodeColor()} 
                    transparent 
                    opacity={isSelected ? 0.3 : 0.1} 
                />
            </mesh>
            
            {/* Main node */}
            <mesh
                ref={meshRef}
                onClick={onSelect}
                onPointerOver={() => onHover(true)}
                onPointerOut={() => onHover(false)}
            >
                {queryNode ? (
                    <boxGeometry args={[nodeSize * 1.5, nodeSize * 1.5, nodeSize * 1.5]} />
                ) : (
                    <sphereGeometry args={[nodeSize, 32, 32]} />
                )}
                <meshStandardMaterial
                    color={getNodeColor()}
                    emissive={getNodeColor()}
                    emissiveIntensity={isSelected ? 0.5 : 0.2}
                    metalness={0.5}
                    roughness={0.2}
                />
            </mesh>
            
            {/* Label */}
            {(isHovered || isSelected) && (
                <Html
                    position={[0, nodeSize + 0.5, 0]}
                    center
                    style={{
                        pointerEvents: 'none',
                        width: '200px',
                    }}
                >
                    <div className="bg-[#2a2a2a] border-2 border-[#00dc82] p-3 shadow-xl">
                        <p className="text-xs text-[#00dc82] font-mono mb-1">{node.source}</p>
                        <p className="text-sm text-white font-bold line-clamp-2">{node.title}</p>
                        <p className="text-xs text-[#71767A] mt-2">
                            Score: <span className="text-[#00dc82]">{(node.score * 100).toFixed(0)}%</span>
                        </p>
                    </div>
                </Html>
            )}
        </group>
    );
}

interface EdgeLineProps {
    start: [number, number, number];
    end: [number, number, number];
    weight: number;
    type: string;
    isHighlighted: boolean;
}

function EdgeLine({ start, end, weight, type, isHighlighted }: EdgeLineProps) {
    const getEdgeColor = () => {
        if (isHighlighted) return '#00dc82';
        switch (type) {
            case 'entity': return '#6B7280';
            case 'source': return '#3B82F6';
            case 'temporal': return '#8B5CF6';
            default: return '#4B5563';
        }
    };
    
    return (
        <Line
            points={[start, end]}
            color={getEdgeColor()}
            lineWidth={isHighlighted ? 3 : 1}
            opacity={isHighlighted ? 1 : 0.3}
            transparent
            dashed={!isHighlighted}
            dashSize={0.2}
            gapSize={0.1}
        />
    );
}

function QueryNode({ position, label }: { position: [number, number, number]; label?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
        }
    });
    
    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial
                    color="#00dc82"
                    emissive="#00dc82"
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.1}
                    wireframe
                />
            </mesh>
            <Html position={[0, 1.2, 0]} center>
                <div className="bg-[#00dc82] text-[#1c1c1c] px-3 py-1 font-bold text-sm uppercase tracking-wider whitespace-nowrap max-w-[200px] truncate">
                    {label || 'Query'}
                </div>
            </Html>
        </group>
    );
}

// ============================================================================
// SCENE COMPONENT
// ============================================================================

interface RAGSceneProps {
    nodes: RAGNode[];
    edges: RAGEdge[];
    selectedNode: string | null;
    hoveredNode: string | null;
    onSelectNode: (id: string | null) => void;
    onHoverNode: (id: string | null) => void;
    showQuery: boolean;
    queryLabel?: string;
}

function RAGScene({ nodes, edges, selectedNode, hoveredNode, onSelectNode, onHoverNode, showQuery, queryLabel }: RAGSceneProps) {
    const { camera } = useThree();
    
    // Get node position by id
    const getNodePosition = (id: string): [number, number, number] => {
        const node = nodes.find(n => n.id === id);
        return node ? node.position : [0, 0, 0];
    };
    
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00dc82" />
            <spotLight
                position={[0, 15, 0]}
                angle={0.5}
                penumbra={1}
                intensity={0.5}
                color="#00dc82"
            />
            
            {/* Grid */}
            <gridHelper args={[20, 20, '#3a3a3a', '#2a2a2a']} position={[0, -5, 0]} />
            
            {/* Query node */}
            {showQuery && <QueryNode position={[0, 4, 0]} label={queryLabel} />}
            
            {/* Edges */}
            {edges.map((edge, i) => (
                <EdgeLine
                    key={i}
                    start={getNodePosition(edge.from)}
                    end={getNodePosition(edge.to)}
                    weight={edge.weight}
                    type={edge.type}
                    isHighlighted={selectedNode === edge.from || selectedNode === edge.to}
                />
            ))}
            
            {/* Query connections */}
            {showQuery && nodes.map((node, i) => (
                <EdgeLine
                    key={`query-${i}`}
                    start={[0, 4, 0]}
                    end={node.position}
                    weight={node.score}
                    type="similarity"
                    isHighlighted={selectedNode === node.id}
                />
            ))}
            
            {/* Article nodes */}
            {nodes.map((node) => (
                <ArticleNode
                    key={node.id}
                    node={node}
                    isSelected={selectedNode === node.id}
                    isHovered={hoveredNode === node.id}
                    onSelect={() => onSelectNode(selectedNode === node.id ? null : node.id)}
                    onHover={(hovered) => onHoverNode(hovered ? node.id : null)}
                />
            ))}
            
            {/* Camera controls */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={30}
                autoRotate={!selectedNode}
                autoRotateSpeed={0.5}
            />
        </>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RAG3DViewProps {
    onClose?: () => void;
}

export function RAG3DView({ onClose }: RAG3DViewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentQuery, setCurrentQuery] = useState('');
    const [showQuery, setShowQuery] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [nodes, setNodes] = useState<RAGNode[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const edges = useMemo(() => generateEdges(nodes), [nodes]);
    
    const selectedNodeData = nodes.find((n: RAGNode) => n.id === selectedNode);
    
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setSelectedNode(null);
        
        try {
            const articles = await fetchRAGArticlesForQuery(searchQuery);
            
            if (articles.length === 0) {
                setError(`No articles found for "${searchQuery}". Try a different topic.`);
                setNodes([]);
                setShowQuery(false);
            } else {
                // Generate positions for nodes
                const positions = generateNodePositions(articles.length);
                
                const nodesWithPositions: RAGNode[] = articles.map((article: any, i: number) => ({
                    id: article.id,
                    title: article.title,
                    source: article.source,
                    position: positions[i],
                    score: article.score,
                    breakdown: article.breakdown,
                    publishedAt: article.publishedAt,
                    url: article.url,
                    description: article.description,
                }));
                
                setNodes(nodesWithPositions);
                setCurrentQuery(searchQuery);
                setShowQuery(true);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch articles. Please try again.');
            setNodes([]);
            setShowQuery(false);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);
    
    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    
    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative w-full'} bg-[#1c1c1c]`}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-[#1c1c1c] to-transparent">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00dc82] flex items-center justify-center">
                            <Brain className="w-6 h-6 text-[#1c1c1c]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                                3D RAG Knowledge Graph
                            </h2>
                            <p className="text-xs text-[#71767A]">
                                {currentQuery ? `Showing results for: "${currentQuery}"` : 'Enter a topic to retrieve related articles'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="p-2 bg-[#2a2a2a] hover:bg-[#00dc82] text-white hover:text-[#1c1c1c] border-2 border-[#3a3a3a] hover:border-[#00dc82] transition-all"
                        >
                            <Info size={16} />
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 bg-[#2a2a2a] hover:bg-[#00dc82] text-white hover:text-[#1c1c1c] border-2 border-[#3a3a3a] hover:border-[#00dc82] transition-all"
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="flex gap-2 max-w-xl">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71767A]" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter a topic (e.g., climate change, bitcoin, elections)..."
                            className="w-full bg-[#2a2a2a] border-2 border-[#3a3a3a] focus:border-[#00dc82] text-white pl-10 pr-4 py-2 outline-none transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !searchQuery.trim()}
                        className="px-4 py-2 bg-[#00dc82] hover:bg-[#00ff99] text-[#1c1c1c] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Zap size={18} />
                                Retrieve
                            </>
                        )}
                    </button>
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="mt-3 flex items-center gap-2 text-[#FF4444] text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>
            
            {/* Info Panel */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute top-40 left-4 z-20 w-80 bg-[#2a2a2a] border-2 border-[#3a3a3a] p-4"
                    >
                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Network size={16} className="text-[#00dc82]" />
                            How RAG Works
                        </h3>
                        <div className="space-y-3 text-xs text-[#a0a0a0]">
                            <div className="flex gap-2">
                                <Database className="text-[#00dc82] flex-shrink-0" size={14} />
                                <p><strong className="text-white">Fetch:</strong> Articles are retrieved from news APIs based on your query</p>
                            </div>
                            <div className="flex gap-2">
                                <Search className="text-[#00dc82] flex-shrink-0" size={14} />
                                <p><strong className="text-white">Filter:</strong> AI strictly filters for articles DIRECTLY about your topic</p>
                            </div>
                            <div className="flex gap-2">
                                <Target className="text-[#00dc82] flex-shrink-0" size={14} />
                                <p><strong className="text-white">Score:</strong> Each article is scored for relevance (TF-IDF, recency, credibility)</p>
                            </div>
                            <div className="flex gap-2">
                                <GitBranch className="text-[#00dc82] flex-shrink-0" size={14} />
                                <p><strong className="text-white">Connect:</strong> Edges show relationships between related articles</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
                            <p className="text-xs text-[#71767A] mb-2">Score Legend:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="flex items-center gap-1 text-xs">
                                    <span className="w-3 h-3 bg-[#00dc82]" /> &gt;80%
                                </span>
                                <span className="flex items-center gap-1 text-xs">
                                    <span className="w-3 h-3 bg-[#FFD700]" /> 60-80%
                                </span>
                                <span className="flex items-center gap-1 text-xs">
                                    <span className="w-3 h-3 bg-[#FF8C00]" /> 40-60%
                                </span>
                                <span className="flex items-center gap-1 text-xs">
                                    <span className="w-3 h-3 bg-[#FF4444]" /> &lt;40%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Selected Node Details */}
            <AnimatePresence>
                {selectedNodeData && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-40 right-4 z-20 w-80 bg-[#2a2a2a] border-2 border-[#00dc82] p-4"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="text-[#00dc82]" size={18} />
                                <span className="text-xs text-[#00dc82] font-mono uppercase">{selectedNodeData.source}</span>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-[#71767A] hover:text-white text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        
                        <h4 className="text-sm font-bold text-white mb-2 leading-tight">
                            {selectedNodeData.title}
                        </h4>
                        
                        {selectedNodeData.description && (
                            <p className="text-xs text-[#a0a0a0] mb-3 line-clamp-2">
                                {selectedNodeData.description}
                            </p>
                        )}
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-[#71767A]">Relevance Score</span>
                                <span className="text-[#00dc82] font-bold">{(selectedNodeData.score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-[#1c1c1c] overflow-hidden">
                                <div 
                                    className="h-full bg-[#00dc82]" 
                                    style={{ width: `${selectedNodeData.score * 100}%` }} 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                            <p className="text-[#71767A] font-bold uppercase tracking-wider mb-2">Score Breakdown</p>
                            {Object.entries(selectedNodeData.breakdown).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <span className="text-[#a0a0a0] w-24 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                    <div className="flex-1 h-1.5 bg-[#1c1c1c]">
                                        <div 
                                            className="h-full bg-[#00dc82]" 
                                            style={{ width: `${(value as number) * 100}%` }} 
                                        />
                                    </div>
                                    <span className="text-[#00dc82] w-10 text-right">{((value as number) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
                            <a
                                href={selectedNodeData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2 bg-[#00dc82] hover:bg-[#00ff99] text-[#1c1c1c] font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Read Article <ExternalLink size={14} />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Stats Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="bg-[#2a2a2a] border-2 border-[#3a3a3a] px-3 py-2">
                        <p className="text-[10px] text-[#71767A] uppercase tracking-wider">Documents</p>
                        <p className="text-lg font-bold text-white">{nodes.length}</p>
                    </div>
                    <div className="bg-[#2a2a2a] border-2 border-[#3a3a3a] px-3 py-2">
                        <p className="text-[10px] text-[#71767A] uppercase tracking-wider">Connections</p>
                        <p className="text-lg font-bold text-white">{edges.length}</p>
                    </div>
                    {nodes.length > 0 && (
                        <div className="bg-[#2a2a2a] border-2 border-[#3a3a3a] px-3 py-2">
                            <p className="text-[10px] text-[#71767A] uppercase tracking-wider">Avg Score</p>
                            <p className="text-lg font-bold text-[#00dc82]">
                                {(nodes.reduce((sum: number, n: RAGNode) => sum + n.score, 0) / nodes.length * 100).toFixed(0)}%
                            </p>
                        </div>
                    )}
                </div>
                
                <div className="text-xs text-[#71767A]">
                    <span className="text-[#00dc82]">Drag</span> to rotate • 
                    <span className="text-[#00dc82]"> Scroll</span> to zoom • 
                    <span className="text-[#00dc82]"> Click</span> nodes to inspect
                </div>
            </div>
            
            {/* Empty State */}
            {nodes.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                        <Database size={64} className="mx-auto mb-4 text-[#3a3a3a]" />
                        <p className="text-[#71767A] text-lg uppercase tracking-wider mb-2">No Articles Loaded</p>
                        <p className="text-[#3a3a3a] text-sm">Enter a topic above and click "Retrieve" to visualize related articles</p>
                    </div>
                </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#1c1c1c]/80">
                    <div className="text-center">
                        <Loader2 size={48} className="mx-auto mb-4 text-[#00dc82] animate-spin" />
                        <p className="text-white text-lg uppercase tracking-wider">Retrieving Articles...</p>
                        <p className="text-[#71767A] text-sm mt-2">Filtering for relevance to "{searchQuery}"</p>
                    </div>
                </div>
            )}
            
            {/* 3D Canvas */}
            <div className={`${isFullscreen ? 'h-screen' : 'h-[700px]'} w-full`}>
                <Canvas
                    camera={{ position: [10, 8, 10], fov: 60 }}
                    gl={{ antialias: true }}
                >
                    <Suspense fallback={null}>
                        <RAGScene
                            nodes={nodes}
                            edges={edges}
                            selectedNode={selectedNode}
                            hoveredNode={hoveredNode}
                            onSelectNode={setSelectedNode}
                            onHoverNode={setHoveredNode}
                            showQuery={showQuery}
                            queryLabel={currentQuery}
                        />
                    </Suspense>
                </Canvas>
            </div>
        </div>
    );
}
