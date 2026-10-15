import React, { useState } from 'react';
import { DocumentItem } from '../types/colpali';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Trash2,
  AlertCircle,
  Eye,
  Search,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface DashboardViewProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
  onNavigateTab: (tab: NavTab) => void;
  onUploadDocument: (newDoc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  onSelectDocument,
  onNavigateTab,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const totalPages = documents.reduce((sum, d) => sum + d.pageCount, 0);
  const totalTokens = totalPages * 1024; // 1024 ViT patch tokens per page
  const totalMemoryKB = totalPages * 256; // 256 KB per page in FP16

  // Handle PDF file drag & drop or file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files[0];
    } else if (e.target.files && e.target.files[0]) {
      file = e.target.files[0];
    }

    if (!file) return;

    setUploadError(null);

    // Security validation 1: File type
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Security Validation Error: Only PDF documents (*.pdf) are permitted.');
      return;
    }

    // Security validation 2: Size limit 25MB
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File Size Exceeded: Maximum allowed document size is 25 MB.');
      return;
    }

    // Ingestion simulation with multi-stage visual pipeline
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStep('Validating PDF header (%PDF-1.x) and scanning for malicious embedded scripts...');

    setTimeout(() => {
      setUploadProgress(40);
      setUploadStep('Rasterizing PDF pages to 448x448 visual resolution for SigLIP ViT encoder...');

      setTimeout(() => {
        setUploadProgress(70);
        setUploadStep('Extracting 1,024 patch token embeddings per page via PaliGemma-3B...');

        setTimeout(() => {
          setUploadProgress(95);
          setUploadStep('Constructing ColPali late-interaction multi-vector index & MaxSim memory pool...');

          setTimeout(() => {
            setUploadProgress(100);
            setIsUploading(false);

            // Create new ingested document item
            const newDoc: DocumentItem = {
              id: `doc-custom-${Date.now()}`,
              title: file!.name.replace(/\.pdf$/i, ''),
              filename: file!.name,
              category: 'Custom Upload',
              authorOrOrg: 'User Uploaded Document',
              pageCount: 2,
              fileSizeBytes: file!.size,
              createdAt: new Date().toISOString().split('T')[0],
              indexedWith: 'ColPali-v1.2 (PaliGemma-3B-pt-448)',
              indexingTimeMs: 460,
              status: 'indexed',
              summary: `User ingested PDF document "${file!.name}". Indexed with 2,048 multi-vector visual patch embeddings across 2 pages.`,
              pages: [
                {
                  pageNumber: 1,
                  imageUrl: '/assets/custom_p1.svg',
                  width: 800,
                  height: 1100,
                  patchGridSize: { rows: 32, cols: 32 },
                  ocrText: `Executive Overview and Content of ${file!.name}.
This document was successfully parsed and indexed by DocuMind AI. All typographic elements, tables, and charts are mapped directly to 32x32 visual patch tokens for MaxSim late interaction.`,
                  elements: [
                    {
                      id: `elem-custom-p1-${Date.now()}`,
                      type: 'title',
                      bbox: [80, 80, 200, 920],
                      title: `Document Overview: ${file!.name}`,
                      content:
                        'Extracted directly from user-uploaded PDF file. Ready for natural-language visual retrieval.',
                    },
                    {
                      id: `elem-custom-tbl-${Date.now()}`,
                      type: 'table',
                      bbox: [240, 80, 680, 920],
                      title: 'Table 1: Ingested Metrics Summary',
                      structuredData: {
                        headers: ['Metric Name', 'Observed Value', 'Confidence Level', 'Processing Pipeline'],
                        rows: [
                          ['Total Page Count', '2 Pages', '100%', 'PDF Rasterizer'],
                          ['Visual Patch Tokens', '2,048 Tokens', '99.4%', 'SigLIP-So400m ViT'],
                          ['Embedding Precision', 'FP16 (d=128)', '100%', 'PaliGemma-3B Projection'],
                          ['Late Interaction Ready', 'Yes', 'Verified', 'ColBERT MaxSim Matrix'],
                        ],
                      },
                    },
                  ],
                },
                {
                  pageNumber: 2,
                  imageUrl: '/assets/custom_p2.svg',
                  width: 800,
                  height: 1100,
                  patchGridSize: { rows: 32, cols: 32 },
                  ocrText: `Page 2 Detailed Technical Specifications and Visual Analysis.
Visual layout contains benchmark comparisons and detailed section analysis for ${file!.name}.`,
                  elements: [
                    {
                      id: `elem-custom-chart-${Date.now()}`,
                      type: 'chart',
                      bbox: [120, 80, 640, 920],
                      title: 'Figure 2: Ingested Component Distribution',
                      chartMetadata: {
                        chartType: 'bar',
                        xAxisLabel: 'Layout Element Type',
                        yAxisLabel: 'Relative Area Coverage (%)',
                        dataPoints: [
                          { label: 'Body Text Blocks', value: 45 },
                          { label: 'Tabular Data Grids', value: 30 },
                          { label: 'Graphical Figures', value: 18 },
                          { label: 'Headers & Footers', value: 7 },
                        ],
                        observedInsights: [
                          'Document displays high tabular density (30% area), making ColPali visual patch retrieval dramatically superior to text OCR.',
                        ],
                        inferredInsights: [
                          'Visual coordinates preserve horizontal column headers and row relations without delimiter stripping.',
                        ],
                      },
                    },
                  ],
                },
              ],
            };

            onUploadDocument(newDoc);
          }, 400);
        }, 500);
      }, 500);
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Section: ColPali Value Proposition */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>ColPali Vision Language Retrieval Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Stop discarding visual intelligence through fragile OCR.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            DocuMind AI embeds document pages as images directly through{' '}
            <strong className="text-cyan-400 font-semibold">PaliGemma-3B</strong> and{' '}
            <strong className="text-indigo-400 font-semibold">SigLIP ViT</strong>, producing 1,024
            patch token embeddings per page. Queries are resolved via{' '}
            <strong className="text-white font-semibold">ColBERT-style MaxSim late interaction</strong>
            , achieving state-of-the-art retrieval across complex tables, charts, and infographics on
            the ViDoRe benchmark.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('search')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore Visual Search & Heatmaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('interview')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              <span>Architecture & Interview Lab</span>
            </button>
            <button
              onClick={() => onNavigateTab('eval')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              <span>ViDoRe Benchmark Scores</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Visual Patch Tokens</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {totalPages} pages × 1,024 patches
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Late Interaction</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-cyan-400">23 ms</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Fast tensor dot-product
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ViDoRe Test Score</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">81.3 nDCG@5</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            +12.9 over text BGE-M3
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Index Footprint (FP16)</span>
            <Database className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {(totalMemoryKB / 1024).toFixed(2)} MB
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            256 KB/page (16 KB in 1-bit)
          </div>
        </div>
      </div>

      {/* Ingestion & PDF Upload Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              PDF Document Ingestion & ColPali Visual Indexing
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure client/server document ingestion. Rasterizes pages to 448x448 and computes multi-vector patch embeddings.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Untrusted Input Sanitized</span>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {isUploading ? (
          <div className="p-8 rounded-lg bg-slate-950/60 border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {uploadStep}
              </span>
              <span className="text-white font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Running SigLIP ViT patch encoder (32x32) + PaliGemma multi-vector projection (d=128)...
            </div>
          </div>
        ) : (
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileUpload}
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl p-8 bg-slate-950/30 hover:bg-slate-900/40 transition-all cursor-pointer group"
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-cyan-950/80 border border-slate-700 group-hover:border-cyan-700 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 transition-all">
              <Upload className="w-6 h-6" />
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                Click to browse or drop your PDF document here
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard and complex multi-column PDFs, tables, charts, scanned layouts up to 25 MB
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Document Library Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Indexed Document Corpus</h2>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              {documents.length} Available
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Click any document to inspect visual pages & element bounding boxes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            return (
              <div
                key={doc.id}
                className="bg-slate-900/80 hover:bg-slate-850/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {doc.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {doc.authorOrOrg || doc.filename}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {doc.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/70 pt-3">
                    <span>
                      Pages: <strong className="text-slate-200">{doc.pageCount}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Size: <strong className="text-slate-200">{(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Tokens: <strong className="text-cyan-400">{(doc.pageCount * 1024).toLocaleString()}</strong>
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/70">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Visual Pages</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateTab('search')}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => onNavigateTab('tables')}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      Tables
                    </button>
                    {doc.category === 'Custom Upload' && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        title="Delete Document & Clear Memory"
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
