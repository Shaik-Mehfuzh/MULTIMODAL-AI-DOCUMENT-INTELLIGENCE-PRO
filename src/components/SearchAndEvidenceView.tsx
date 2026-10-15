import React, { useState } from 'react';
import {
  DocumentItem,
  DocumentPage,
  RetrievalModelType,
  RetrievalResult,
} from '../types/colpali';
import { ColPaliEngine } from '../services/colpaliEngine';
import { PageVisualRenderer } from './PageVisualRenderer';
import {
  Search,
  Sparkles,
  Sliders,
  Layers,
  Flame,
  ArrowRight,
  Clock,
  Eye,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface SearchAndEvidenceViewProps {
  documents: DocumentItem[];
  onNavigateTab: (tab: NavTab) => void;
  onSendQueryToQA: (query: string, results: RetrievalResult[]) => void;
}

export const SearchAndEvidenceView: React.FC<SearchAndEvidenceViewProps> = ({
  documents,
  onNavigateTab,
  onSendQueryToQA,
}) => {
  const [query, setQuery] = useState('FP4 Tensor Core TFLOPS for Blackwell B200');
  const [selectedModel, setSelectedModel] = useState<RetrievalModelType>('colpali-v1.2');
  const [showPatchGrid, setShowPatchGrid] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [results, setResults] = useState<RetrievalResult[]>(() => {
    return ColPaliEngine.getInstance().retrieve(
      'FP4 Tensor Core TFLOPS for Blackwell B200',
      documents,
      'colpali-v1.2'
    );
  });
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const sampleQueries = [
    'FP4 Tensor Core TFLOPS for Blackwell B200',
    'ColPali nDCG@5 score comparison table',
    'ApexFin Q3 2026 provision for credit losses',
    'mRNA-402 progression-free survival hazard ratio',
    'SigLIP ViT patch token architecture pipeline',
    'Common Equity Tier 1 capital ratio trend graph',
  ];

  const handleSearch = (searchQuery: string = query, model: RetrievalModelType = selectedModel) => {
    if (!searchQuery.trim()) return;
    const res = ColPaliEngine.getInstance().retrieve(searchQuery, documents, model, 6);
    setResults(res);
    setSelectedResultIndex(0);
  };

  const activeResult = results[selectedResultIndex];

  // Find document and page corresponding to active result
  const activeDoc = activeResult
    ? documents.find((d) => d.id === activeResult.documentId)
    : null;
  const activePage: DocumentPage | undefined = activeDoc?.pages.find(
    (p) => p.pageNumber === activeResult?.pageNumber
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Architecture Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              ColPali Visual Document Retrieval & Late Interaction
            </h1>
            <span className="text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded">
              MaxSim Operator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Unlike OCR single-vector embeddings that lose layout and diagram context, ColPali performs
            late interaction between individual query tokens and 1,024 visual patches on each page.
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedModel}
            onChange={(e) => {
              const m = e.target.value as RetrievalModelType;
              setSelectedModel(m);
              handleSearch(query, m);
            }}
            className="bg-slate-950 border border-slate-700 text-xs text-cyan-300 font-mono rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-cyan-500 outline-none cursor-pointer"
          >
            <option value="colpali-v1.2">ColPali-v1.2 (PaliGemma-3B / MaxSim)</option>
            <option value="colqwen2-7b">ColQwen2-7B (Qwen2-VL / High Res)</option>
            <option value="hybrid-colpali-bm25">Hybrid: ColPali + BM25 RRF</option>
            <option value="bi-encoder-dense">BGE-M3 (Single-Vector Dense Baseline)</option>
            <option value="bm25-ocr">BM25 (Sparse Text-only OCR Baseline)</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center"
        >
          <div className="absolute left-4 text-cyan-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question or search for tables, charts, or specifications..."
            className="w-full bg-slate-950/90 border border-slate-700/80 hover:border-cyan-500/60 focus:border-cyan-400 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-12 pr-28 py-3.5 shadow-xl transition-all outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
          >
            Retrieve
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          <span className="text-slate-500 font-mono text-[11px] shrink-0">Try benchmark queries:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="shrink-0 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-750 px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Results & Visual Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ranked Results List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-white">
              Retrieved Pages ({results.length})
            </span>
            <span className="font-mono text-[11px]">
              Latency: {activeResult ? `${activeResult.retrievalLatencyMs} ms` : '0 ms'}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 text-xs">
              No matching pages found for this query. Try adjusting terms.
            </div>
          ) : (
            results.map((res, idx) => {
              const isSelected = selectedResultIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedResultIndex(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850/90 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          idx === 0
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-semibold text-white line-clamp-1">
                          {res.documentTitle}
                        </h4>
                        <span className="text-[11px] font-mono text-cyan-400">
                          Page {res.pageNumber}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-cyan-300">
                        {(res.score * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        MaxSim: {res.maxSimScore.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  {/* Token Matches Breakdown */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {res.queryTokenMatches.map((tm, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700/60 text-slate-300 flex items-center gap-1"
                      >
                        <span>{tm.token}</span>
                        <span className="text-cyan-400 font-bold">
                          {tm.maxSimilarity.toFixed(2)}
                        </span>
                      </span>
                    ))}
                  </div>

                  {res.textSnippet && (
                    <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {res.textSnippet}
                    </p>
                  )}
                </div>
              );
            })
          )}

          {activeResult && (
            <div className="pt-2">
              <button
                onClick={() => onSendQueryToQA(query, results)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI to Answer with this Retrieved Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Visual Page Viewer with Toggleable Heatmap & Patches */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">Visual Page Inspection</span>
            </div>

            {/* Heatmap & Grid Toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> MaxSim Heatmap
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPatchGrid}
                  onChange={(e) => setShowPatchGrid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> 32×32 Grid
                </span>
              </label>
            </div>
          </div>

          {activePage && activeDoc ? (
            <div className="relative">
              <PageVisualRenderer
                page={activePage}
                documentTitle={activeDoc.title}
                showPatchGrid={showPatchGrid}
                showHeatmap={showHeatmap}
                patchHeatmap={activeResult?.patchHeatmap || []}
              />
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Select a page result on the left to view visual layout and patch activations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
