import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Film,
  Eye,
  Clock,
  TrendingUp,
  Play,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { projects, queueTasks, setActiveTab, setSelectedProject } = useStudioStore();

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 glass-panel p-4 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-950/20 via-slate-900/60 to-cyan-950/20">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Creator OS Control</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-lg font-bold text-white mt-0.5">Manga Studio AI Workspace</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            3 dự án đang hoạt động • 2 tác vụ queue tự động.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('ocr')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Tạo Video Mới (OCR)</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Xem Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-3 rounded-xl space-y-1 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Video Đã Xuất</span>
            <Film className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-lg font-bold text-white">48 Video</div>
          <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+12 tuần này</span>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl space-y-1 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Lượt Xem Dự Đoán</span>
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white">1.25M Views</div>
          <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+18.5% CTR</span>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl space-y-1 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Thời Gian Tiết Kiệm</span>
            <Clock className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="text-lg font-bold text-white">140 Giờ</div>
          <div className="text-[10px] text-slate-400">Nhanh gấp 10x</div>
        </div>

        <div className="glass-card p-3 rounded-xl space-y-1 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">AI Engine</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">ONLINE</div>
          <div className="text-[10px] text-slate-400">Gemini + ElevenLabs</div>
        </div>
      </div>

      {/* Active Progress Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-bold text-white">Tiến Độ: Solo Leveling Chap 178</span>
          </div>
          <span className="text-xs font-mono font-extrabold text-cyan-400">85%</span>
        </div>

        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-full w-[85%]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] pt-1">
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>1. Import Ảnh</span>
          </span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>2. OCR Panel</span>
          </span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>3. AI Script</span>
          </span>
          <span className="text-cyan-400 flex items-center space-x-1 animate-pulse">
            <AlertCircle className="w-3 h-3" />
            <span>4. Render Video</span>
          </span>
          <span className="text-slate-500 flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded-full border border-slate-700" />
            <span>5. Upload YouTube</span>
          </span>
        </div>
      </div>

      {/* Split: Projects & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              <span>Dự Án Gần Đây</span>
            </h2>
            <button onClick={() => setActiveTab('library')} className="text-[11px] text-cyan-400 hover:underline">
              Xem tất cả →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setActiveTab('timeline');
                }}
                className="glass-card rounded-lg overflow-hidden border border-slate-800 hover:border-violet-500/40 transition-all cursor-pointer group"
              >
                <div className="relative h-28 bg-slate-900">
                  <img src={project.coverUrl} alt={project.seriesName} className="w-full h-full object-cover" />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300">
                    Chap {project.chapterNumber}
                  </span>
                </div>
                <div className="p-2 space-y-0.5">
                  <h3 className="text-xs font-bold text-white truncate">{project.seriesName}</h3>
                  <p className="text-[10px] text-slate-400 truncate">{project.episodeTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hàng Đợi Auto</span>
          </h2>

          <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
            {queueTasks.map((task) => (
              <div key={task.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200 truncate">{task.seriesName}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">
                    {task.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{task.chapterTitle}</div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-cyan-400" style={{ width: `${task.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
