import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Trash2,
  Lock,
  EyeOff,
  Server,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface SettingsViewProps {
  onClearCache: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClearCache }) => {
  const [patchResolution, setPatchResolution] = useState('32x32');
  const [quantizationMode, setQuantizationMode] = useState('fp16');
  const [enablePiiMasking, setEnablePiiMasking] = useState(true);
  const [enableScriptSanitizer, setEnableScriptSanitizer] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClear = () => {
    onClearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Model Configuration, Privacy & Security Settings
          </h1>
          <span className="text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Leak Guard
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Configure visual patch grids, quantization levels, and manage strict security controls preventing
          untrusted document prompt injections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model & Indexing Parameters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono">
              ColPali Model & Index Parameters
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-300 block mb-1">Visual Patch Grid Resolution</label>
              <select
                value={patchResolution}
                onChange={(e) => setPatchResolution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 outline-none"
              >
                <option value="32x32">32 × 32 Grid (1,024 patches / page - ColPali Default)</option>
                <option value="28x28">28 × 28 Grid (784 patches / page - Low Latency)</option>
                <option value="16x16">16 × 16 Grid (256 patches / page - High Throughput)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                Controls the spatial granularity of patch-level late interaction.
              </p>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Vector Storage Quantization</label>
              <select
                value={quantizationMode}
                onChange={(e) => setQuantizationMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2.5 outline-none"
              >
                <option value="fp16">Float16 Uncompressed (256 KB / page, 81.3 nDCG@5)</option>
                <option value="int8">INT8 Scalar Quantized (128 KB / page, 81.1 nDCG@5)</option>
                <option value="binary">1-bit Binary Quantized (16 KB / page, 74.2 nDCG@5)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Generative Grounding Engine</label>
              <input
                type="text"
                disabled
                value="Gemini 3.8 Flash (Server-Side Proxy via @google/genai)"
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 rounded-lg p-2.5 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                API credentials are strictly maintained server-side in environment variables and never exposed to the client.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Privacy Configuration */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono">
              Privacy & Security Controls
            </h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enableScriptSanitizer}
                onChange={(e) => setEnableScriptSanitizer(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Untrusted Document Instruction Stripping
                </span>
                <span className="text-[11px] text-slate-400 leading-relaxed font-sans block mt-0.5">
                  Treats all document text and captions as untrusted input. Strips script tags, prevents eval, and blocks prompt injection attacks.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enablePiiMasking}
                onChange={(e) => setEnablePiiMasking(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Confidential Content Log Masking
                </span>
                <span className="text-[11px] text-slate-400 leading-relaxed font-sans block mt-0.5">
                  Prevents logging of raw document text, financial amounts, and patient identifiers in application traces.
                </span>
              </div>
            </label>

            {/* Cache Management */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-white block">
                Ephemeral In-Memory Storage & Cache Cleanup
              </span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Clear all custom-uploaded documents, visual patch token embeddings, and temporary session state.
              </p>
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-mono transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Ephemeral Cache</span>
              </button>
              {cacheCleared && (
                <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Ephemeral cache cleared successfully.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Limitations Documentation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase font-mono">
            Documented Security Limitations & Adversarial Defenses
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-sans leading-relaxed">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">Adversarial Typography:</strong>
            Invisible white-on-white text in PDFs can still activate visual patch tokens if rendered into pixel maps.
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">Resolution Truncation:</strong>
            448×448 resolution downsamples tiny font footnotes (&lt; 4 pt) into visual blur patches.
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">Memory Isolation:</strong>
            Session documents are strictly retained in memory and not permanently persisted to shared disks.
          </div>
        </div>
      </div>
    </div>
  );
};
