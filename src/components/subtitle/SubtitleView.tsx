import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Subtitles,
  Sparkles,
  Download,
  Upload,
  Palette,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const SubtitleView: React.FC = () => {
  const {
    subtitles,
    subtitleStyle,
    setSubtitleStyle,
    generateSubtitlesFromAudio,
    updateSubtitleText,
    setActiveTab,
  } = useStudioStore();

  const handleExportSRT = () => {
    let srt = '';
    subtitles.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const date = new Date(sec * 1000);
        return date.toISOString().substr(11, 12).replace('.', ',');
      };
      srt += `${idx + 1}\n${formatTime(s.startTime)} --> ${formatTime(s.endTime)}\n${s.text}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MangaStudioAI_Subtitles.srt';
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Subtitles className="w-5 h-5 text-violet-400" />
            <span>Whisper Auto-Subtitle & Style Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tự động tạo phụ đề chính xác từng mili-giây (SRT / ASS) với hiệu ứng Karaoke & TikTok Captions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={generateSubtitlesFromAudio}
            className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Chạy Whisper Auto-Sync Sub</span>
          </button>

          <button
            onClick={handleExportSRT}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Xuất File .SRT</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
          >
            <span>Mở Video Timeline Dựng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtitle Style Presets */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Phong Cách Phụ Đề Captions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'tiktok_yellow', label: 'TikTok Yellow Glow', previewClass: 'bg-yellow-400 text-black font-extrabold px-2 py-0.5 rounded shadow-lg' },
            { id: 'anime_glowing', label: 'Anime Neon Pink', previewClass: 'bg-pink-600 text-white font-extrabold px-2 py-0.5 rounded shadow-lg neon-glow-violet' },
            { id: 'bold_impact', label: 'Bold Impact White', previewClass: 'bg-white text-slate-950 font-black px-2 py-0.5 rounded shadow-lg' },
            { id: 'standard', label: 'Standard Subtitle', previewClass: 'bg-slate-900 text-white px-2 py-0.5 rounded border border-slate-700' },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setSubtitleStyle(style.id as any)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                subtitleStyle === style.id
                  ? 'bg-violet-950/40 border-violet-500/60 ring-1 ring-violet-500/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-slate-200">{style.label}</span>
              <div className="mt-2 text-center">
                <span className={style.previewClass}>SUBTITLE</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subtitle Editor Items List */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white">Danh Sách Câu Phụ Đề ({subtitles.length} dòng)</span>
          <span className="text-[10px] font-mono text-cyan-400">Whisper AI Precision: 99.4%</span>
        </div>

        <div className="space-y-3">
          {subtitles.map((sub, idx) => (
            <div key={sub.id} className="glass-card p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 font-mono text-xs text-slate-400 min-w-[160px]">
                <span className="font-bold text-cyan-400">#{idx + 1}</span>
                <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <Clock className="w-3 h-3 text-violet-400" />
                  <span>{sub.startTime}s - {sub.endTime}s</span>
                </div>
              </div>

              <input
                type="text"
                value={sub.text}
                onChange={(e) => updateSubtitleText(sub.id, e.target.value)}
                className="flex-1 bg-slate-950 text-slate-100 px-3 py-1.5 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-cyan-500"
              />

              <div className="text-right">
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-600/30 text-violet-300 border border-violet-500/30">
                  {sub.speaker}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
