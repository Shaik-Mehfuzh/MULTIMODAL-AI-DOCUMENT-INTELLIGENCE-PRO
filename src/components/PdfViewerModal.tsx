import React, { useState } from 'react';
import { DocumentItem, DocumentPage } from '../types/colpali';
import { PageVisualRenderer } from './PageVisualRenderer';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Flame,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface PdfViewerModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ document, onClose }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showPatchGrid, setShowPatchGrid] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  if (!document) return null;

  const currentPage: DocumentPage | undefined = document.pages[currentPageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{document.title}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {document.category} • {document.pages.length} Pages • {document.indexedWith}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
              <input
                type="checkbox"
                checked={showPatchGrid}
                onChange={(e) => setShowPatchGrid(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> 32×32 ViT Grid
              </span>
            </label>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Page Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50 flex justify-center">
          {currentPage && (
            <div className="w-full max-w-3xl">
              <PageVisualRenderer
                page={currentPage}
                documentTitle={document.title}
                showPatchGrid={showPatchGrid}
                showHeatmap={showHeatmap}
              />
            </div>
          )}
        </div>

        {/* Modal Footer / Page Pagination */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 disabled:opacity-30 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page <strong className="text-white">{currentPageIndex + 1}</strong> of{' '}
              <strong className="text-white">{document.pages.length}</strong>
            </span>
            <button
              disabled={currentPageIndex === document.pages.length - 1}
              onClick={() => setCurrentPageIndex((prev) => Math.min(document.pages.length - 1, prev + 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 disabled:opacity-30 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            SigLIP-So400m ViT • 1,024 patch embeddings per page
          </div>
        </div>
      </div>
    </div>
  );
};
