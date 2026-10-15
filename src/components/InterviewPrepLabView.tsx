import React, { useState } from 'react';
import {
  GraduationCap,
  Layers,
  Cpu,
  Zap,
  Code2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  Database,
} from 'lucide-react';

export const InterviewPrepLabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'questions' | 'math' | 'scaling'>('architecture');
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);

  const interviewQuestions = [
    {
      q: 'Explain how ColPali differs from ColBERT and traditional dense bi-encoders (like CLIP or BGE-M3).',
      category: 'Core Architecture',
      level: 'High Yield (Google / Microsoft AI Eng)',
      summary:
        'ColPali unifies ColBERT’s multi-vector late interaction with PaliGemma’s Vision Transformer, embedding page images directly rather than text strings.',
      answer: `1. Traditional Bi-Encoders (e.g. CLIP, BGE-M3):
   • Compress an entire page into a SINGLE vector embedding (e.g. 768 or 1536 dims).
   • Bottleneck: A single vector suffers from "information collapse". It cannot preserve dense tables, multi-column reading orders, chart legends, and body text simultaneously.

2. ColBERT (Contextualized Late Interaction over BERT):
   • Kept token-level embeddings for texts, matching every query token to the most similar document token via the MaxSim operator.
   • Limitation: ColBERT was strictly textual—it required OCR to process PDFs.

3. ColPali Breakthrough:
   • Discards OCR completely. Document pages are passed as 448x448 images into a Vision Transformer (SigLIP-So400m).
   • PaliGemma-3B outputs 1,024 visual patch tokens per page (d=128).
   • Late interaction matches query words directly against visual patches, capturing visual layout, chart trends, and fine typography natively.`,
    },
    {
      q: 'What is the mathematical formulation of the MaxSim operator, and why is it called "late interaction"?',
      category: 'Mathematical Formulation',
      level: 'Fundamental ML Theory',
      summary:
        'MaxSim computes the sum over query tokens of the maximum dot product with any document patch embedding.',
      answer: `Mathematically, given:
  • Query token embeddings Q = { q_1, q_2, ..., q_m } where each q_i in R^d
  • Document visual patch embeddings D = { d_1, d_2, ..., d_n } where each d_j in R^d

The ColPali relevance score is:
  Score(Q, D) = sum_{i=1}^{|Q|} max_{j=1}^{|D|} ( q_i · d_j )

Why "Late Interaction"?
  • In Cross-Encoders (Early Interaction): Query tokens and document tokens interact at every layer of a heavy Transformer. Computation is O(|Q| * |D| * layers), which is far too slow for web-scale search.
  • In Bi-Encoders: Query and document only interact at the very end via a single dot product (no token-level interaction).
  • In Late Interaction: Document patches are pre-encoded and stored offline. Query tokens are encoded independently. The token-to-patch interaction happens at the very last step ("late") via fast vectorized dot products and max operations.`,
    },
    {
      q: 'How do you generate visual attention heatmaps in ColPali without training an object detection model?',
      category: 'Explainability & Vision',
      level: 'Advanced Computer Vision',
      summary:
        'Attribution is an inherent byproduct of the MaxSim operator: argmax_j (q_i · d_j) provides the exact visual patch.',
      answer: `Because ColPali represents a document page as a 32x32 spatial grid of patches (each patch covering 14x14 pixels in the 448x448 input image):
  1. For each query token q_i, the MaxSim operator identifies the best-matching document token:
     j*(i) = argmax_{j in {1..1024}} ( q_i · d_j )
  2. The index j*(i) directly corresponds to a spatial coordinate (row = floor(j*/32), col = j* mod 32).
  3. By aggregating the similarity scores across query tokens or inspecting an individual token (e.g. "revenue" or "temperature"), we obtain an exact visual heatmap over the page.
  4. This provides explainability and visual grounding with zero additional annotations or object detection models.`,
    },
    {
      q: 'How do you scale ColPali to index 10 million pages without exceeding RAM limits?',
      category: 'Systems & Infrastructure',
      level: 'Staff / Principal Systems',
      summary:
        'Through binary quantization (1-bit Hamming distance) or INT8 product quantization with multi-vector engines like Vespa or Qdrant.',
      answer: `1. Raw Storage Challenge:
   • 1,024 patches * 128 dimensions * 2 bytes (FP16) = 256 KB per page.
   • For 10 million pages = 2.56 Terabytes of vector RAM, which is costly.

2. Production Solutions:
   • INT8 Scalar Quantization: Cuts footprint to 128 KB/page (1.28 TB) with < 0.2% drop in nDCG@5.
   • Binary Quantization (Hamming): Converts each dimension to 1 bit (positive vs negative). Footprint drops to 16 KB per page!
     10 million pages = 160 GB of RAM.
   • Two-stage retrieval:
     Stage 1: Fast Hamming distance filter using bitwise POPCNT on CPU/GPU to retrieve Top-500 candidate pages.
     Stage 2: Full FP16 MaxSim reranking on the Top-500 candidates.
   • Vector Engines: Deployed using Vespa's HNSW multi-vector index or Qdrant multi-vector collections.`,
    },
    {
      q: 'Why does traditional OCR + RAG fail on tables and infographics, and how does ColPali solve it?',
      category: 'Industry Applications',
      level: 'Practical AI Architecture',
      summary:
        'OCR destroys 2D spatial relationships and reading order, whereas ColPali preserves 2D patch proximity.',
      answer: `1. The OCR Failure Modes:
   • Reading Order Collapse: Complex multi-column layouts or sidebars get linearized incorrectly, interleaving unrelated text sentences.
   • Table Grid Stripping: OCR converts tables into loose strings, losing row-to-column cross-correlations.
   • Infographic / Diagram Disconnect: Captions, axes, and icons are separated into arbitrary text blocks, stripping semantic association.

2. How ColPali Solves It:
   • SigLIP ViT encodes 2D spatial patches with sinusoidal 2D position embeddings.
   • Visual proximity between a chart bar and its axis label is preserved in the transformer attention layers.
   • On the ViDoRe benchmark, ColPali scores 85.1 nDCG@5 on Infographics compared to 51.2 for OCR-based BGE-M3 (a +33.9 point advantage).`,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            ColPali Architecture & Technical Interview Lab
          </h1>
          <span className="text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded">
            Portfolio & Interview Defense
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Comprehensive technical defense guide, mathematical foundations, and real-world system architecture
          for Google, Microsoft, and AI Engineering technical interviews.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'architecture'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. End-to-End Pipeline
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Interview Q&A Defense
        </button>
        <button
          onClick={() => setActiveTab('math')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'math'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. MaxSim Mathematical Formulation
        </button>
        <button
          onClick={() => setActiveTab('scaling')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'scaling'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Production Scaling & Quantization
        </button>
      </div>

      {/* Content 1: Architecture Pipeline */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              ColPali Document Processing & Retrieval Pipeline
            </h3>

            {/* Step-by-step visual workflow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-cyan-400 uppercase">Stage 01</div>
                <h4 className="text-xs font-bold text-white">PDF Ingestion & Page Rendering</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  PDF documents are rasterized directly to 448×448 RGB images. OCR is completely bypassed, preserving visual layout, fonts, and chart geometries.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                  Input: PDF Page → Image (448×448×3)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-indigo-400 uppercase">Stage 02</div>
                <h4 className="text-xs font-bold text-white">SigLIP ViT Patch Encoder</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Vision Transformer (SigLIP-So400m) splits the image into a 32×32 grid (each patch 14×14 px), yielding 1,024 patch tokens with 2D positional embeddings.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                  Output: 1,024 Patch Tokens
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-violet-400 uppercase">Stage 03</div>
                <h4 className="text-xs font-bold text-white">PaliGemma-3B Projection</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Patch tokens are projected into the language embedding space and contextualized via Gemma autoregressive attention layers into d=128 multi-vectors.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                  Matrix: D in R^(1024 × 128)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-emerald-400 uppercase">Stage 04</div>
                <h4 className="text-xs font-bold text-white">MaxSim Late Interaction</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Query tokens Q = [q_1...q_m] are encoded into d=128 vectors. MaxSim computes the maximum dot product for each query token against all 1,024 page patches.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded">
                  Score = sum_i max_j (q_i · d_j)
                </div>
              </div>
            </div>

            {/* Comparison Matrix: ColPali vs Classic OCR+RAG */}
            <div className="mt-6 border-t border-slate-800 pt-5">
              <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase mb-3">
                Architectural Trade-Off: ColPali vs Classic Text OCR RAG
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-850 text-cyan-300 border-b border-slate-750">
                      <th className="p-3">Dimension</th>
                      <th className="p-3">Classic OCR + Text Bi-Encoder (BGE-M3)</th>
                      <th className="p-3 text-emerald-400">ColPali (Vision Language Late Interaction)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-white">Table Extraction</td>
                      <td className="p-3 text-rose-300">Fails on merged cells, multi-headers, borders</td>
                      <td className="p-3 text-emerald-300">Preserves 2D layout grid and visual alignment</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Charts & Figures</td>
                      <td className="p-3 text-rose-300">Completely discarded or fragmented captions</td>
                      <td className="p-3 text-emerald-300">Directly attends to bars, lines, axes, legends</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">ViDoRe Infographics</td>
                      <td className="p-3 text-rose-300">51.2 nDCG@5</td>
                      <td className="p-3 text-emerald-300">85.1 nDCG@5 (+33.9 points higher)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Indexing Complexity</td>
                      <td className="p-3">Multi-stage: OCR, layout parser, chunker, embedder</td>
                      <td className="p-3 text-emerald-300">Single end-to-end forward pass on page image</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content 2: Interview Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Curated Interview Defense Questions (Google / Microsoft Loops)
            </h3>

            <div className="space-y-3">
              {interviewQuestions.map((item, idx) => {
                const isOpen = openQuestionIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenQuestionIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {item.level}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100">{item.q}</h4>
                        <p className="text-[11px] text-slate-400 font-sans">{item.summary}</p>
                      </div>

                      <div className="text-slate-400 shrink-0 mt-1">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-0 border-t border-slate-850 bg-slate-900/30">
                        <div className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                          {item.answer}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content 3: Math Formulation */}
      {activeTab === 'math' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Mathematical Derivation of ColPali Late Interaction
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-cyan-400 font-bold">1. Vector Representation:</div>
              <p className="text-slate-300 leading-relaxed">
                Let a document page image be I in R^(448 × 448 × 3).
                The vision transformer ViT produces a patch embedding matrix:
                <br />
                <span className="text-emerald-400">
                  D = f_theta(I) in R^(1024 × 128), where ||d_j||_2 = 1 for all j in [1, 1024]
                </span>
              </p>

              <div className="text-cyan-400 font-bold mt-4">2. Query Representation:</div>
              <p className="text-slate-300 leading-relaxed">
                Let a query string Q be tokenized into m tokens [t_1, ..., t_m].
                The language model embedder produces:
                <br />
                <span className="text-emerald-400">
                  Q = g_phi(Q) in R^(m × 128), where ||q_i||_2 = 1 for all i in [1, m]
                </span>
              </p>

              <div className="text-cyan-400 font-bold mt-4">3. MaxSim Scoring Operator:</div>
              <p className="text-slate-300 leading-relaxed">
                Relevance between Query Q and Page Image D:
                <br />
                <span className="text-indigo-300 text-sm font-bold bg-slate-900 px-3 py-1.5 rounded block mt-1">
                  Score(Q, D) = sum_{'{i=1}'}^m max_{'{j=1}'}^{'{1024}'} ( q_i · d_j )
                </span>
              </p>

              <div className="text-cyan-400 font-bold mt-4">4. Complexity & Execution Time:</div>
              <p className="text-slate-300 leading-relaxed">
                For a query with m=10 tokens and page with n=1024 patches:
                <br />• Dot products per page = 10 × 1024 = 10,240 multiplications.
                <br />• In GPU tensor cores (e.g. Tensor Core GEMM), 10k float16 operations execute in ~0.02 milliseconds!
                <br />• This is orders of magnitude faster than evaluating cross-attention in an LLM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content 4: Scaling & Quantization */}
      {activeTab === 'scaling' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Quantization & Memory Scaling Strategy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 font-mono">FP16 (Uncompressed)</div>
                <div className="text-2xl font-bold font-mono text-white">256 KB</div>
                <p className="text-[11px] text-slate-400">
                  1024 tokens × 128 dim × 2 bytes = 256 KB per page. Best retrieval fidelity (81.3 nDCG@5).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 font-mono">INT8 Scalar Quant</div>
                <div className="text-2xl font-bold font-mono text-white">128 KB</div>
                <p className="text-[11px] text-slate-400">
                  50% memory reduction with negligible loss (&lt; 0.2% drop). Supported natively in Qdrant & Vespa.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-violet-400 font-mono">1-bit Binary (Hamming)</div>
                <div className="text-2xl font-bold font-mono text-white">16 KB</div>
                <p className="text-[11px] text-slate-400">
                  16x memory reduction! 1,000,000 pages stored in just 16 GB RAM using bitwise POPCNT distance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
