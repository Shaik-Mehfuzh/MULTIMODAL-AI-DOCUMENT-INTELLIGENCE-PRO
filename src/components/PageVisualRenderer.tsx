import React, { useState } from 'react';
import { DocumentElement, DocumentPage, PatchAttribution } from '../types/colpali';
import { Eye, Layers, Maximize2, Sparkles, Table as TableIcon, BarChart2 } from 'lucide-react';

interface PageVisualRendererProps {
  page: DocumentPage;
  documentTitle: string;
  showPatchGrid?: boolean;
  showHeatmap?: boolean;
  patchHeatmap?: PatchAttribution[];
  activeElementId?: string;
  highlightBBox?: [number, number, number, number];
  onSelectElement?: (element: DocumentElement) => void;
  scale?: number;
}

export const PageVisualRenderer: React.FC<PageVisualRendererProps> = ({
  page,
  documentTitle,
  showPatchGrid = false,
  showHeatmap = true,
  patchHeatmap = [],
  activeElementId,
  highlightBBox,
  onSelectElement,
  scale = 1,
}) => {
  const [hoveredPatch, setHoveredPatch] = useState<PatchAttribution | null>(null);

  // Group heatmaps by grid cells
  const heatmapMap = new Map<string, PatchAttribution>();
  patchHeatmap.forEach((p) => {
    const key = `${p.row}-${p.col}`;
    if (!heatmapMap.has(key) || (heatmapMap.get(key)?.score || 0) < p.score) {
      heatmapMap.set(key, p);
    }
  });

  return (
    <div className="relative mx-auto bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden select-none transition-all duration-200">
      {/* Top Page Banner */}
      <div className="bg-slate-950/80 backdrop-blur px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-cyan-400">Page {page.pageNumber}</span>
          <span className="text-slate-600">|</span>
          <span className="truncate">{documentTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
            {page.patchGridSize.rows}×{page.patchGridSize.cols} ViT Patches (1024 tokens)
          </span>
        </div>
      </div>

      {/* Main Page Canvas / Document Layout Container */}
      <div
        className="relative bg-[#0d1322] p-8 min-h-[780px] w-full flex flex-col justify-between font-sans text-slate-200"
        style={{ transformOrigin: 'top center' }}
      >
        {/* Render Layout Elements inside Page */}
        <div className="space-y-6 relative z-10">
          {page.elements.map((el) => {
            const isSelected = activeElementId === el.id;
            return (
              <div
                key={el.id}
                onClick={() => onSelectElement && onSelectElement(el)}
                className={`relative rounded-lg p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 bg-cyan-950/30'
                    : 'hover:bg-slate-800/40 border border-slate-800/60'
                }`}
              >
                {/* Element Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                  {el.type === 'table' && (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded">
                      <TableIcon className="w-3 h-3" /> Structured Table
                    </span>
                  )}
                  {el.type === 'chart' && (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-violet-950/80 text-violet-300 border border-violet-700/60 px-2 py-0.5 rounded">
                      <BarChart2 className="w-3 h-3" /> Visual Chart
                    </span>
                  )}
                  {el.type === 'figure' && (
                    <span className="flex items-center gap-1 text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded">
                      <Layers className="w-3 h-3" /> Architecture Diagram
                    </span>
                  )}
                </div>

                {/* Element Content */}
                {el.title && (
                  <h4 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    {el.title}
                  </h4>
                )}

                {el.content && (
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {el.content}
                  </p>
                )}

                {/* Render Table Element */}
                {el.type === 'table' && el.structuredData && (
                  <div className="mt-3 overflow-x-auto rounded border border-slate-700/60 bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="bg-slate-800/80 text-cyan-300 border-b border-slate-700">
                          {el.structuredData.headers.map((h, i) => (
                            <th key={i} className="p-2 font-medium">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {el.structuredData.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-slate-800/40 transition-colors text-slate-300"
                          >
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Render Visual Chart Element */}
                {el.type === 'chart' && el.chartMetadata && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">
                        {el.chartMetadata.yAxisLabel}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        Source: Ground Truth Metric Extraction
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {el.chartMetadata.dataPoints.map((dp, idx) => {
                        const maxVal = Math.max(
                          ...el.chartMetadata!.dataPoints.map((d) => Math.max(d.value, d.secondaryValue || 0))
                        );
                        const pctPrimary = Math.min(100, (dp.value / (maxVal || 1)) * 100);
                        const pctSecondary = dp.secondaryValue !== undefined
                          ? Math.min(100, (dp.secondaryValue / (maxVal || 1)) * 100)
                          : null;

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-mono text-slate-300">{dp.label}</span>
                              <div className="flex gap-3 font-mono text-[11px]">
                                <span className="text-cyan-400 font-semibold">{dp.value}</span>
                                {dp.secondaryValue !== undefined && (
                                  <span className="text-slate-500">baseline: {dp.secondaryValue}</span>
                                )}
                              </div>
                            </div>
                            <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden flex">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pctPrimary}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Page Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>DOCUMIND-INDEXED-PALI-GEMMA-448</span>
          <span>PAGE {page.pageNumber} OF {documentTitle}</span>
        </div>

        {/* Overlay 1: 32x32 ViT Visual Patch Grid (1024 patches) */}
        {showPatchGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-20 grid"
            style={{
              gridTemplateRows: `repeat(${page.patchGridSize.rows}, 1fr)`,
              gridTemplateColumns: `repeat(${page.patchGridSize.cols}, 1fr)`,
            }}
          >
            {Array.from({ length: page.patchGridSize.rows * page.patchGridSize.cols }).map((_, i) => (
              <div
                key={i}
                className="border border-cyan-500/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors"
              />
            ))}
          </div>
        )}

        {/* Overlay 2: ColPali Late-Interaction MaxSim Attention Heatmap */}
        {showHeatmap && patchHeatmap.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
            {patchHeatmap.map((p, idx) => {
              // Color scale from purple (low) to orange/red (peak MaxSim match)
              const hue = Math.round((1 - p.score) * 240); // 0 = red (highest), 240 = blue
              const opacity = Math.min(0.75, Math.max(0.15, p.score * 0.8));

              return (
                <div
                  key={idx}
                  className="absolute rounded transition-all duration-300 pointer-events-auto cursor-help animate-pulse-subtle"
                  style={{
                    left: `${p.xPercent}%`,
                    top: `${p.yPercent}%`,
                    width: `${Math.max(4, p.widthPercent * 2)}%`,
                    height: `${Math.max(4, p.heightPercent * 2)}%`,
                    backgroundColor: `hsla(${350 - p.score * 300}, 95%, 55%, ${opacity})`,
                    boxShadow: p.score > 0.7 ? `0 0 16px hsla(${350 - p.score * 300}, 95%, 55%, 0.8)` : 'none',
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setHoveredPatch(p)}
                  onMouseLeave={() => setHoveredPatch(null)}
                />
              );
            })}
          </div>
        )}

        {/* Bounding Box Highlight when cited in QA */}
        {highlightBBox && (
          <div
            className="absolute z-30 border-2 border-emerald-400 bg-emerald-500/15 rounded-lg shadow-lg shadow-emerald-500/20 pointer-events-none animate-pulse"
            style={{
              top: `${highlightBBox[0] / 10}%`,
              left: `${highlightBBox[1] / 10}%`,
              height: `${(highlightBBox[2] - highlightBBox[0]) / 10}%`,
              width: `${(highlightBBox[3] - highlightBBox[1]) / 10}%`,
            }}
          >
            <span className="absolute -top-6 left-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded">
              VERIFIED EVIDENCE REGION
            </span>
          </div>
        )}

        {/* Hovered Patch Tooltip */}
        {hoveredPatch && (
          <div
            className="absolute z-40 bg-slate-950/95 border border-cyan-500 text-slate-200 text-xs p-2.5 rounded-lg shadow-2xl backdrop-blur font-mono pointer-events-none"
            style={{
              left: `${Math.min(75, Math.max(10, hoveredPatch.xPercent))}%`,
              top: `${Math.min(85, Math.max(10, hoveredPatch.yPercent))}%`,
            }}
          >
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" /> MaxSim Patch Alignment
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Token: <span className="text-white font-bold">"{hoveredPatch.tokenMatch}"</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Cosine Sim: <span className="text-emerald-400 font-bold">{hoveredPatch.score}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Patch Grid: ({hoveredPatch.row}, {hoveredPatch.col})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
