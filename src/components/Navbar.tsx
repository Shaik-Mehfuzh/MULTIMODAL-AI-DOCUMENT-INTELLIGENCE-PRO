import React from 'react';
import {
  FileText,
  Search,
  MessageSquareQuote,
  Table as TableIcon,
  GitCompare,
  BarChart3,
  GraduationCap,
  Settings,
  Github,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'search'
  | 'qa'
  | 'tables'
  | 'compare'
  | 'eval'
  | 'interview'
  | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  documentCount: number;
  totalPageCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  documentCount,
  totalPageCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Library & Ingest', icon: <FileText className="w-4 h-4" /> },
    {
      id: 'search',
      label: 'ColPali Visual Search',
      icon: <Search className="w-4 h-4" />,
      badge: 'MaxSim',
    },
    { id: 'qa', label: 'Evidence QA', icon: <MessageSquareQuote className="w-4 h-4" /> },
    { id: 'tables', label: 'Tables & Charts', icon: <TableIcon className="w-4 h-4" /> },
    { id: 'compare', label: 'Document Compare', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'eval', label: 'ViDoRe Benchmark', icon: <BarChart3 className="w-4 h-4" />, badge: 'Lab' },
    {
      id: 'interview',
      label: 'Architecture & Interview Lab',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: 'Portfolio',
    },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Model Foundation */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  DocuMind <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  ColPali v1.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Multimodal Document Intelligence & ViT Late-Interaction Engine
              </p>
            </div>
          </div>

          {/* Quick Metrics & Links */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 font-mono text-xs bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                <strong className="text-white">{documentCount}</strong> Docs
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <strong className="text-white">{totalPageCount}</strong> Pages
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Indexed
              </span>
            </div>

            <a
              href="https://github.com/illuin-tech/colpali"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg transition-all"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">illuin-tech/colpali</span>
            </a>
          </div>
        </div>

        {/* Workspace Navigation Bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/50">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-cyan-500/30 text-cyan-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
