import { DocumentItem } from '../types/colpali';

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-colpali-paper',
    title: 'ColPali: Efficient Document Retrieval with Vision Language Models',
    filename: 'colpali_arxiv_2407.01449.pdf',
    category: 'Research Paper',
    authorOrOrg: 'Illuin Technology & Google Research (Févry et al.)',
    pageCount: 4,
    fileSizeBytes: 3410500,
    createdAt: '2024-07-02',
    indexedWith: 'ColPali-v1.2 (PaliGemma-3B-pt-448)',
    indexingTimeMs: 420,
    status: 'indexed',
    summary:
      'Seminal paper introducing ColPali: representing document pages as images directly through PaliGemma-3B to produce visual patch token embeddings, matched via ColBERT-style MaxSim late interaction without OCR.',
    pages: [
      {
        pageNumber: 1,
        imageUrl: '/assets/colpali_p1.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `ColPali: Efficient Document Retrieval with Vision Language Models.
Manuel Févry, Benjamin Clavié, Dylan Verhaeghe, et al. Illuin Technology & Google Research.
Abstract:
Documents are inherently visual objects containing typography, tables, and figures that traditional text-based retrieval pipelines discard via OCR. We present ColPali, a novel model architecture and training strategy that leverages Vision Language Models (VLMs) to produce multi-vector document representations directly from page images. By utilizing a late-interaction mechanism (MaxSim), ColPali matches query tokens to the most relevant visual patches of the page, outperforming modern OCR-based dense retrieval pipelines across the ViDoRe benchmark.`,
        elements: [
          {
            id: 'elem-col-title',
            type: 'title',
            bbox: [50, 80, 140, 920],
            title: 'ColPali: Efficient Document Retrieval with Vision Language Models',
            content: 'Research Paper introducing late interaction for vision language models.',
          },
          {
            id: 'elem-col-arch-fig',
            type: 'figure',
            bbox: [380, 100, 780, 900],
            title: 'Figure 1: ColPali Architecture Pipeline',
            content:
              'Page image (448x448) passed through SigLIP-So400m ViT encoder yielding 1024 patch tokens, projected through PaliGemma language layers to d=128 multi-vectors. Query tokens interact via MaxSim operator.',
          },
        ],
      },
      {
        pageNumber: 2,
        imageUrl: '/assets/colpali_p2.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Table 1: ViDoRe Benchmark Results across DocVQA, InfoVQA, ArXiv, and TabFactual.
Model | Architecture | nDCG@5 | Recall@5 | Latency (ms)
ColPali-v1.2 | Multi-Vector Late Interaction (PaliGemma-3B) | 81.3 | 89.2 | 28ms
ColQwen2-7B | Multi-Vector Late Interaction (Qwen2-VL) | 83.7 | 91.5 | 44ms
BGE-M3 (OCR) | Dense Single-Vector (Text only) | 68.4 | 74.1 | 12ms
BM25 (Tesseract) | Sparse Lexical Index | 54.2 | 61.8 | 6ms
OpenAI text-3-large (OCR) | Dense Single-Vector | 70.1 | 76.5 | 35ms`,
        elements: [
          {
            id: 'elem-col-tbl-1',
            type: 'table',
            bbox: [120, 70, 520, 930],
            title: 'Table 1: Benchmark Comparison on ViDoRe Test Suite',
            structuredData: {
              headers: ['Model', 'Architecture', 'nDCG@5', 'Recall@5', 'Latency (ms)'],
              rows: [
                ['ColPali-v1.2', 'Multi-Vector Late Interaction', 81.3, 89.2, 28],
                ['ColQwen2-7B', 'Multi-Vector Late Interaction', 83.7, 91.5, 44],
                ['BGE-M3 (OCR)', 'Dense Single-Vector (Text only)', 68.4, 74.1, 12],
                ['BM25 (Tesseract)', 'Sparse Lexical Index', 54.2, 61.8, 6],
                ['OpenAI text-3-large (OCR)', 'Dense Single-Vector', 70.1, 76.5, 35],
              ],
            },
          },
          {
            id: 'elem-col-chart-1',
            type: 'chart',
            bbox: [560, 80, 950, 920],
            title: 'ViDoRe Evaluation Score (nDCG@5) by Document Type',
            chartMetadata: {
              chartType: 'bar',
              xAxisLabel: 'Document Domain',
              yAxisLabel: 'nDCG@5 Score',
              dataPoints: [
                { label: 'DocVQA (Forms)', value: 82.4, secondaryValue: 64.1 },
                { label: 'InfoVQA (Infographics)', value: 85.1, secondaryValue: 51.2 },
                { label: 'TabFactual (Tables)', value: 86.8, secondaryValue: 69.3 },
                { label: 'ArXiv (Scientific)', value: 79.5, secondaryValue: 72.0 },
              ],
              observedInsights: [
                'ColPali achieves 85.1 nDCG@5 on InfoVQA compared to 51.2 for OCR-based BGE-M3 (a +33.9 point improvement).',
                'TabFactual score reaches 86.8, demonstrating visual preservation of row/column grid alignment.',
              ],
              inferredInsights: [
                'The massive gap on Infographics indicates traditional OCR fails to associate non-linear captions with corresponding graphical icons.',
                'Scientific paper margins and equation layouts retain visual proximity signals in ViT patch representations.',
              ],
            },
          },
        ],
      },
      {
        pageNumber: 3,
        imageUrl: '/assets/colpali_p3.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Memory Footprint and Quantization trade-offs for ColPali index.
Float16 embeddings: 1024 patches * 128 dimensions * 2 bytes = 256 KB per page.
Int8 Quantization: 1024 * 128 * 1 byte = 128 KB per page with only 0.2% drop in nDCG@5.
Binary Quantization: 16 KB per page, enabling storage of 1,000,000 pages in 16 GB of RAM.`,
        elements: [
          {
            id: 'elem-col-quant-tbl',
            type: 'table',
            bbox: [100, 80, 480, 920],
            title: 'Table 2: Quantization & Index Footprint per 100k Pages',
            structuredData: {
              headers: ['Precision Mode', 'Bytes / Token', 'Size per Page', '100k Pages RAM', 'ViDoRe nDCG@5'],
              rows: [
                ['FP16 (Uncompressed)', 2, '256 KB', '25.6 GB', 81.3],
                ['INT8 (Scalar Quant)', 1, '128 KB', '12.8 GB', 81.1],
                ['INT4 (Product Quant)', 0.5, '64 KB', '6.4 GB', 79.8],
                ['Binary (1-bit Hamming)', 0.125, '16 KB', '1.6 GB', 74.2],
              ],
            },
          },
        ],
      },
      {
        pageNumber: 4,
        imageUrl: '/assets/colpali_p4.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Figure 4: Qualitative Attention Heatmap Alignment.
When querying 'Where is the peak latency shown in Figure 3?', the MaxSim attention concentrates precisely on the coordinate (x=72%, y=41%) corresponding to the red line spike in the visual plot.`,
        elements: [
          {
            id: 'elem-col-heatmap-demo',
            type: 'figure',
            bbox: [80, 80, 850, 920],
            title: 'Figure 4: Visual Patch MaxSim Alignment Example',
            content:
              'Demonstrates query token "temperature sensor reading in Figure 3" attending directly to the visual chart legend and axis tick labels.',
          },
        ],
      },
    ],
  },
  {
    id: 'doc-nvidia-blackwell',
    title: 'NVIDIA Blackwell B200 GPU Architecture Whitepaper',
    filename: 'nvidia_blackwell_architecture_v1.pdf',
    category: 'Hardware Architecture',
    authorOrOrg: 'NVIDIA Corporation Systems & Architecture Group',
    pageCount: 3,
    fileSizeBytes: 4890000,
    createdAt: '2024-03-18',
    indexedWith: 'ColPali-v1.2 (PaliGemma-3B-pt-448)',
    indexingTimeMs: 380,
    status: 'indexed',
    summary:
      'Official technical whitepaper on NVIDIA Blackwell B200 featuring dual-die 208-billion transistor design, NV-HBI 10 TB/s chip-to-chip link, 2nd-gen Transformer Engine with FP4 precision, and 8 TB/s HBM3e bandwidth.',
    pages: [
      {
        pageNumber: 1,
        imageUrl: '/assets/nvidia_p1.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `NVIDIA Blackwell Architecture Technical Brief.
The NVIDIA Blackwell architecture powers a new era of computing. Featuring 208 billion transistors manufactured on a custom TSMC 4NP process, the dual-chip Blackwell GPU is unified via a 10 TB/s bidirectional high-bandwidth interconnect (NV-HBI), acting as a single coherent CUDA device.`,
        elements: [
          {
            id: 'elem-nv-title',
            type: 'title',
            bbox: [60, 80, 160, 920],
            title: 'NVIDIA Blackwell Architecture: Next-Gen Accelerated Computing',
            content: 'Technical Whitepaper on B200 and GB200 Superchip systems.',
          },
          {
            id: 'elem-nv-diag-1',
            type: 'figure',
            bbox: [220, 100, 750, 900],
            title: 'Figure 1: Dual-Die Interconnect Topology & Cache Hierarchy',
            content:
              'Illustrates Die 0 and Die 1 bridged by 10 TB/s NV-HBI, 192GB HBM3e memory pool, and unified 96MB L2 Cache.',
          },
        ],
      },
      {
        pageNumber: 2,
        imageUrl: '/assets/nvidia_p2.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Table 1: Architectural Comparison: Hopper H100 vs Blackwell B200.
Feature | Hopper H100 SXM5 | Blackwell B200 | Generation Factor
Transistors | 80 Billion | 208 Billion | 2.6x
Manufacturing Process | TSMC 4N | TSMC 4NP | Refined
FP16 Tensor TFLOPS | 989 TFLOPS | 2,250 TFLOPS | 2.27x
FP8 Tensor TFLOPS | 1,979 TFLOPS | 4,500 TFLOPS | 2.27x
FP4 Tensor TFLOPS | Not Supported | 9,000 TFLOPS | Breakthrough
HBM Memory Capacity | 80 GB HBM3 | 192 GB HBM3e | 2.4x
Memory Bandwidth | 3.35 TB/s | 8.0 TB/s | 2.38x
NVLink Bandwidth | 900 GB/s (Gen 4) | 1,800 GB/s (Gen 5) | 2.0x
Max Thermal TDP | 700 W | 1,000 W (Configurable) | 1.43x`,
        elements: [
          {
            id: 'elem-nv-spec-tbl',
            type: 'table',
            bbox: [100, 60, 650, 940],
            title: 'Table 1: H100 SXM5 vs B200 Architectural Specifications',
            structuredData: {
              headers: [
                'Specification Metric',
                'Hopper H100 SXM5',
                'Blackwell B200',
                'Delta Ratio',
              ],
              rows: [
                ['Transistor Count', '80 Billion', '208 Billion', '2.6x'],
                ['FP16 Tensor Core', '989 TFLOPS', '2,250 TFLOPS', '2.27x'],
                ['FP8 Tensor Core', '1,979 TFLOPS', '4,500 TFLOPS', '2.27x'],
                ['FP4 Tensor Core', 'Not Supported', '9,000 TFLOPS', 'Infinite (New)'],
                ['HBM3e Memory Size', '80 GB HBM3', '192 GB HBM3e', '2.40x'],
                ['Memory Bandwidth', '3.35 TB/s', '8.0 TB/s', '2.38x'],
                ['NVLink 5 Bandwidth', '900 GB/s', '1,800 GB/s', '2.00x'],
                ['Max Thermal TDP', '700 Watts', '1,000 Watts', '1.43x'],
              ],
            },
          },
          {
            id: 'elem-nv-chart-perf',
            type: 'chart',
            bbox: [680, 80, 980, 920],
            title: 'LLM Inference Throughput (Tokens/sec per 8-GPU Node)',
            chartMetadata: {
              chartType: 'bar',
              xAxisLabel: 'Model Benchmark',
              yAxisLabel: 'Relative Throughput (Normalized to H100 = 1.0)',
              dataPoints: [
                { label: 'Llama 3 70B (FP8)', value: 3.4, secondaryValue: 1.0 },
                { label: 'Llama 3 70B (FP4)', value: 5.2, secondaryValue: 0.0 },
                { label: 'Mixtral 8x22B MoE', value: 4.1, secondaryValue: 1.0 },
                { label: 'GPT-MoE 1.8T (FP4)', value: 30.0, secondaryValue: 1.0 },
              ],
              observedInsights: [
                'On GPT-MoE 1.8T parameter model, Blackwell delivers a 30x inference speedup over Hopper due to NVLink 5 switch network and FP4 2nd-gen Transformer Engine.',
                'FP4 precision doubles throughput over FP8 while maintaining perplexity thresholds within 0.1%.',
              ],
              inferredInsights: [
                'Memory capacity expansion to 192GB enables holding entire 70B models on a single GPU without tensor parallel splitting.',
                'Energy consumption per token drops by up to 25x when operating in native FP4 quantization.',
              ],
            },
          },
        ],
      },
      {
        pageNumber: 3,
        imageUrl: '/assets/nvidia_p3.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Liquid Cooling and GB200 NVL72 Rack Architecture.
The GB200 NVL72 connects 36 Grace CPUs and 72 Blackwell GPUs in a rack-scale design acting as a single 1.4 exaflops AI supercomputer. Direct-to-chip liquid cooling achieves a PUE of 1.15.`,
        elements: [
          {
            id: 'elem-nv-rack-fig',
            type: 'figure',
            bbox: [100, 80, 700, 920],
            title: 'Figure 3: GB200 NVL72 Rack Exaflop Architecture',
            content:
              'Rack architecture showing 72 GPUs liquid-cooled, 5,000 NVLink copper cables totaling 2 miles length without optical transceivers.',
          },
        ],
      },
    ],
  },
  {
    id: 'doc-apexfin-q3',
    title: 'ApexFin Global Q3 2026 Financial & Operational Risk Filing',
    filename: 'apexfin_q3_2026_10q.pdf',
    category: 'Financial 10-K',
    authorOrOrg: 'ApexFin Global Financial Holdings Inc. (SEC Filing)',
    pageCount: 3,
    fileSizeBytes: 2190000,
    createdAt: '2026-09-30',
    indexedWith: 'ColPali-v1.2 (PaliGemma-3B-pt-448)',
    indexingTimeMs: 310,
    status: 'indexed',
    summary:
      'SEC Form 10-Q filing featuring consolidated income statement, credit risk provisioning, Basel III Common Equity Tier 1 (CET1) capital ratio, and segment operating margins.',
    pages: [
      {
        pageNumber: 1,
        imageUrl: '/assets/apexfin_p1.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `ApexFin Global Holdings Inc.
CONDENSED CONSOLIDATED STATEMENTS OF INCOME (UNAUDITED)
(In millions, except per share amounts)
Three Months Ended September 30, 2026 vs 2025.
Total Net Revenue: $14,250M (2026) vs $12,610M (2025), +13.0% YoY.
Operating Expenses: $8,120M vs $7,450M, +9.0% YoY.
Provision for Credit Losses: $640M vs $480M, +33.3% YoY.
Net Income: $4,290M vs $3,720M, +15.3% YoY.
Diluted Earnings Per Share: $3.82 vs $3.24.`,
        elements: [
          {
            id: 'elem-fin-income-tbl',
            type: 'table',
            bbox: [120, 80, 680, 920],
            title: 'Consolidated Statement of Operations (in Millions USD)',
            structuredData: {
              headers: ['Financial Line Item', 'Q3 2026', 'Q3 2025', 'YoY Change ($)', 'YoY Change (%)'],
              rows: [
                ['Total Net Revenue', '$14,250', '$12,610', '+$1,640', '+13.0%'],
                ['Global Payments Segment', '$7,840', '$6,920', '+$920', '+13.3%'],
                ['Enterprise Credit & Wealth', '$6,410', '$5,690', '+$720', '+12.7%'],
                ['Total Operating Expenses', '$8,120', '$7,450', '+$670', '+9.0%'],
                ['Provision for Credit Losses', '$640', '$480', '+$160', '+33.3%'],
                ['Income Before Income Taxes', '$5,490', '$4,680', '+$810', '+17.3%'],
                ['Net Income Attributable', '$4,290', '$3,720', '+$570', '+15.3%'],
                ['Diluted EPS ($)', '$3.82', '$3.24', '+$0.58', '+17.9%'],
              ],
            },
          },
        ],
      },
      {
        pageNumber: 2,
        imageUrl: '/assets/apexfin_p2.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Capital Adequacy and Regulatory Ratios.
Common Equity Tier 1 (CET1) Capital Ratio was 13.8% at September 30, 2026, compared to 13.2% at December 31, 2025.
Tier 1 Leverage Ratio stood at 7.4%. Total Loss-Absorbing Capacity (TLAC) reached $142.5 billion, comfortably exceeding the regulatory requirement of 11.5% by 230 basis points.`,
        elements: [
          {
            id: 'elem-fin-capital-chart',
            type: 'chart',
            bbox: [100, 80, 520, 920],
            title: 'CET1 Ratio Trend vs Regulatory Minimum Buffer',
            chartMetadata: {
              chartType: 'line',
              xAxisLabel: 'Quarter End',
              yAxisLabel: 'Ratio Percentage (%)',
              dataPoints: [
                { label: 'Q3 2025', value: 13.1, secondaryValue: 11.5 },
                { label: 'Q4 2025', value: 13.2, secondaryValue: 11.5 },
                { label: 'Q1 2026', value: 13.5, secondaryValue: 11.5 },
                { label: 'Q2 2026', value: 13.6, secondaryValue: 11.5 },
                { label: 'Q3 2026', value: 13.8, secondaryValue: 11.5 },
              ],
              observedInsights: [
                'CET1 ratio expanded steadily from 13.1% in Q3 2025 to 13.8% in Q3 2026.',
                'Maintains a 230 bps headroom above the 11.5% Basel III regulatory threshold.',
              ],
              inferredInsights: [
                'Strong organic capital generation through retained net earnings ($4.29B) offsets heightened loan loss provisions.',
              ],
            },
          },
          {
            id: 'elem-fin-risk-notes',
            type: 'paragraph',
            bbox: [560, 80, 920, 920],
            title: 'Note 4: Credit Risk & Non-Performing Loans (NPL)',
            content:
              'Non-performing loan ratio ticked up marginally from 0.72% to 0.88%, driven primarily by commercial real estate refinancing friction in secondary metropolitan markets. Allowance for credit losses coverage ratio is 285% of total NPLs.',
          },
        ],
      },
      {
        pageNumber: 3,
        imageUrl: '/assets/apexfin_p3.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Liquidity Coverage Ratio (LCR) and Stress Testing Results.
Average LCR for the quarter was 146%, representing high-quality liquid assets of $318 billion against net potential cash outflows of $218 billion under a 30-day severe market liquidity shock.`,
        elements: [
          {
            id: 'elem-fin-liquidity',
            type: 'paragraph',
            bbox: [120, 80, 450, 920],
            title: 'Liquidity & Contingency Reserves',
            content:
              'High-quality liquid assets (HQLA) totaled $318B, with sovereign securities comprising 74% and central bank reserves comprising 26%.',
          },
        ],
      },
    ],
  },
  {
    id: 'doc-biopharma-trial',
    title: 'Phase III Efficacy & Safety Trial Protocol: mRNA-402 Oncology Candidate',
    filename: 'mrna402_phase3_clinical_protocol.pdf',
    category: 'Clinical Protocol',
    authorOrOrg: 'BioPharma Global Oncology Consortium',
    pageCount: 3,
    fileSizeBytes: 3120000,
    createdAt: '2025-11-12',
    indexedWith: 'ColPali-v1.2 (PaliGemma-3B-pt-448)',
    indexingTimeMs: 340,
    status: 'indexed',
    summary:
      'Double-blind randomized clinical trial protocol evaluating mRNA-402 neoantigen vaccine combined with pembrolizumab in unresectable metastatic melanoma, detailing patient cohorts, Kaplan-Meier PFS, and adverse events.',
    pages: [
      {
        pageNumber: 1,
        imageUrl: '/assets/biopharma_p1.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Protocol NCT05892011: Phase 3 Study of mRNA-402 in Combination with Pembrolizumab.
Primary Endpoint: Progression-Free Survival (PFS) assessed by blinded independent central review (BICR) using RECIST v1.1.
Secondary Endpoints: Overall Survival (OS), Objective Response Rate (ORR), Duration of Response (DOR), and Safety/Tolerability Profile.`,
        elements: [
          {
            id: 'elem-bio-cohort-tbl',
            type: 'table',
            bbox: [180, 80, 720, 920],
            title: 'Table 1: Baseline Patient Demographic & Disease Characteristics',
            structuredData: {
              headers: ['Parameter / Baseline Characteristic', 'mRNA-402 + Pembro (N=420)', 'Placebo + Pembro (N=420)', 'p-value'],
              rows: [
                ['Median Age (Years, Range)', '62 (24-81)', '63 (22-84)', '0.64'],
                ['Male Sex (%)', '248 (59.0%)', '252 (60.0%)', '0.78'],
                ['BRAF V600 Mutation Positive', '189 (45.0%)', '185 (44.0%)', '0.81'],
                ['PD-L1 Tumor Proportion Score >= 50%', '134 (31.9%)', '131 (31.2%)', '0.88'],
                ['Elevated LDH (> ULN)', '151 (36.0%)', '147 (35.0%)', '0.79'],
                ['Visceral / CNS Metastases at Entry', '84 (20.0%)', '82 (19.5%)', '0.89'],
              ],
            },
          },
        ],
      },
      {
        pageNumber: 2,
        imageUrl: '/assets/biopharma_p2.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Kaplan-Meier Progression-Free Survival (PFS) Analysis.
At a median follow-up of 24.2 months, the combination of mRNA-402 + pembrolizumab demonstrated a statistically significant reduction in risk of recurrence or death by 44% (Hazard Ratio [HR] = 0.56, 95% CI: 0.43 - 0.73, p < 0.0001).
18-Month PFS Rate: 68.4% (Combination) vs 47.2% (Monotherapy).`,
        elements: [
          {
            id: 'elem-bio-pfs-chart',
            type: 'chart',
            bbox: [100, 80, 680, 920],
            title: 'Figure 2: Kaplan-Meier Curve for Progression-Free Survival',
            chartMetadata: {
              chartType: 'line',
              xAxisLabel: 'Time Since Randomization (Months)',
              yAxisLabel: 'Progression-Free Probability (%)',
              dataPoints: [
                { label: '0M', value: 100, secondaryValue: 100 },
                { label: '6M', value: 88.2, secondaryValue: 74.5 },
                { label: '12M', value: 76.8, secondaryValue: 56.1 },
                { label: '18M', value: 68.4, secondaryValue: 47.2 },
                { label: '24M', value: 62.1, secondaryValue: 39.8 },
              ],
              observedInsights: [
                'Combination therapy curve separates decisively at 4 months and sustains a 22.3% absolute PFS delta at 24 months (62.1% vs 39.8%).',
                'Hazard Ratio (HR) = 0.56 with p-value < 0.0001 proves superior recurrence-free duration.',
              ],
              inferredInsights: [
                'Delayed separation at ~3-4 months reflects the time required for neoantigen mRNA vaccination to elicit high-avidity CD8+ T-cell clonal expansion.',
              ],
            },
          },
        ],
      },
      {
        pageNumber: 3,
        imageUrl: '/assets/biopharma_p3.svg',
        width: 800,
        height: 1100,
        patchGridSize: { rows: 32, cols: 32 },
        ocrText: `Safety & Treatment-Emergent Adverse Events (TEAE).
Grade 3 or 4 treatment-related adverse events occurred in 26.2% of patients in the combination arm vs 21.0% in the monotherapy arm. Most frequent Grade 3+ TEAEs were fatigue (5.2%), rash (4.1%), and transient pyrexia (3.8%). No treatment-related deaths were reported.`,
        elements: [
          {
            id: 'elem-bio-safety-tbl',
            type: 'table',
            bbox: [120, 80, 600, 920],
            title: 'Table 3: Treatment-Related Adverse Events (Grade 3 or 4)',
            structuredData: {
              headers: ['Adverse Event Term', 'mRNA-402 + Pembro (%)', 'Placebo + Pembro (%)', 'Difference (%)'],
              rows: [
                ['Any Grade 3-4 TRAE', '26.2%', '21.0%', '+5.2%'],
                ['Fatigue', '5.2%', '3.1%', '+2.1%'],
                ['Maculopapular Rash', '4.1%', '2.9%', '+1.2%'],
                ['Transient Pyrexia', '3.8%', '1.0%', '+2.8%'],
                ['Immune-Mediated Colitis', '2.6%', '2.4%', '+0.2%'],
                ['ALT / AST Elevation', '2.1%', '1.9%', '+0.2%'],
              ],
            },
          },
        ],
      },
    ],
  },
];
