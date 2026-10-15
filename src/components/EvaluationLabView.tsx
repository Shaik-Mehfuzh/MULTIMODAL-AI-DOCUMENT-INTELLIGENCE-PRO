import React, { useState } from 'react';
import { DocumentItem, ModelBenchmarkScore, RetrievalModelType } from '../types/colpali';
import {
  OFFICIAL_VIDORE_BENCHMARKS,
  runEvaluationSuite,
  VIDORE_BENCHMARK_QUERIES,
} from '../services/evaluationService';
import {
  BarChart3,
  Play,
  CheckCircle2,
  Clock,
  Database,
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface EvaluationLabViewProps {
  documents: DocumentItem[];
}

export const EvaluationLabView: React.FC<EvaluationLabViewProps> = ({ documents }) => {
  const [selectedModel, setSelectedModel] = useState<RetrievalModelType>('colpali-v1.2');
  const [isRunning, setIsRunning] = useState(false);
  const [evalResults, setEvalResults] = useState<{
    measuredMetrics: ModelBenchmarkScore;
    perQueryResults: any[];
  }>(() => runEvaluationSuite('colpali-v1.2', documents));

  const handleRunEvaluation = (model: RetrievalModelType = selectedModel) => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runEvaluationSuite(model, documents);
      setEvalResults(res);
      setIsRunning(false);
    }, 450);
  };

  const officialRef = OFFICIAL_VIDORE_BENCHMARKS[selectedModel];
  const measured = evalResults.measuredMetrics;

  const allModels: RetrievalModelType[] = [
    'colpali-v1.2',
    'colqwen2-7b',
    'hybrid-colpali-bm25',
    'bi-encoder-dense',
    'bm25-ocr',
  ];

  const handleExportReport = () => {
    const report = {
      benchmark: 'ViDoRe (Visual Document Retrieval) v1.2',
      evaluationTimestamp: new Date().toISOString(),
      modelEvaluated: selectedModel,
      metrics: measured,
      queryDiagnostics: evalResults.perQueryResults,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vidore_benchmark_report_${selectedModel}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                ViDoRe Retrieval Evaluation & Benchmarking Lab
              </h1>
              <span className="text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded">
                ViDoRe v1.2 Suite
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Standardized evaluation on visual document QA, scientific tables, infographics, and corporate filings.
              Clearly distinguishes live measured metrics from official published baselines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => handleRunEvaluation()}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isRunning ? 'Benchmarking...' : 'Run Live Suite'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {allModels.map((m) => {
          const isSelected = selectedModel === m;
          const config = OFFICIAL_VIDORE_BENCHMARKS[m];
          return (
            <button
              key={m}
              onClick={() => {
                setSelectedModel(m);
                handleRunEvaluation(m);
              }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">{config.name}</div>
              <div className="text-[10px] text-slate-500">nDCG@5: {config.ndcgAt5}</div>
            </button>
          );
        })}
      </div>

      {/* Metrics Cards: Measured vs Official */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Recall @ 5 (Measured)</div>
          <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">
            {(measured.recallAt5 * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Published Ref: {(officialRef.recallAt5 * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Mean Reciprocal Rank (MRR)</div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
            {measured.mrr.toFixed(3)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Published Ref: {officialRef.mrr.toFixed(3)}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">Mean Query Latency</div>
          <div className="mt-1 text-2xl font-bold font-mono text-indigo-400">
            {measured.avgLatencyMs.total} ms
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Encode: {officialRef.avgLatencyMs.queryEncoding}ms | MaxSim: {officialRef.avgLatencyMs.lateInteraction}ms
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">GPU VRAM / Storage</div>
          <div className="mt-1 text-2xl font-bold font-mono text-violet-400">
            {officialRef.gpuVramRequiredGB} GB
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            {officialRef.storagePer10kPagesMB} MB / 10k pages
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparative Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono">
              ViDoRe Architecture Comparison Table
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Source: illuin-tech/vidore-benchmark (ArXiv:2407.01449)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-850 text-cyan-300 border-b border-slate-750">
                <th className="p-3">Model Architecture</th>
                <th className="p-3">Recall@1</th>
                <th className="p-3">Recall@5</th>
                <th className="p-3">MRR</th>
                <th className="p-3">nDCG@5</th>
                <th className="p-3">Latency</th>
                <th className="p-3">VRAM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {allModels.map((m) => {
                const conf = OFFICIAL_VIDORE_BENCHMARKS[m];
                const isCurrent = selectedModel === m;
                return (
                  <tr
                    key={m}
                    className={`transition-colors ${
                      isCurrent ? 'bg-cyan-950/30 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3 flex items-center gap-2">
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                      <span>{conf.name}</span>
                    </td>
                    <td className="p-3">{(conf.recallAt1 * 100).toFixed(1)}%</td>
                    <td className="p-3 text-cyan-400">{(conf.recallAt5 * 100).toFixed(1)}%</td>
                    <td className="p-3">{conf.mrr.toFixed(3)}</td>
                    <td className="p-3 text-emerald-400 font-bold">{conf.ndcgAt5.toFixed(1)}</td>
                    <td className="p-3">{conf.avgLatencyMs.total} ms</td>
                    <td className="p-3">{conf.gpuVramRequiredGB} GB</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Diagnostics Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-semibold text-white uppercase font-mono">
            Query-by-Query Evaluation Breakdown ({evalResults.perQueryResults.length} Queries)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Pass Rate @ Rank 1: {((evalResults.perQueryResults.filter((q) => q.isHitAt1).length / evalResults.perQueryResults.length) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-850 text-cyan-300 border-b border-slate-750">
                <th className="p-3">Query</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">First Hit Rank</th>
                <th className="p-3">Reciprocal Rank</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {evalResults.perQueryResults.map((qr, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors text-slate-300">
                  <td className="p-3 max-w-md truncate font-sans text-slate-200">{qr.query}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        qr.difficulty.includes('Hard')
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {qr.difficulty}
                    </span>
                  </td>
                  <td className="p-3 text-cyan-400 font-bold">
                    {qr.relevantFoundAtRank ? `#${qr.relevantFoundAtRank}` : 'Not in Top 10'}
                  </td>
                  <td className="p-3">{qr.reciprocalRank.toFixed(3)}</td>
                  <td className="p-3 text-slate-400">{qr.latencyMs} ms</td>
                  <td className="p-3">
                    {qr.isHitAt1 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hit @ 1
                      </span>
                    ) : qr.isHitAt5 ? (
                      <span className="text-cyan-400 flex items-center gap-1">Hit @ 5</span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">Miss</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
