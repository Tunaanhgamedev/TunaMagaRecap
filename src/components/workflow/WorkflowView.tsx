import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { GitFork, Sparkles, Play, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export const WorkflowView: React.FC = () => {
  const { nodes, edges, isExecutingWorkflow, runWorkflow } = useStudioStore();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <span>Workflow Builder Engine (Trái Tim Hệ Thống)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quy trình tự động hóa khép kín: Import → OCR → AI Script → Voice TTS → Subtitles → Animation → Render → YouTube Upload.
          </p>
        </div>

        <button
          onClick={runWorkflow}
          disabled={isExecutingWorkflow}
          className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg neon-glow-violet transition-all active:scale-95 disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 text-cyan-300 ${isExecutingWorkflow ? 'animate-spin' : ''}`} />
          <span>{isExecutingWorkflow ? 'Đang Chạy Auto Pipeline...' : 'Kích Hoạt Quy Trình Auto'}</span>
        </button>
      </div>

      {/* Visual Node Diagram Canvas Flowchart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 overflow-x-auto min-h-[500px]">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
          <span className="font-bold text-white">Visual Node Graph Canvas</span>
          <span className="font-mono text-cyan-300">8 Connected Pipeline Nodes</span>
        </div>

        {/* Nodes Grid Canvas Simulation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {nodes.map((node, idx) => (
            <div
              key={node.id}
              className={`p-4 rounded-xl border transition-all space-y-3 relative ${
                node.status === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-500/50 text-white'
                  : node.status === 'running'
                  ? 'bg-violet-950/40 border-violet-500 shadow-lg neon-glow-violet animate-pulse'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-cyan-400">Step {idx + 1}</span>
                {node.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : node.status === 'running' ? (
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-slate-700" />
                )}
              </div>

              <div className="text-xs font-bold text-slate-100">{node.label}</div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-0.5">
                {Object.entries(node.config).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-slate-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
