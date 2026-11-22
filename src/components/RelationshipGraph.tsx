import React, { useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { CHARACTER_NODES, RELATIONSHIP_EDGES } from '../data/novelData';
import { CharacterNode, RelationshipEdge, WorldKey } from '../types/novel';

type LayerMode = 'all' | 'direct' | 'hidden';

const WORLD_COLORS: Record<WorldKey | 'core', { fill: string; stroke: string; text: string }> = {
  core: { fill: '#141413', stroke: '#C81E1E', text: '#FFFFFF' },
  county: { fill: '#FFFFFF', stroke: '#52525B', text: '#141413' },
  dynasty: { fill: '#FFFFFF', stroke: '#991B1B', text: '#141413' },
  atlantis: { fill: '#FFFFFF', stroke: '#1D4ED8', text: '#141413' },
  sect: { fill: '#FFFFFF', stroke: '#0F766E', text: '#141413' },
  skywhale: { fill: '#FFFFFF', stroke: '#0369A1', text: '#141413' },
  mirror_desert: { fill: '#FFFFFF', stroke: '#A16207', text: '#141413' },
  lantern_market: { fill: '#FFFFFF', stroke: '#B91C1C', text: '#141413' },
  alt_modern: { fill: '#FFFFFF', stroke: '#4338CA', text: '#141413' },
  alt_apocalypse: { fill: '#FFFFFF', stroke: '#334155', text: '#141413' },
  convergence: { fill: '#FFFFFF', stroke: '#B45309', text: '#141413' },
};

export const RelationshipGraph: React.FC = () => {
  const [nodes, setNodes] = useState<CharacterNode[]>(CHARACTER_NODES);
  const [layerMode, setLayerMode] = useState<LayerMode>('all');
  const [worldFilter, setWorldFilter] = useState<WorldKey | 'all'>('all');
  const [highlightHidden, setHighlightHidden] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('protagonist');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const visibleNodes = useMemo(() => {
    if (worldFilter === 'all') return nodes;
    return nodes.filter(
      (n) => n.worldKey === 'core' || n.worldKey === worldFilter || n.worldKey === 'convergence'
    );
  }, [nodes, worldFilter]);

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );

  const visibleEdges = useMemo(() => {
    return RELATIONSHIP_EDGES.filter((edge) => {
      if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) {
        return false;
      }
      if (layerMode === 'direct') return edge.type === 'direct';
      if (layerMode === 'hidden') return edge.type === 'hidden';
      return true;
    });
  }, [visibleNodeIds, layerMode]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => RELATIONSHIP_EDGES.find((e) => e.id === selectedEdgeId) || null,
    [selectedEdgeId]
  );

  const relatedEdgesForNode = useMemo(() => {
    if (!selectedNodeId) return [];
    return RELATIONSHIP_EDGES.filter(
      (e) => e.source === selectedNodeId || e.target === selectedNodeId
    );
  }, [selectedNodeId]);

  const getSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = 920 / rect.width;
    const scaleY = 600 / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent, node: CharacterNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    const pt = getSvgCoords(e.clientX, e.clientY);
    draggingRef.current = {
      id: node.id,
      offsetX: node.x - pt.x,
      offsetY: node.y - pt.y,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const pt = getSvgCoords(e.clientX, e.clientY);
    const { id, offsetX, offsetY } = draggingRef.current;
    const clampedX = Math.max(70, Math.min(850, pt.x + offsetX));
    const clampedY = Math.max(60, Math.min(545, pt.y + offsetY));
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: clampedX, y: clampedY } : n))
    );
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  const resetLayout = () => {
    setNodes(CHARACTER_NODES);
    setZoom(1);
    setWorldFilter('all');
    setLayerMode('all');
  };

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="space-y-6 pb-20">
      {/* Graph Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E4E4E7]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F4F4F5] rounded-lg">
            {(
              [
                { id: 'all', label: '全部关系' },
                { id: 'direct', label: '明线 · 当世羁绊' },
                { id: 'hidden', label: '暗线 · 跨世伏笔' },
              ] as { id: LayerMode; label: string }[]
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setLayerMode(btn.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  layerMode === btn.id
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-[#52525B] hover:text-[#141413]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <select
            aria-label="按世界筛选人物"
            value={worldFilter}
            onChange={(e) => setWorldFilter(e.target.value as WorldKey | 'all')}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#D4D4D8] rounded-md text-[#141413] focus:outline-none focus:border-[#141413] cursor-pointer"
          >
            <option value="all">全部世界（九世全览）</option>
            <option value="county">第一世 · 青溪县城（凡尘）</option>
            <option value="dynasty">第二世 · 大景皇朝（庙堂）</option>
            <option value="atlantis">第三世 · 亚特兰蒂斯（深渊）</option>
            <option value="sect">第四世 · 万花宗（仙门）</option>
            <option value="skywhale">第五世 · 云鲸浮空城（苍穹）</option>
            <option value="mirror_desert">第六世 · 镜面沙海（时空）</option>
            <option value="lantern_market">第七世 · 枯骨灯市（幽冥）</option>
            <option value="alt_modern">第八世 · 霓虹旧港（架空现代）</option>
            <option value="alt_apocalypse">第九世 · 灰烬方舟（架空末世）</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHighlightHidden((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              highlightHidden
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
                : 'bg-white border-[#D4D4D8] text-[#52525B]'
            }`}
          >
            {highlightHidden ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>{highlightHidden ? '朱砂高亮暗线' : '弱化暗线显示'}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))}
            className="p-2 bg-white border border-[#D4D4D8] hover:border-[#141413] rounded-md text-[#141413] cursor-pointer"
            aria-label="放大图谱"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
            className="p-2 bg-white border border-[#D4D4D8] hover:border-[#141413] rounded-md text-[#141413] cursor-pointer"
            aria-label="缩小图谱"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetLayout}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-[#D4D4D8] hover:border-[#141413] rounded-md text-[#52525B] hover:text-[#141413] cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置排版</span>
          </button>
        </div>
      </div>

      {/* Interactive Graph + Editorial Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Interactive SVG Canvas */}
        <div className="lg:col-span-8 bg-white border border-[#E4E4E7] rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[#E4E4E7] flex flex-wrap items-center justify-between gap-3 text-xs text-[#71717A]">
            <span>拖拽任意人物节点调整布局 · 点击节点或连线查看档案</span>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-5 h-[1.5px] bg-[#71717A]" />
                <span>明线（当世羁绊）</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#C81E1E]">
                <span className="inline-block w-5 h-[1.5px] border-t border-dashed border-[#C81E1E]" />
                <span>暗线（跨世伏笔）</span>
              </span>
            </div>
          </div>

          <div className="relative flex-1 min-h-[480px] sm:min-h-[560px] overflow-hidden bg-[#FCFCFD]">
            <svg
              ref={svgRef}
              viewBox="0 0 920 600"
              className="w-full h-full select-none touch-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <defs>
                <pattern
                  id="editorial-grid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="#F1F1F4"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              <rect width="920" height="600" fill="url(#editorial-grid)" />

              <g
                transform={`translate(${460 * (1 - zoom)}, ${300 * (1 - zoom)}) scale(${zoom})`}
              >
                {/* Quadrant Era Labels (Subtle Editorial Grounding) */}
                <text x="36" y="34" fill="#A1A1AA" fontSize="11" fontWeight="500">
                  古纪凡尘 & 苍穹云鲸
                </text>
                <text x="748" y="34" fill="#A1A1AA" fontSize="11" fontWeight="500">
                  大景皇朝 & 万花仙门
                </text>
                <text x="36" y="582" fill="#A1A1AA" fontSize="11" fontWeight="500">
                  深海亚特兰蒂斯 & 镜面沙海
                </text>
                <text x="690" y="582" fill="#A1A1AA" fontSize="11" fontWeight="500">
                  幽冥灯市 · 架空现代 · 永冬末世
                </text>

                {/* Relationship Edges */}
                {visibleEdges.map((edge) => {
                  const src = getNodeById(edge.source);
                  const tgt = getNodeById(edge.target);
                  if (!src || !tgt) return null;

                  const isHidden = edge.type === 'hidden';
                  const isSelected = selectedEdgeId === edge.id;
                  const isConnectedToSelectedNode =
                    selectedNodeId &&
                    (edge.source === selectedNodeId || edge.target === selectedNodeId);

                  // Gentle curve for hidden cross-era threads so they never overlap direct lines
                  const midX = (src.x + tgt.x) / 2;
                  const midY = (src.y + tgt.y) / 2;
                  const dx = tgt.x - src.x;
                  const dy = tgt.y - src.y;
                  const curveOffset = isHidden ? 38 : 0;
                  const ctrlX = midX - dy * (curveOffset / Math.max(1, Math.hypot(dx, dy)));
                  const ctrlY = midY + dx * (curveOffset / Math.max(1, Math.hypot(dx, dy)));

                  const pathD = isHidden
                    ? `M ${src.x} ${src.y} Q ${ctrlX} ${ctrlY} ${tgt.x} ${tgt.y}`
                    : `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;

                  const strokeColor = isSelected
                    ? '#C81E1E'
                    : isHidden
                    ? highlightHidden
                      ? '#C81E1E'
                      : '#D4D4D8'
                    : isConnectedToSelectedNode
                    ? '#141413'
                    : '#A1A1AA';

                  const strokeOpacity = isSelected
                    ? 1
                    : isHidden
                    ? highlightHidden
                      ? 0.85
                      : 0.35
                    : isConnectedToSelectedNode
                    ? 0.9
                    : 0.45;

                  const labelX = isHidden ? (src.x + 2 * ctrlX + tgt.x) / 4 : midX;
                  const labelY = isHidden ? (src.y + 2 * ctrlY + tgt.y) / 4 : midY;

                  return (
                    <g
                      key={edge.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdgeId(edge.id);
                        setSelectedNodeId(null);
                      }}
                    >
                      {/* Wider invisible hit target for easy clicking */}
                      <path d={pathD} fill="none" stroke="transparent" strokeWidth="14" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isSelected ? 2.5 : isHidden ? 1.8 : 1.5}
                        strokeDasharray={isHidden ? '6 4' : undefined}
                        strokeOpacity={strokeOpacity}
                      />
                      {(isSelected ||
                        isConnectedToSelectedNode ||
                        (isHidden && highlightHidden && layerMode === 'hidden')) && (
                        <g transform={`translate(${labelX}, ${labelY})`}>
                          <rect
                            x="-56"
                            y="-10"
                            width="112"
                            height="20"
                            rx="4"
                            fill="#FFFFFF"
                            stroke={isHidden ? '#FECACA' : '#E4E4E7'}
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="10"
                            fill={isHidden ? '#B91C1C' : '#3F3F46'}
                          >
                            {edge.label.length > 10
                              ? `${edge.label.slice(0, 10)}…`
                              : edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Character Nodes */}
                {visibleNodes.map((node) => {
                  const palette = WORLD_COLORS[node.worldKey];
                  const isSelected = selectedNodeId === node.id;
                  const radius = node.isProtagonist ? 42 : 30;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onPointerDown={(e) => handlePointerDown(e, node)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      {isSelected && (
                        <circle
                          r={radius + 6}
                          fill="none"
                          stroke="#C81E1E"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      )}
                      <circle
                        r={radius}
                        fill={palette.fill}
                        stroke={isSelected ? '#C81E1E' : palette.stroke}
                        strokeWidth={node.isProtagonist ? 2.5 : 1.75}
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={node.isProtagonist ? -6 : -3}
                        fill={palette.text}
                        fontSize={node.isProtagonist ? '13' : '12'}
                        fontWeight="600"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {node.name}
                      </text>
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={node.isProtagonist ? 12 : 12}
                        fill={node.isProtagonist ? '#D4D4D8' : '#71717A'}
                        fontSize="9.5"
                      >
                        {node.worldLabel}
                      </text>
                      {/* Clean unboxed sub-caption beneath node */}
                      <text
                        textAnchor="middle"
                        y={radius + 16}
                        fill="#52525B"
                        fontSize="10.5"
                        fontWeight="500"
                      >
                        {node.title.length > 12 ? `${node.title.slice(0, 12)}…` : node.title}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Editorial Character / Edge Dossier Panel */}
        <aside className="lg:col-span-4 bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E4E4E7]">
                <div className="text-xs font-medium text-[#C81E1E]">
                  {selectedNode.worldLabel} · {selectedNode.role}
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-[#141413] mt-1">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-[#71717A] mt-1">{selectedNode.title}</p>
                <p className="text-xs text-[#52525B] mt-2 font-mono-num">
                  命运状态：{selectedNode.eraStatus}
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs font-medium text-[#71717A]">
                    主角假死前（当世养成/相伴）
                  </div>
                  <p className="text-[#27272A] leading-relaxed mt-1">
                    {selectedNode.beforeDeath}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#71717A]">
                    主角假死后（岁月发酵/反转）
                  </div>
                  <p className="text-[#27272A] leading-relaxed mt-1">
                    {selectedNode.afterDeath}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E4E4E7]">
                  <div className="text-xs font-medium text-[#C81E1E]">
                    关键信物与伏笔遗物
                  </div>
                  <p className="text-[#141413] font-medium mt-1">
                    {selectedNode.keepsake}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#71717A]">
                    视觉形象锚点（适配漫画/图生视频）
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed mt-1">
                    {selectedNode.visualAnchor}
                  </p>
                </div>
              </div>

              {/* Direct & Hidden Links List */}
              <div className="pt-4 border-t border-[#E4E4E7] space-y-2.5">
                <div className="text-xs font-medium text-[#71717A]">
                  关联脉络（点击跳转查看）
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {relatedEdgesForNode.map((edge) => {
                    const otherId =
                      edge.source === selectedNode.id ? edge.target : edge.source;
                    const otherNode = getNodeById(otherId);
                    return (
                      <button
                        key={edge.id}
                        type="button"
                        onClick={() => {
                          setSelectedEdgeId(edge.id);
                          setSelectedNodeId(null);
                        }}
                        className="w-full text-left p-2.5 rounded-md border border-[#E4E4E7] hover:border-[#141413] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-[#141413]">
                            ↔ {otherNode?.name}
                          </span>
                          <span
                            className={
                              edge.type === 'hidden'
                                ? 'text-[#C81E1E]'
                                : 'text-[#71717A]'
                            }
                          >
                            {edge.type === 'hidden' ? '跨世暗线' : '当世明线'}
                          </span>
                        </div>
                        <div className="text-xs text-[#52525B] mt-0.5 truncate">
                          {edge.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E4E4E7]">
                <div
                  className={`text-xs font-medium ${
                    selectedEdge.type === 'hidden'
                      ? 'text-[#C81E1E]'
                      : 'text-[#71717A]'
                  }`}
                >
                  {selectedEdge.type === 'hidden'
                    ? '跨世暗线关系 · 隐性伏笔'
                    : '当世明线关系 · 独立卷章'}
                </div>
                <h3 className="font-editorial text-xl font-semibold text-[#141413] mt-1.5">
                  {selectedEdge.label}
                </h3>
                <div className="text-xs text-[#52525B] mt-2">
                  {getNodeById(selectedEdge.source)?.name} ↔{' '}
                  {getNodeById(selectedEdge.target)?.name}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#27272A]">
                {selectedEdge.detail}
              </p>

              <div className="pt-4 border-t border-[#E4E4E7] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNodeId(selectedEdge.source);
                    setSelectedEdgeId(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium border border-[#D4D4D8] hover:border-[#141413] rounded-md cursor-pointer"
                >
                  查看 {getNodeById(selectedEdge.source)?.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNodeId(selectedEdge.target);
                    setSelectedEdgeId(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium border border-[#D4D4D8] hover:border-[#141413] rounded-md cursor-pointer"
                >
                  查看 {getNodeById(selectedEdge.target)?.name}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[#71717A]">
              点击左侧图谱中的人物或连线查看详细档案
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
