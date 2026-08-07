import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ActiveTab } from '../../types/studio';
import {
  LayoutDashboard,
  FolderOpen,
  ScanText,
  Table,
  FileText,
  Languages,
  Mic,
  Subtitles,
  Film,
  Image,
  Globe,
  GitFork,
  Layers,
  Settings,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard OS', icon: LayoutDashboard },
  { id: 'library', label: 'Library & Series', icon: FolderOpen, badge: '3' },
  { id: 'ocr', label: 'OCR & Panel Split', icon: ScanText },
  { id: 'grid_editor', label: 'Excel Grid Editor', icon: Table, badge: 'Maga' },
  { id: 'translation', label: 'AI Multi-Translate', icon: Languages, badge: 'AI' },
  { id: 'script', label: 'AI Script Director', icon: FileText, badge: '8 Modes' },
  { id: 'voice', label: 'Voice TTS Studio', icon: Mic },
  { id: 'subtitle', label: 'Whisper Subtitle', icon: Subtitles },
  { id: 'timeline', label: 'NLE & CapCut Export', icon: Film, badge: 'CapCut' },
  { id: 'thumbnail', label: 'AI Thumbnail', icon: Image },
  { id: 'seo', label: 'YouTube SEO Coach', icon: Globe },
  { id: 'workflow', label: 'Workflow Engine', icon: GitFork, badge: 'Auto' },
  { id: 'queue', label: 'Batch Queue Runner', icon: Layers, badge: 'Active' },
  { id: 'settings', label: 'Plugin & API Keys', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useStudioStore();

  return (
    <aside className="w-52 border-r border-slate-800/80 bg-[#0b0d14]/95 flex flex-col justify-between select-none h-[calc(100vh-3rem)] sticky top-12">
      <div className="p-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-1.5 text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">
          Studio Navigation
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all group ${
                isActive
                  ? 'bg-violet-600/25 text-white border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-2">
        <div className="glass-panel rounded-lg p-2 border border-violet-500/20 bg-violet-950/20">
          <div className="flex items-center space-x-1.5 text-violet-300 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold">MagaRecap Integration</span>
          </div>
          <p className="text-[9.5px] text-slate-400 leading-snug">
            Excel grid edit + CapCut 1-click export + Batch Keyframes.
          </p>
        </div>
      </div>
    </aside>
  );
};
