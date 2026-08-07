import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Volume2, Play, Sparkles, Check, ArrowRight, FolderOpen } from 'lucide-react';

export const VoiceView: React.FC = () => {
  const {
    voiceActors,
    assignedVoiceId,
    setAssignedVoiceId,
    isSynthesizingTTS,
    synthesizeVoiceAudio,
    setActiveTab,
    scriptData,
    playNarrationAudio,
  } = useStudioStore();

  if (!scriptData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <Volume2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Thoại Để Lồng Tiếng</h2>
          <p className="text-xs text-slate-400">
            Vui lòng dán link chapter truyện tại tab Thư Viện để nạp kịch bản thoại trước khi lồng tiếng TTS.
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
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Voice & Multi-Character TTS Studio</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Gán giọng đọc cho từng nhân vật bằng công nghệ giọng AI chân thực (ElevenLabs / Azure Speech).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={synthesizeVoiceAudio}
            disabled={isSynthesizingTTS}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-300 ${isSynthesizingTTS ? 'animate-spin' : ''}`} />
            <span>{isSynthesizingTTS ? 'Đang Tổng Hợp Âm Thanh...' : 'Tổng Hợp Voice TTS Toàn Bộ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Sang NLE Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Voice Actors Selection */}
        <div className="lg:col-span-6 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-2">
              Danh Sách Diễn Viên Lồng Tiếng AI
            </h3>

            <div className="space-y-2">
              {voiceActors.map((actor) => {
                const isSelected = assignedVoiceId === actor.id;

                return (
                  <div
                    key={actor.id}
                    onClick={() => setAssignedVoiceId(actor.id)}
                    className={`p-3 rounded-lg border flex items-center space-x-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={actor.avatarUrl} alt={actor.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{actor.name}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                          {actor.provider}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{actor.description}</p>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Audio Waveform Preview */}
        <div className="lg:col-span-6 space-y-3">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-2">
              Audio Waveform & Lắng Nghe Thử
            </h3>

            <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center space-x-1 px-4">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${20 + Math.sin(i * 0.5) * 40}%` }}
                  className="w-1 bg-gradient-to-t from-violet-600 to-cyan-400 rounded-full opacity-80"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-mono text-[10px]">Speech Synthesizer: vi-VN 48kHz • Active</span>
              <button
                onClick={() => {
                  const demoText = scriptData?.content?.slice(0, 180) || 'Chào mừng các bạn đến với Manga Studio AI! Hôm nay chúng ta cùng theo chân thợ săn Sung Jin-Woo bước vào hầm ngục kép sinh tử.';
                  playNarrationAudio(demoText);
                }}
                className="flex items-center space-x-1.5 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 font-semibold"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>🔊 Nghe Thử Giọng Đọc</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
