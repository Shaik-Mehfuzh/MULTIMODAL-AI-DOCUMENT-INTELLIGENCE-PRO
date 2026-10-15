/**
 * ColPali Multimodal Document Intelligence Types
 * Based on illuin-tech/colpali architecture (ViT SigLIP-So400m + PaliGemma-3B / ColQwen2)
 */

export interface DocumentPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  ocrText?: string;
  // Visual layout regions
  elements: DocumentElement[];
  // Pre-computed patch token metadata (32x32 = 1024 visual tokens per page)
  patchGridSize: { rows: number; cols: number };
  // Representative patch features for late-interaction matching
  patchTokens?: {
    id: number;
    row: number;
    col: number;
    embedding: number[]; // 128-dim normalized embedding
    dominantConcept?: string;
  }[];
}

export interface DocumentElement {
  id: string;
  type: 'title' | 'paragraph' | 'table' | 'chart' | 'figure' | 'formula' | 'header';
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0..1000
  title?: string;
  content?: string;
  structuredData?: {
    headers: string[];
    rows: (string | number)[][];
    metadata?: Record<string, any>;
  };
  chartMetadata?: {
    chartType: 'bar' | 'line' | 'scatter' | 'donut';
    xAxisLabel: string;
    yAxisLabel: string;
    dataPoints: { label: string; value: number; secondaryValue?: number }[];
    observedInsights: string[];
    inferredInsights: string[];
  };
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  category: 'Research Paper' | 'Hardware Architecture' | 'Financial 10-K' | 'Clinical Protocol' | 'Custom Upload';
  pageCount: number;
  fileSizeBytes: number;
  createdAt: string;
  indexedWith: string; // e.g. "ColPali-v1.2 (PaliGemma-3B-pt-448)"
  indexingTimeMs: number;
  status: 'indexed' | 'indexing' | 'error';
  pages: DocumentPage[];
  summary: string;
  authorOrOrg?: string;
}

export type RetrievalModelType =
  | 'colpali-v1.2'
  | 'colqwen2-7b'
  | 'bm25-ocr'
  | 'bi-encoder-dense'
  | 'hybrid-colpali-bm25';

export interface PatchAttribution {
  row: number;
  col: number;
  score: number; // 0..1 normalized similarity
  tokenMatch: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface RetrievalResult {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  score: number;
  model: RetrievalModelType;
  maxSimScore: number;
  queryTokenMatches: {
    token: string;
    maxSimilarity: number;
    bestPatchCoords: { row: number; col: number; xPercent: number; yPercent: number };
  }[];
  patchHeatmap: PatchAttribution[];
  previewUrl: string;
  highlightedElements: DocumentElement[];
  retrievalLatencyMs: number;
  textSnippet?: string;
}

export interface GroundedCitation {
  citationId: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  boundingRegion?: { x: number; y: number; width: number; height: number };
  quotedTextOrEvidence: string;
  evidenceType: 'text' | 'table-cell' | 'chart-datapoint' | 'diagram';
}

export interface QAResponse {
  id: string;
  query: string;
  answerText: string;
  hasSufficientEvidence: boolean;
  confidenceScore: number; // 0..100
  supportedFacts: string[];
  inferredConclusions: string[];
  missingEvidenceNotes?: string;
  citations: GroundedCitation[];
  retrievedPages: RetrievalResult[];
  generationLatencyMs: number;
  timestamp: string;
}

export interface ViDoReBenchmarkQuery {
  id: string;
  query: string;
  targetCategory: string;
  difficulty: 'Standard' | 'Hard (Visual/Chart)' | 'Hard (Fine-print Table)' | 'Multi-hop';
  groundTruth: {
    documentId: string;
    relevantPages: number[];
  }[];
}

export interface ModelBenchmarkScore {
  model: RetrievalModelType;
  name: string;
  recallAt1: number;
  recallAt3: number;
  recallAt5: number;
  precisionAt1: number;
  precisionAt5: number;
  mrr: number; // Mean Reciprocal Rank
  ndcgAt5: number;
  avgLatencyMs: {
    queryEncoding: number;
    lateInteraction: number;
    total: number;
  };
  gpuVramRequiredGB: number;
  storagePer10kPagesMB: number;
}

export interface DocumentComparisonFinding {
  id: string;
  topic: string;
  category: 'metric_conflict' | 'similarity' | 'specification_diff' | 'missing_information';
  description: string;
  docA: {
    documentId: string;
    title: string;
    page: number;
    statementOrValue: string;
  };
  docB: {
    documentId: string;
    title: string;
    page: number;
    statementOrValue: string;
  };
  isConflictResolved: boolean;
  status: 'Open Conflict' | 'Direct Match' | 'Delta / Variant' | 'Asymmetric';
}
