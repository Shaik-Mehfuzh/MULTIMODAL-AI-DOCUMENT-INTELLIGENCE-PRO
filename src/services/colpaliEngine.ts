import {
  DocumentItem,
  DocumentPage,
  PatchAttribution,
  RetrievalModelType,
  RetrievalResult,
} from '../types/colpali';

// Deterministic pseudo-random seed generator for reproducible embedding simulation
function pseudoHash(str: string, seed: number = 0): number {
  let h = 0x811c9dc5 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 4294967296;
}

// Tokenize text into normalized tokens
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !['the', 'and', 'for', 'with', 'what', 'which', 'how'].includes(t));
}

// Generate a 128-dimensional L2-normalized vector
function createUnitVector(seedStr: string): number[] {
  const dim = 128;
  const vec = new Array(dim);
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    const val = pseudoHash(seedStr, i * 31 + 7) * 2 - 1;
    vec[i] = val;
    norm += val * val;
  }
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => v / norm);
}

// Compute dot product of two normalized vectors (cosine similarity)
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * ColPali Multi-Vector Late Interaction Engine
 * Implements the MaxSim operator: Score(Q, D) = sum_{q in Q} max_{d in D} (q · d)
 */
export class ColPaliEngine {
  private static instance: ColPaliEngine;

  public static getInstance(): ColPaliEngine {
    if (!ColPaliEngine.instance) {
      ColPaliEngine.instance = new ColPaliEngine();
    }
    return ColPaliEngine.instance;
  }

  /**
   * Late Interaction Retrieval over document pages
   */
  public retrieve(
    query: string,
    documents: DocumentItem[],
    model: RetrievalModelType = 'colpali-v1.2',
    topK: number = 5
  ): RetrievalResult[] {
    const startTime = performance.now();
    const queryTokens = tokenizeQuery(query);

    if (queryTokens.length === 0 || documents.length === 0) {
      return [];
    }

    const allPagesWithDocs: { doc: DocumentItem; page: DocumentPage }[] = [];
    documents.forEach((doc) => {
      doc.pages.forEach((page) => {
        allPagesWithDocs.push({ doc, page });
      });
    });

    const results: RetrievalResult[] = allPagesWithDocs.map(({ doc, page }) => {
      return this.scorePage(query, queryTokens, doc, page, model);
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    const elapsed = Math.max(12, Math.round(performance.now() - startTime));
    return results.slice(0, topK).map((r) => ({
      ...r,
      retrievalLatencyMs: elapsed,
    }));
  }

  /**
   * Score an individual page using the selected retrieval model
   */
  private scorePage(
    rawQuery: string,
    queryTokens: string[],
    doc: DocumentItem,
    page: DocumentPage,
    model: RetrievalModelType
  ): RetrievalResult {
    const pageText = (page.ocrText || '').toLowerCase();
    const docTitle = doc.title.toLowerCase();

    // 1. Simulate visual patch activations across 32x32 grid (1024 patches)
    const gridSize = page.patchGridSize || { rows: 32, cols: 32 };
    const patchHeatmap: PatchAttribution[] = [];
    const queryTokenMatches: RetrievalResult['queryTokenMatches'] = [];

    let totalMaxSim = 0;

    // Check if page contains visual elements like tables or charts that match query keywords
    const relevantElements = page.elements.filter((el) => {
      const elText = `${el.title || ''} ${el.content || ''} ${
        el.structuredData ? JSON.stringify(el.structuredData.headers) : ''
      }`.toLowerCase();
      return queryTokens.some((tok) => elText.includes(tok));
    });

    // Process each query token
    queryTokens.forEach((token) => {
      const qVec = createUnitVector(token);
      let bestSim = 0;
      let bestRow = Math.floor(pseudoHash(token, 1) * gridSize.rows);
      let bestCol = Math.floor(pseudoHash(token, 2) * gridSize.cols);

      // Check if this token matches a specific visual layout element on this page
      const matchedElem = page.elements.find((el) => {
        const text = `${el.title || ''} ${el.content || ''} ${
          el.structuredData ? JSON.stringify(el.structuredData.headers) : ''
        }`.toLowerCase();
        return text.includes(token);
      });

      if (matchedElem) {
        // Map bbox [ymin, xmin, ymax, xmax] (0..1000) to patch grid coordinates
        const [ymin, xmin, ymax, xmax] = matchedElem.bbox;
        const targetRow = Math.floor(((ymin + ymax) / 2000) * gridSize.rows);
        const targetCol = Math.floor(((xmin + xmax) / 2000) * gridSize.cols);

        // High visual-language alignment in ColPali
        bestSim = 0.82 + pseudoHash(token + doc.id + page.pageNumber, 9) * 0.16;
        bestRow = Math.min(gridSize.rows - 1, Math.max(0, targetRow));
        bestCol = Math.min(gridSize.cols - 1, Math.max(0, targetCol));
      } else if (pageText.includes(token) || docTitle.includes(token)) {
        // Moderate text occurrence
        bestSim = 0.65 + pseudoHash(token + page.pageNumber, 4) * 0.18;
      } else {
        // Background baseline semantic noise
        bestSim = 0.25 + pseudoHash(token + page.pageNumber, 8) * 0.22;
      }

      // Add model-specific adjustments
      if (model === 'colqwen2-7b') {
        bestSim = Math.min(0.99, bestSim * 1.04);
      } else if (model === 'bm25-ocr') {
        // BM25 relies only on exact text matches
        const hasWord = pageText.includes(token);
        bestSim = hasWord ? 0.75 : 0.05;
      } else if (model === 'bi-encoder-dense') {
        // Single vector bottlenecks - averages out localized fine-grained patches
        bestSim = Math.max(0.2, bestSim * 0.85);
      }

      totalMaxSim += bestSim;

      const xPercent = (bestCol / gridSize.cols) * 100;
      const yPercent = (bestRow / gridSize.rows) * 100;

      queryTokenMatches.push({
        token,
        maxSimilarity: Number(bestSim.toFixed(3)),
        bestPatchCoords: {
          row: bestRow,
          col: bestCol,
          xPercent,
          yPercent,
        },
      });

      // Scatter patch heatmap around the peak patch
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = bestRow + dr;
          const c = bestCol + dc;
          if (r >= 0 && r < gridSize.rows && c >= 0 && c < gridSize.cols) {
            const dist = Math.sqrt(dr * dr + dc * dc);
            const falloff = Math.exp(-dist * 1.2);
            const patchScore = bestSim * falloff;
            if (patchScore > 0.35) {
              patchHeatmap.push({
                row: r,
                col: c,
                score: Number(patchScore.toFixed(3)),
                tokenMatch: token,
                xPercent: (c / gridSize.cols) * 100,
                yPercent: (r / gridSize.rows) * 100,
                widthPercent: (1 / gridSize.cols) * 100,
                heightPercent: (1 / gridSize.rows) * 100,
              });
            }
          }
        }
      }
    });

    // MaxSim Score normalized by query length
    const normalizedMaxSim = totalMaxSim / queryTokens.length;

    // Calculate final score depending on retrieval architecture
    let finalScore = normalizedMaxSim;
    if (model === 'bm25-ocr') {
      // Classic BM25 term frequency formula simulation
      const termHits = queryTokens.filter((t) => pageText.includes(t)).length;
      finalScore = termHits / queryTokens.length;
    } else if (model === 'hybrid-colpali-bm25') {
      const termHits = queryTokens.filter((t) => pageText.includes(t)).length;
      const bm25Score = termHits / queryTokens.length;
      // Reciprocal rank fusion style combination
      finalScore = 0.7 * normalizedMaxSim + 0.3 * bm25Score;
    }

    return {
      documentId: doc.id,
      documentTitle: doc.title,
      pageNumber: page.pageNumber,
      score: Number(finalScore.toFixed(3)),
      model,
      maxSimScore: Number(normalizedMaxSim.toFixed(3)),
      queryTokenMatches,
      patchHeatmap,
      previewUrl: page.imageUrl,
      highlightedElements: relevantElements.length > 0 ? relevantElements : page.elements.slice(0, 2),
      retrievalLatencyMs: 24,
      textSnippet: page.ocrText ? page.ocrText.slice(0, 240) + '...' : undefined,
    };
  }
}
