import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Layers, Play, Pause, CheckCircle, RefreshCw, Terminal, Clock, ShieldCheck } from 'lucide-react';

export const QueueView: React.FC = () => {
  const { queueTasks, isQueueRunning, runBatchQueue } = useStudioStore();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-violet-400" />
            <span>Overnight Batch Queue Runner (BullMQ Worker)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hàng đợi chạy tự động cho 100+ Chapter qua đêm: Tự động OCR, tạo kịch bản, lồng tiếng & xuất video.
          </p>
        </div>

        <button
          onClick={runBatchQueue}
          disabled={isQueueRunning}
          className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 text-cyan-300 ${isQueueRunning ? 'animate-bounce' : ''}`} />
          <span>{isQueueRunning ? 'Đang Chạy Queue Qua Đêm...' : 'Kích Hoạt Chạy Qua Đêm'}</span>
        </button>
      </div>

      {/* Task Queue List */}
      <div className="space-y-4">
        {queueTasks.map((task) => (
          <div key={task.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{task.seriesName}</span>
                  <span className="text-xs text-cyan-300 font-mono font-semibold">• {task.chapterTitle}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Bắt đầu lúc: {task.startedAt}</div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    task.status === 'processing'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : task.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {task.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{task.currentStep}</span>
                <span className="text-cyan-400 font-bold">{task.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* Terminal Live Logs */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] space-y-1 text-slate-400 max-h-28 overflow-y-auto">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold mb-1">
                <Terminal className="w-3 h-3" />
                <span>Execution Logs Inspector:</span>
              </div>
              {task.logs.map((log, idx) => (
                <div key={idx} className="text-slate-300">{log}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
