# DocuMind AI — Multimodal Document Intelligence Platform
> **Founded on ColPali (illuin-tech/colpali): Vision Language Models & Multi-Vector Late Interaction for Complex PDFs**

[![ColPali Architecture](https://img.shields.io/badge/ColPali-v1.2%20(PaliGemma--3B)-06b6d4)](https://github.com/illuin-tech/colpali)
[![ViDoRe Benchmark](https://img.shields.io/badge/ViDoRe%20Benchmark-81.3%20nDCG%405-10b981)](https://huggingface.co/vidore)
[![Gemini Grounding](https://img.shields.io/badge/Grounded%20QA-Gemini%203.8%20Flash-6366f1)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Overview

Traditional Retrieval-Augmented Generation (RAG) relies on **Optical Character Recognition (OCR)** to parse PDFs into flat text strings. This process severely degrades retrieval accuracy on complex documents because:
1. **Tables lose grid topology:** Column headers detach from cell values.
2. **Infographics and charts are lost:** Trend lines, bars, axes, and legends are discarded or converted into fragmented numbers.
3. **Multi-column layouts collapse:** Linearization reads across columns rather than down columns.

**DocuMind AI** solves this problem by implementing **ColPali** ([Illuin Technology & Google Research](https://github.com/illuin-tech/colpali)). Document pages are embedded **directly as images** using a Vision Language Model (**PaliGemma-3B** + **SigLIP-So400m ViT**), generating 1,024 visual patch tokens per page. User queries interact via **ColBERT-style MaxSim late interaction**, matching individual query words directly to visual patches without an intermediate OCR step.

---

## 📐 Technical Architecture & Data Flow

```
[ User PDF Upload / Ingestion ]
             │
             ▼
   [ 448x448 Page Rasterizer ]
             │
             ▼
[ SigLIP-So400m Vision Transformer ]
   ├── 32x32 Spatial Patch Grid
   └── 1,024 Visual Patch Tokens (14x14 px each)
             │
             ▼
    [ PaliGemma-3B Linear Projection ]
   └── Multi-vector document representation: D ∈ ℝ^(1024 × 128)
             │
             ▼
     [ Vector Store & MaxSim Engine ]
             ▲
             │ Late Interaction: Score(Q,D) = ∑_i max_j (q_i · d_j)
             │
[ Natural Language Query: Q ∈ ℝ^(m × 128) ]
             │
             ▼
┌───────────────────────────────┬───────────────────────────────┐
│                               │                               │
▼                               ▼                               ▼
[ Visual Patch Heatmap ]   [ Evidence Citations ]   [ Grounded Synthesis ]
(Attention Attribution)    (Doc Name, Page, BBox)   (Gemini 3.8 Flash)
```

---

## 🚀 Key Features

### 1. ColPali Visual Document Retrieval (Feature 1)
- Supports multi-page PDF ingestion and page rasterization.
- Extracts 1,024 visual patch tokens per page ($d=128$).
- Real-time **MaxSim late interaction** with token-by-token alignment.
- **Dynamic Attention Heatmaps:** Hover over query tokens to see exactly which visual patches (charts, table rows, diagrams) lit up.
- Compares multiple retrieval baselines: ColPali-v1.2, ColQwen2-7B, BM25 (OCR), and BGE-M3 (Dense Bi-Encoder).

### 2. Evidence-Based AI Question Answering (Feature 2)
- Zero-hallucination policy with mandatory document citations.
- Separates findings into **"Directly Supported Facts"** vs **"Inferred Conclusions"**.
- Detects unanswerable queries and clearly explains what evidence is missing.
- "Inspect Evidence" view opens the cited page with bounding region highlights.

### 3. Intelligent Table and Chart Analysis (Feature 3)
- Preserves 2D tabular structure for CSV / JSON export.
- Chart trend explainer separating **Observed Values** from **Extrapolations**.
- **Numerical Calculation Validator:** Automatically audits YoY growth rates, ratios, and percentages cited in reports against raw table cells.

### 4. Multi-Document Comparison Matrix (Feature 4)
- Side-by-side diffing of specifications, financial filings, and research papers.
- Highlights **metric conflicts**, structural changes, and omissions.
- Preserves unresolved discrepancies as **"Open Conflicts"** rather than hallucinating consensus.

### 5. ViDoRe Evaluation & Benchmarking Lab (Feature 5)
- Standardized benchmarking suite across scientific papers, forms, and financial reports.
- Computes **Recall@1, Recall@3, Recall@5, Precision@1, Precision@5, MRR, nDCG@5**, and latency breakdown.
- Diagnostic table highlighting hard queries on fine-print tables and visual charts.

### 6. Technical Interview Prep & Architecture Lab
- Specially designed for university students defending portfolio projects in Google / Microsoft engineering interview loops.
- Mathematical derivations of the MaxSim operator.
- Quantization scaling strategies (FP16: 256 KB/page vs Binary Hamming: 16 KB/page).
- Curated high-yield interview questions and model answers.

---

## 💻 Local Setup and Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- (Optional) Python 3.10+ if running native PyTorch `colpali-engine`

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/your-username/documind-ai.git
cd documind-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY (optional, fallback offline mode supported)

# 4. Start full-stack development server (Express + Vite)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔒 Security and Privacy Guarantees

1. **Zero Client Secrets:** All AI API credentials (`GEMINI_API_KEY`) are isolated server-side.
2. **Untrusted Input Sanitization:** Document text and metadata are sanitized to prevent indirect prompt injection.
3. **Code Execution Block:** No executable code extracted from documents is ever evaluated.
4. **Ephemeral Memory Storage:** User-uploaded documents and patch embeddings are kept in-memory and can be purged on demand.

---

## 🎓 Technical Interview Defense Guide (High Yield)

**Q: Why does ColPali's late interaction outperform dense bi-encoders (like CLIP or BGE-M3)?**
> *A: Single-vector bi-encoders compress an entire page into a single vector (e.g., 768 dimensions), causing an "information bottleneck" where fine-grained table cells, chart axes, and body text blur together. ColPali represents each page as 1,024 patch vectors. The MaxSim operator finds the maximum dot product for each query word against all patches, preserving word-to-patch spatial alignment.*

**Q: What is the computational complexity of the MaxSim operator?**
> *A: For a query with $m$ tokens and a page with $n=1024$ patches in $d=128$ dimensions, MaxSim requires $m \times n$ dot products, which is $O(m \cdot n \cdot d)$. Because $m \approx 10$, this equals ~10,240 FLOPs per page—executing in ~0.02ms on GPU tensor cores, several orders of magnitude faster than evaluating cross-attention in an LLM.*

---

## 📄 License
MIT License. Founded on research by Illuin Technology ([illuin-tech/colpali](https://github.com/illuin-tech/colpali)).
