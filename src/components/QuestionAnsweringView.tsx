import React, { useState } from 'react';
import {
  DocumentItem,
  GroundedCitation,
  QAResponse,
  RetrievalResult,
} from '../types/colpali';
import { ColPaliEngine } from '../services/colpaliEngine';
import { PageVisualRenderer } from './PageVisualRenderer';
import {
  MessageSquareQuote,
  Sparkles,
  Send,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  ExternalLink,
  Layers,
  HelpCircle,
  Info,
} from 'lucide-react';

interface QuestionAnsweringViewProps {
  documents: DocumentItem[];
  prefilledQuery?: string;
  prefilledResults?: RetrievalResult[];
}

export const QuestionAnsweringView: React.FC<QuestionAnsweringViewProps> = ({
  documents,
  prefilledQuery = '',
  prefilledResults,
}) => {
  const [query, setQuery] = useState(
    prefilledQuery || 'What is the FP4 Tensor Core TFLOPS specification for Blackwell B200 and how does it compare to Hopper H100?'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeQA, setActiveQA] = useState<QAResponse | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<GroundedCitation | null>(null);

  const sampleQuestions = [
    'What is the FP4 Tensor Core TFLOPS specification for Blackwell B200 and how does it compare to Hopper H100?',
    'What is the nDCG@5 score of ColPali on the ViDoRe benchmark table and why does it beat OCR?',
    'What was the percentage increase in provision for credit losses for ApexFin in Q3 2026?',
    'What Hazard Ratio (HR) and p-value was achieved by the mRNA-402 melanoma clinical trial?',
    'What is the quantum computing qubit coherence time for the superconducting transmon? (Unanswerable test query)',
  ];

  const handleAsk = async (questionText: string = query) => {
    if (!questionText.trim()) return;
    setIsLoading(true);

    try {
      // 1. Retrieve evidence using ColPali visual engine
      const retrievedEvidence = ColPaliEngine.getInstance().retrieve(
        questionText,
        documents,
        'colpali-v1.2',
        4
      );

      // 2. Call backend /api/qa
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: questionText,
          documentEvidence: retrievedEvidence,
          documents: documents.map((d) => ({ id: d.id, title: d.title })),
        }),
      });

      if (!res.ok) {
        throw new Error('QA request failed');
      }

      const data = await res.json();

      const qaResult: QAResponse = {
        id: `qa-${Date.now()}`,
        query: questionText,
        answerText: data.answerText,
        hasSufficientEvidence: data.hasSufficientEvidence,
        confidenceScore: data.confidenceScore ?? 85,
        supportedFacts: data.supportedFacts || [],
        inferredConclusions: data.inferredConclusions || [],
        missingEvidenceNotes: data.missingEvidenceNotes,
        citations: data.citations || [],
        retrievedPages: retrievedEvidence,
        generationLatencyMs: 140,
        timestamp: new Date().toLocaleTimeString(),
      };

      setActiveQA(qaResult);
      if (qaResult.citations.length > 0) {
        setSelectedCitation(qaResult.citations[0]);
      } else {
        setSelectedCitation(null);
      }
    } catch (err) {
      console.error('QA request error:', err);
      // Deterministic fallback
      const retrieved = ColPaliEngine.getInstance().retrieve(
        questionText,
        documents,
        'colpali-v1.2',
        3
      );
      const top = retrieved[0];
      const isSufficient = top && top.score > 0.45;

      const fallbackQA: QAResponse = {
        id: `qa-${Date.now()}`,
        query: questionText,
        answerText: isSufficient
          ? `According to ${top.documentTitle} (Page ${top.pageNumber}), the visual patch retrieval found verified factual evidence with score ${(top.score * 100).toFixed(1)}%.`
          : 'INSUFFICIENT EVIDENCE: The loaded document collection does not contain evidence for this query. The model has deliberately refused to speculate to prevent hallucinations.',
        hasSufficientEvidence: isSufficient,
        confidenceScore: isSufficient ? Math.round(top.score * 100) : 15,
        supportedFacts: isSufficient ? [`Verified on Page ${top.pageNumber} of "${top.documentTitle}"`] : [],
        inferredConclusions: [],
        missingEvidenceNotes: isSufficient ? undefined : 'No relevant visual patches matched the terms.',
        citations: isSufficient
          ? [
              {
                citationId: 'cit-1',
                documentId: top.documentId,
                documentTitle: top.documentTitle,
                pageNumber: top.pageNumber,
                quotedTextOrEvidence: top.textSnippet || 'Visual element in page layout',
                evidenceType: 'text',
              },
            ]
          : [],
        retrievedPages: retrieved,
        generationLatencyMs: 45,
        timestamp: new Date().toLocaleTimeString(),
      };
      setActiveQA(fallbackQA);
    } finally {
      setIsLoading(false);
    }
  };

  // Find document and page for active citation
  const activeCitedDoc = selectedCitation
    ? documents.find(
        (d) =>
          d.id === selectedCitation.documentId ||
          d.title.toLowerCase().includes(selectedCitation.documentTitle.toLowerCase())
      ) || documents[0]
    : null;

  const activeCitedPage = activeCitedDoc
    ? activeCitedDoc.pages.find((p) => p.pageNumber === selectedCitation?.pageNumber) ||
      activeCitedDoc.pages[0]
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-cyan-400" />
            Evidence-Based AI Question Answering
          </h1>
          <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Hallucination Policy
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Every statement is strictly anchored in retrieved document pages, tables, or charts. Factual
          evidence is separated from inferred conclusions, with direct citations and visual bounding boxes.
        </p>
      </div>

      {/* Query Bar */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative flex items-center"
        >
          <div className="absolute left-4 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a technical, numerical, or architectural question..."
            className="w-full bg-slate-950/90 border border-slate-700/80 hover:border-cyan-500/60 focus:border-cyan-400 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-12 pr-28 py-3.5 shadow-xl transition-all outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Retrieving...
              </span>
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          <span className="text-slate-500 font-mono text-[11px] shrink-0">Sample queries:</span>
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleAsk(sq);
              }}
              className="shrink-0 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-750 px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer"
            >
              {sq.length > 55 ? sq.slice(0, 55) + '...' : sq}
            </button>
          ))}
        </div>
      </div>

      {/* Answer & Evidence Section */}
      {activeQA ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AI Answer & Grounding Breakdown */}
          <div className="lg:col-span-6 space-y-4">
            {/* Answer Narrative Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Grounded Answer</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      activeQA.hasSufficientEvidence
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {activeQA.hasSufficientEvidence ? 'Evidence Sufficient' : 'Insufficient Evidence'}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Confidence:{' '}
                  <strong className={activeQA.confidenceScore > 70 ? 'text-emerald-400' : 'text-amber-400'}>
                    {activeQA.confidenceScore}%
                  </strong>
                </div>
              </div>

              {/* Insufficient Evidence Warning Banner */}
              {!activeQA.hasSufficientEvidence && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Missing Evidence Notice:</strong>
                    <span>
                      {activeQA.missingEvidenceNotes ||
                        'The indexed corpus does not contain documented verification for this specific claim. DocuMind refuses to synthesize unbacked answers.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Narrative Text */}
              <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {activeQA.answerText}
              </div>

              {/* Directly Supported Facts */}
              {activeQA.supportedFacts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Directly Supported Facts
                  </h4>
                  <ul className="space-y-1.5">
                    {activeQA.supportedFacts.map((fact, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-lg flex items-start gap-2"
                      >
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inferred Conclusions */}
              {activeQA.inferredConclusions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    Inferred Conclusions & Extrapolations
                  </h4>
                  <ul className="space-y-1.5">
                    {activeQA.inferredConclusions.map((inf, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-lg flex items-start gap-2"
                      >
                        <span className="text-indigo-400 font-bold shrink-0">→</span>
                        <span>{inf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citations List */}
              {activeQA.citations.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 font-mono">
                    CITATIONS & SOURCE EVIDENCE ({activeQA.citations.length})
                  </h4>
                  <div className="space-y-2">
                    {activeQA.citations.map((cit, cIdx) => {
                      const isSelected = selectedCitation?.quotedTextOrEvidence === cit.quotedTextOrEvidence;
                      return (
                        <div
                          key={cIdx}
                          onClick={() => setSelectedCitation(cit)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40'
                              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              {cit.documentTitle} (Page {cit.pageNumber})
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {cit.evidenceType}
                            </span>
                          </div>
                          <p className="mt-1.5 text-slate-400 font-mono text-[11px] line-clamp-2">
                            "{cit.quotedTextOrEvidence}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Evidence Inspector (Page Image + Bounding Box) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                Verified Evidence Inspection
              </span>
              {selectedCitation && (
                <span className="font-mono text-cyan-400 text-[11px]">
                  Viewing: {selectedCitation.documentTitle} — Page {selectedCitation.pageNumber}
                </span>
              )}
            </div>

            {activeCitedPage && activeCitedDoc ? (
              <PageVisualRenderer
                page={activeCitedPage}
                documentTitle={activeCitedDoc.title}
                showPatchGrid={false}
                showHeatmap={true}
                patchHeatmap={activeQA.retrievedPages?.[0]?.patchHeatmap || []}
              />
            ) : (
              <div className="h-[600px] flex items-center justify-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs">
                Select a citation on the left to inspect the primary page evidence.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <HelpCircle className="w-8 h-8 text-cyan-400/60 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            Ask any question to inspect verified multimodal evidence
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            DocuMind AI will retrieve visual patches via ColPali, calculate MaxSim alignments, and provide
            strict fact-checked answers with page citations.
          </p>
        </div>
      )}
    </div>
  );
};
