import React, { useState } from 'react';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { DocumentItem, RetrievalResult } from './types/colpali';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SearchAndEvidenceView } from './components/SearchAndEvidenceView';
import { QuestionAnsweringView } from './components/QuestionAnsweringView';
import { TableChartAnalysisView } from './components/TableChartAnalysisView';
import { MultiDocComparisonView } from './components/MultiDocComparisonView';
import { EvaluationLabView } from './components/EvaluationLabView';
import { InterviewPrepLabView } from './components/InterviewPrepLabView';
import { SettingsView } from './components/SettingsView';
import { PdfViewerModal } from './components/PdfViewerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>(SAMPLE_DOCUMENTS);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<DocumentItem | null>(null);

  // Cross-workspace handoff state
  const [qaPrefilledQuery, setQaPrefilledQuery] = useState('');
  const [qaPrefilledResults, setQaPrefilledResults] = useState<RetrievalResult[]>([]);

  const totalPageCount = documents.reduce((sum, d) => sum + d.pageCount, 0);

  const handleUploadDocument = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleClearCache = () => {
    setDocuments(SAMPLE_DOCUMENTS);
  };

  const handleSendQueryToQA = (query: string, results: RetrievalResult[]) => {
    setQaPrefilledQuery(query);
    setQaPrefilledResults(results);
    setActiveTab('qa');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Executive Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={documents.length}
        totalPageCount={totalPageCount}
      />

      {/* Main Workspace Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            documents={documents}
            onSelectDocument={(doc) => setSelectedDocForViewer(doc)}
            onNavigateTab={setActiveTab}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === 'search' && (
          <SearchAndEvidenceView
            documents={documents}
            onNavigateTab={setActiveTab}
            onSendQueryToQA={handleSendQueryToQA}
          />
        )}

        {activeTab === 'qa' && (
          <QuestionAnsweringView
            documents={documents}
            prefilledQuery={qaPrefilledQuery}
            prefilledResults={qaPrefilledResults}
          />
        )}

        {activeTab === 'tables' && <TableChartAnalysisView documents={documents} />}

        {activeTab === 'compare' && <MultiDocComparisonView documents={documents} />}

        {activeTab === 'eval' && <EvaluationLabView documents={documents} />}

        {activeTab === 'interview' && <InterviewPrepLabView />}

        {activeTab === 'settings' && <SettingsView onClearCache={handleClearCache} />}
      </main>

      {/* Visual PDF Page Viewer Modal */}
      {selectedDocForViewer && (
        <PdfViewerModal
          document={selectedDocForViewer}
          onClose={() => setSelectedDocForViewer(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#090d16] py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>DocuMind AI • ColPali Vision Language Retrieval Engine</span>
          </div>
          <div>
            Built with PaliGemma-3B • SigLIP-So400m ViT • ColBERT MaxSim • Gemini 3.8 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}
