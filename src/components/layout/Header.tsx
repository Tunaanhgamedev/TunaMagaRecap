import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Clapperboard,
  Search,
  Zap,
  Play,
  Settings,
  Bell,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { selectedProject, setActiveTab, runWorkflow, isExecutingWorkflow } = useStudioStore();

  return (
    <header className="h-12 border-b border-slate-800/80 bg-[#0b0d14]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Brand Logo & Active Project */}
      <div className="flex items-center space-x-4">
        <div
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-[#0b0d14] rounded-[6px] flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-sm tracking-tight gradient-text">Manga Studio AI</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono font-semibold border border-violet-500/30">
              PRO OS
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />

        {/* Selected Active Project Pill */}
        {selectedProject && (
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-md px-2.5 py-1">
            <img src={selectedProject.coverUrl} alt="Cover" className="w-4 h-4 rounded object-cover" />
            <div className="text-[11px] font-medium text-slate-300 truncate max-w-[220px]">
              <span className="font-bold text-white">{selectedProject.seriesName}</span> - Chap {selectedProject.chapterNumber}
            </div>
          </div>
        )}
      </div>

      {/* Global Search & Compact Actions */}
      <div className="flex items-center space-x-3">
        <div className="relative hidden lg:block w-52">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search series, prompt..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500/60"
          />
        </div>

        {/* Quick Workflow Run */}
        <button
          onClick={runWorkflow}
          disabled={isExecutingWorkflow}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-semibold px-3 py-1 rounded-md shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 text-cyan-300 ${isExecutingWorkflow ? 'animate-spin' : ''}`} />
          <span>{isExecutingWorkflow ? 'Running...' : 'Quick Workflow'}</span>
        </button>

        {/* Timeline Action */}
        <button
          onClick={() => setActiveTab('timeline')}
          className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors"
        >
          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
          <span className="hidden sm:inline">Timeline</span>
        </button>

        {/* Icons */}
        <div className="flex items-center space-x-1 text-slate-400">
          <div
            className="relative p-1.5 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            onClick={() => setActiveTab('queue')}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>

          <div
            className="p-1.5 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
};
