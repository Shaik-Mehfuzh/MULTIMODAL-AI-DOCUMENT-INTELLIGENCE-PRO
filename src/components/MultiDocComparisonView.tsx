import React, { useState } from 'react';
import { DocumentComparisonFinding, DocumentItem } from '../types/colpali';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { PageVisualRenderer } from './PageVisualRenderer';

interface MultiDocComparisonViewProps {
  documents: DocumentItem[];
}

export const MultiDocComparisonView: React.FC<MultiDocComparisonViewProps> = ({ documents }) => {
  const [docAId, setDocAId] = useState<string>(documents[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || '');

  const docA = documents.find((d) => d.id === docAId) || documents[0];
  const docB = documents.find((d) => d.id === docBId) || documents[1] || documents[0];

  // Pre-configured comparison findings between technical specifications
  const comparisonFindings: DocumentComparisonFinding[] = [
    {
      id: 'cmp-1',
      topic: 'Precision Formats & Tensor Throughput',
      category: 'specification_diff',
      description:
        'Architectural divergence in native quantization support and peak tensor core execution rates.',
      docA: {
        documentId: docA.id,
        title: docA.title,
        page: 2,
        statementOrValue:
          docA.id === 'doc-nvidia-blackwell'
            ? 'Blackwell B200 supports 9,000 TFLOPS in native FP4 precision via 2nd-Gen Transformer Engine.'
            : 'ColPali leverages FP16 for multi-vector page embeddings (256 KB/page) and INT8 quantization.',
      },
      docB: {
        documentId: docB.id,
        title: docB.title,
        page: 2,
        statementOrValue:
          docB.id === 'doc-nvidia-blackwell'
            ? 'Blackwell B200 delivers 9,000 TFLOPS FP4 vs 1,979 TFLOPS FP8 on Hopper H100.'
            : 'ViDoRe benchmark measures nDCG@5 at 81.3 for ColPali vs 68.4 for BGE-M3 text-only OCR.',
      },
      isConflictResolved: false,
      status: 'Delta / Variant',
    },
    {
      id: 'cmp-2',
      topic: 'Reported Benchmark Metric Variance',
      category: 'metric_conflict',
      description:
        'Conflicting numerical benchmarks identified between OCR-based retrieval evaluation and native VLM late interaction.',
      docA: {
        documentId: docA.id,
        title: docA.title,
        page: 2,
        statementOrValue:
          'Documents report +33.9 point performance advantage on infographics when using visual patches over OCR.',
      },
      docB: {
        documentId: docB.id,
        title: docB.title,
        page: 1,
        statementOrValue:
          'Baseline OCR pipeline asserts 98% character recognition accuracy across standard printed documents.',
      },
      isConflictResolved: false,
      status: 'Open Conflict',
    },
    {
      id: 'cmp-3',
      topic: 'Memory Footprint & Bandwidth Constraints',
      category: 'specification_diff',
      description:
        'Comparison of on-chip HBM3e high-bandwidth memory capacity versus multi-vector retrieval RAM requirements.',
      docA: {
        documentId: docA.id,
        title: docA.title,
        page: 2,
        statementOrValue:
          '192 GB HBM3e with 8.0 TB/s memory bandwidth to sustain large language model weights in fast SRAM/HBM.',
      },
      docB: {
        documentId: docB.id,
        title: docB.title,
        page: 3,
        statementOrValue:
          '1,000,000 document pages can be stored in 16 GB RAM using 1-bit binary Hamming quantization.',
      },
      isConflictResolved: true,
      status: 'Direct Match',
    },
    {
      id: 'cmp-4',
      topic: 'Thermal & Power Dissipation Specs',
      category: 'missing_information',
      description:
        'Doc A specifies thermal design power (1,000W TDP and direct liquid cooling), whereas Doc B focuses solely on algorithmic software runtime.',
      docA: {
        documentId: docA.id,
        title: docA.title,
        page: 3,
        statementOrValue:
          'GB200 NVL72 uses direct-to-chip liquid cooling to manage 1,000W per GPU with a PUE of 1.15.',
      },
      docB: {
        documentId: docB.id,
        title: docB.title,
        page: 1,
        statementOrValue: 'Not specified in this software/algorithmic document.',
      },
      isConflictResolved: false,
      status: 'Asymmetric',
    },
  ];

  const [activeFinding, setActiveFinding] = useState<DocumentComparisonFinding>(comparisonFindings[0]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            Multi-Document Comparison & Conflict Matrix
          </h1>
          <span className="text-xs font-mono bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Unresolved Conflict Preservation
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Compare specifications, research papers, and technical filings. Discrepancies and conflicting
          metrics are clearly highlighted and linked to their source page without artificial resolution.
        </p>
      </div>

      {/* Selectors for Document A and Document B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
          <label className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Document A (Reference)
          </label>
          <select
            value={docAId}
            onChange={(e) => setDocAId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none font-sans"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.category})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
          <label className="text-xs font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Document B (Comparison Target)
          </label>
          <select
            value={docBId}
            onChange={(e) => setDocBId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none font-sans"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Findings List */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-slate-400 uppercase font-semibold">
          Identified Cross-Document Findings ({comparisonFindings.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparisonFindings.map((finding) => {
            const isSelected = activeFinding.id === finding.id;
            return (
              <div
                key={finding.id}
                onClick={() => setActiveFinding(finding)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850/90 border-cyan-500/80 shadow-lg ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{finding.topic}</h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      finding.status === 'Open Conflict'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : finding.status === 'Delta / Variant'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {finding.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {finding.description}
                </p>

                {/* Side-by-side snippet preview */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800/80 pt-2.5">
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-slate-300 line-clamp-2">
                    <span className="text-cyan-400 font-bold block mb-0.5">Doc A:</span>
                    {finding.docA.statementOrValue}
                  </div>
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-slate-300 line-clamp-2">
                    <span className="text-indigo-400 font-bold block mb-0.5">Doc B:</span>
                    {finding.docB.statementOrValue}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Visual Evidence View */}
      {activeFinding && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Selected Finding</span>
              <h3 className="text-sm font-bold text-white">{activeFinding.topic}</h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Conflict Policy: <strong>Not automatically resolved</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doc A Evidence Page */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-cyan-400">
                  Source A: {docA.title} (Page {activeFinding.docA.page})
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                "{activeFinding.docA.statementOrValue}"
              </div>
              {docA.pages[activeFinding.docA.page - 1] && (
                <PageVisualRenderer
                  page={docA.pages[activeFinding.docA.page - 1]}
                  documentTitle={docA.title}
                />
              )}
            </div>

            {/* Doc B Evidence Page */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-indigo-400">
                  Source B: {docB.title} (Page {activeFinding.docB.page})
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                "{activeFinding.docB.statementOrValue}"
              </div>
              {docB.pages[activeFinding.docB.page - 1] && (
                <PageVisualRenderer
                  page={docB.pages[activeFinding.docB.page - 1]}
                  documentTitle={docB.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
