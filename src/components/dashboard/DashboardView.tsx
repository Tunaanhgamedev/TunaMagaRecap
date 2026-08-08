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
  CheckCircle2,
  Trash2,
  Edit3,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { projects, selectedProject, queueTasks, setActiveTab, setSelectedProject, deleteProject } = useStudioStore();

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
            Hệ thống tự động hóa làm video Recap Truyện Tranh 60 FPS chuẩn YouTube & TikTok.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('library')}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md transition-all active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tạo Project Mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Tổng Video Đã Tạo</span>
            <Film className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white">48 Video</div>
          <div className="text-[10px] text-emerald-400 font-semibold">+12 tuần này</div>
        </div>

        <div className="glass-card p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Ước Tính Views</span>
            <Eye className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white">1.25M Views</div>
          <div className="text-[10px] text-emerald-400 font-semibold">+18.5% CTR</div>
        </div>

        <div className="glass-card p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Thời Gian Tiết Kiệm</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white">140 Giờ</div>
          <div className="text-[10px] text-cyan-400 font-semibold">Nhanh gấp 10x</div>
        </div>

        <div className="glass-card p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Trạng Thái AI Engine</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">ONLINE</div>
          <div className="text-[10px] text-slate-400 font-mono">Gemini + ElevenLabs</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-white flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tiến Độ: {selectedProject ? `${selectedProject.seriesName} (Chapter ${selectedProject.chapterNumber})` : 'Chưa Chọn Dự Án'}</span>
          </span>
          <span className="font-mono text-cyan-400 font-bold">85%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" style={{ width: '85%' }} />
        </div>
        <div className="grid grid-cols-5 text-[10px] text-slate-400 pt-0.5 text-center font-semibold">
          <span className="text-emerald-400 flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>1. Import Ảnh</span>
          </span>
          <span className="text-emerald-400 flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>2. OCR Panel</span>
          </span>
          <span className="text-emerald-400 flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>3. AI Script</span>
          </span>
          <span className="text-cyan-400 flex items-center justify-center space-x-1 font-bold">
            <Clock className="w-3 h-3 animate-spin" />
            <span>4. Render Video</span>
          </span>
          <span className="opacity-50">5. Upload YouTube</span>
        </div>
      </div>

      {/* Main Grid: Projects & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              <span>Dự Án Gần Đây ({projects.length})</span>
            </h2>
            <button onClick={() => setActiveTab('library')} className="text-[11px] text-cyan-400 hover:underline">
              Xem tất cả →
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="glass-card p-8 text-center space-y-2 rounded-xl border border-slate-800">
              <Film className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-bold text-white">Chưa Có Dự Án Nào</div>
              <p className="text-[11px] text-slate-400">Vào tab Thư Viện dán link chapter truyện để cào tự động.</p>
              <button
                onClick={() => setActiveTab('library')}
                className="mt-2 inline-flex items-center space-x-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                <span>Nhập Chapter Ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setActiveTab('ocr');
                  }}
                  className="glass-card rounded-lg overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group relative"
                  title="Bấm để chỉnh sửa tiếp dự án này"
                >
                  <div className="relative h-28 bg-slate-900">
                    <img src={project.coverUrl} alt={project.seriesName} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300">
                      Chap {project.chapterNumber}
                    </span>

                    {/* Delete Project Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="absolute top-1.5 right-1.5 bg-red-950/90 hover:bg-red-600 text-red-300 hover:text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
                      title="Xóa dự án này khỏi hệ thống"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    {/* Continue Edit Badge */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1 text-cyan-300 font-bold text-xs pointer-events-none">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Tiếp</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <h3 className="text-xs font-bold text-white truncate">{project.seriesName}</h3>
                    <p className="text-[10px] text-slate-400 truncate">{project.episodeTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
