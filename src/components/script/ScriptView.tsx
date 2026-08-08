import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ScriptMode } from '../../types/studio';
import {
  FileText,
  Sparkles,
  Wand2,
  BookOpen,
  Volume2,
  ArrowRight,
  Smile,
  Flame,
  Heart,
  BookMarked,
  Video,
  Zap,
  FolderOpen,
} from 'lucide-react';

interface ModeOption {
  id: ScriptMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MODES: ModeOption[] = [
  { id: 'review', label: 'Review Chi Tiết', desc: '1500w phỏng vấn sâu', icon: Flame, color: 'text-pink-400' },
  { id: 'summary', label: 'Tóm Tắt Nhanh', desc: '300w cho Shorts', icon: Zap, color: 'text-amber-400' },
  { id: 'funny', label: 'Hài Hước Meme', desc: 'Meme & tiếng cười', icon: Smile, color: 'text-yellow-400' },
  { id: 'horror', label: 'Kinh Dị Phủ Đầu', desc: 'U uất, hồi hộp', icon: Flame, color: 'text-red-400' },
  { id: 'emotional', label: 'Cảm Xúc Lắng Đọng', desc: 'Tình cảm gia đình', icon: Heart, color: 'text-rose-400' },
  { id: 'storytelling', label: 'Audiobook', desc: 'Giọng đọc audiobook', icon: BookMarked, color: 'text-violet-400' },
  { id: 'rewrite', label: 'AI Rewrite', desc: 'Rewrite mượt mà', icon: Wand2, color: 'text-cyan-400' },
  { id: 'yt_friendly', label: 'YouTube Retention', desc: 'Hook 5s đầu', icon: Video, color: 'text-red-500' },
];

export const ScriptView: React.FC = () => {
  const {
    scriptData,
    setScriptMode,
    generateAIScript,
    updateScriptContent,
    setActiveTab,
    selectedProject,
    customScriptPrompt,
    setCustomScriptPrompt,
  } = useStudioStore();

  const promptPresets = [
    {
      title: '🎯 Hook Triệu View (5s Đầu)',
      prompt: 'Viết kịch bản giật gân, mở đầu với câu hook gây tò mò cao trào trong 5s đầu, phân vai lời thoại kịch tính và kêu gọi đăng ký kênh.',
    },
    {
      title: '🎭 Phân Vai Đa Nhân Vật',
      prompt: 'Phân tách rõ ràng giữa giọng [Dẫn Chuyện] và các nhân vật chính/phụ, thể hiện rõ cảm xúc giận dữ, bất ngờ, tự tin.',
    },
    {
      title: '⚡ TikTok / Shorts 60s Siêu Nhanh',
      prompt: 'Viết kịch bản ngắn gọn dồn dập, nhịp nhanh 60 giây, tập trung vào đòn đánh quyết định và cú twist bất ngờ.',
    },
    {
      title: '😂 Hài Hước & Bắt Trend GenZ',
      prompt: 'Kịch bản theo phong cách review hài hước, dí dỏm, châm biếm nhẹ nhàng, chèn thuật ngữ vui nhộn và meme.',
    },
  ];

  if (!scriptData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Kịch Bản Review</h2>
          <p className="text-xs text-slate-400">
            Hệ thống không sinh dữ liệu giả ngẫu nhiên. Vui lòng dán link chapter truyện tại tab Thư Viện để nạp truyện và sinh kịch bản chuẩn xác theo nội dung chapter.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Mở Thư Viện & Dán Link Truyện</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <span>AI Director Script Studio ({selectedProject?.seriesName} - Chap {selectedProject?.chapterNumber})</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Huấn luyện AI kịch bản dựa trên toàn bộ dữ liệu thoại OCR thực tế kết hợp với Custom Prompt Tuning.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => generateAIScript(scriptData.mode)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Sinh Kịch Bản Ngay ({scriptData.mode})</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Studio Voice TTS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Prompt Training Box */}
      <div className="glass-panel p-3.5 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-slate-900/60 to-cyan-950/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>🧠 Huấn Luyện AI Viết Kịch Bản (Custom Prompt Tuning)</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Dữ liệu OCR: Tự động nạp toàn bộ thoại từ các trang truyện
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {promptPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCustomScriptPrompt(p.prompt);
                generateAIScript(scriptData.mode);
              }}
              className="text-[10.5px] bg-slate-950/80 hover:bg-violet-900/40 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 hover:border-violet-500/50 transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>{p.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customScriptPrompt}
            onChange={(e) => setCustomScriptPrompt(e.target.value)}
            placeholder="Nhập yêu cầu huấn luyện AI (VD: Viết phong cách giật gân, nhiều câu cảm thán, phân vai rõ rệt)..."
            className="flex-1 bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="button"
            onClick={() => generateAIScript(scriptData.mode)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Áp Dụng & Sinh Kịch Bản</span>
          </button>
        </div>
      </div>

      {/* 8 AI Script Mode Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = scriptData.mode === m.id;

          return (
            <button
              key={m.id}
              onClick={() => {
                setScriptMode(m.id);
                generateAIScript(m.id);
              }}
              className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-violet-600/30 border-violet-500/60 shadow-sm text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <div className="mt-1">
                <div className="text-[11px] font-bold truncate">{m.label}</div>
                <div className="text-[9px] text-slate-400 truncate">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-2">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <input
                type="text"
                value={scriptData.title}
                onChange={(e) =>
                  useStudioStore.setState((s) => ({
                    scriptData: s.scriptData ? { ...s.scriptData, title: e.target.value } : null,
                  }))
                }
                className="bg-transparent text-xs font-bold text-white w-full focus:outline-none focus:border-cyan-500 border-b border-transparent"
              />
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono whitespace-nowrap pl-3">
                <span>{scriptData.wordCount} Từ</span>
                <span>•</span>
                <span>~{scriptData.estReadTimeMinutes} Phút</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[9.5px] font-mono text-cyan-400 font-bold px-1.5">AI Tools:</span>
              <button
                onClick={() =>
                  updateScriptContent(
                    scriptData.content + '\n\n[AI BỔ SUNG]: Đừng quên Subscribe kênh và bấm chuông thông báo!'
                  )
                }
                className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
              >
                + CTA Subscribe
              </button>
              <button
                onClick={() =>
                  updateScriptContent(
                    scriptData.content + '\n\n[AI GỢI Ý NHẠC BẰNG BASS]: Trận đánh bùng nổ đỉnh điểm!'
                  )
                }
                className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
              >
                + Nhịp Drama
              </button>
              <button
                onClick={() => generateAIScript(scriptData.mode)}
                className="text-[10px] bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30 hover:bg-violet-600/50"
              >
                <Wand2 className="w-2.5 h-2.5 inline mr-1" />
                Rewrite
              </button>
            </div>

            <textarea
              value={scriptData.content}
              onChange={(e) => updateScriptContent(e.target.value)}
              rows={14}
              className="w-full bg-slate-950/90 text-slate-100 p-3 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed focus:outline-none focus:border-violet-500/60"
              placeholder="Nhập hoặc để AI sinh kịch bản tại đây..."
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white border-b border-slate-800 pb-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thẻ Nhân Vật & Bối Cảnh ({selectedProject?.seriesName})</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="glass-card p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                <span className="font-bold text-violet-300">{selectedProject?.seriesName}</span>
                <p className="text-[10.5px] text-slate-400">
                  Dữ liệu được trích xuất trực tiếp từ Chapter {selectedProject?.chapterNumber}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
