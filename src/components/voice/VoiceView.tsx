import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Volume2,
  Play,
  Sparkles,
  Check,
  ArrowRight,
  FolderOpen,
  ExternalLink,
  Mic,
  Sliders,
  Radio,
  AudioWaveform,
  VolumeX,
} from 'lucide-react';

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
    stopNarrationAudio,
  } = useStudioStore();

  const [speechSpeed, setSpeechSpeed] = useState(1.05);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);

  const sampleTestText =
    'Chào mừng các bạn đến với video recap chapter mới nhất! Hôm nay nhân vật chính của chúng ta sẽ bước vào trận quyết chiến đỉnh cao.';

  const handleTestVoice = (actorId: string, sampleText: string) => {
    setIsPlayingSample(actorId);
    playNarrationAudio(sampleText);
    setTimeout(() => {
      setIsPlayingSample(null);
    }, 4500);
  };

  const vbeeServices = [
    {
      title: 'Vbee Text-To-Speech Studio',
      url: 'https://studio.vbee.vn/studio/text-to-speech',
      desc: 'Giọng đọc AI chuẩn tiếng Việt tự nhiên, đa vùng miền (Bắc, Trung, Nam).',
      badge: 'studio.vbee.vn/text-to-speech',
    },
    {
      title: 'Vbee AI Dubbing Studio',
      url: 'https://studio.vbee.vn/studio/dubbing',
      desc: 'Tự động dịch và lồng tiếng video đa ngôn ngữ với nhịp điệu khớp từng frame hình.',
      badge: 'studio.vbee.vn/dubbing',
    },
    {
      title: 'Vbee Voice Cloning & Voices',
      url: 'https://studio.vbee.vn/studio/voice-cloning/voices',
      desc: 'Nhân bản giọng đọc thần tượng / diễn viên độc quyền theo file audio mẫu 5 giây.',
      badge: 'studio.vbee.vn/voice-cloning',
    },
  ];

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Voice & Multi-Character TTS Studio (Tích Hợp Vbee AI & Azure)</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Lồng tiếng AI tự nhiên cho từng nhân vật với các giọng đọc đình đám từ Vbee Studio (Mạnh Dũng, Thảo Trinh, Quỳnh Anh, Bá Hùng).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={synthesizeVoiceAudio}
            disabled={isSynthesizingTTS}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-300 ${isSynthesizingTTS ? 'animate-spin' : ''}`} />
            <span>{isSynthesizingTTS ? 'Đang Tổng Hợp Âm Thanh...' : 'Tổng Hợp Voice TTS Toàn Bộ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Sang NLE Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Vbee Official Studio Services Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {vbeeServices.map((service) => (
          <a
            key={service.url}
            href={service.url}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 rounded-xl border border-slate-800 hover:border-violet-500/60 transition-all group block shadow-md"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-violet-300 group-hover:text-cyan-300 transition-colors flex items-center space-x-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>{service.title}</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <p className="text-[10.5px] text-slate-400 leading-snug">{service.desc}</p>
            <span className="inline-block mt-2 text-[9px] font-mono text-cyan-400 bg-cyan-950/70 px-1.5 py-0.2 rounded border border-cyan-800/40">
              {service.badge}
            </span>
          </a>
        ))}
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Voice Actors Selection Grid */}
        <div className="lg:col-span-7 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Danh Sách Diễn Viên Lồng Tiếng AI (Vbee / Azure / ElevenLabs)</span>
              </h3>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                {voiceActors.length} Giọng Đọc Sẵn Sàng
              </span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {voiceActors.map((actor) => {
                const isSelected = assignedVoiceId === actor.id;
                const isPlayingThis = isPlayingSample === actor.id;

                return (
                  <div
                    key={actor.id}
                    onClick={() => setAssignedVoiceId(actor.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-violet-950/40 border-violet-500/80 ring-1 ring-violet-500/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={actor.avatarUrl}
                        alt={actor.name}
                        className="w-10 h-10 rounded-full object-cover border border-violet-500/40 shrink-0"
                      />

                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white">{actor.name}</h4>
                          <span className="text-[8.5px] font-mono uppercase px-1.5 py-0.2 rounded bg-violet-600/30 text-violet-300 border border-violet-500/30">
                            {actor.provider.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-snug">{actor.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Audition Play Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestVoice(actor.id, sampleTestText);
                        }}
                        className="bg-cyan-600/80 hover:bg-cyan-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className={`w-3 h-3 ${isPlayingThis ? 'text-yellow-300 animate-pulse' : ''}`} />
                        <span>{isPlayingThis ? 'Đang đọc...' : 'Nghe Thử'}</span>
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] shadow">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Audio Waveform & Speech Tuning */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>Tinh Chỉnh Tốc Độ & Cao Độ Giọng Đọc</span>
            </h3>

            {/* Simulated Animated Audio Waveform */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center space-x-1.5 h-28">
              {[12, 28, 45, 18, 35, 52, 24, 40, 16, 32, 48, 20, 36, 14, 26, 42].map((height, i) => (
                <div
                  key={i}
                  style={{ height: isPlayingSample ? `${height * 1.4}px` : `${height}px` }}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isPlayingSample ? 'bg-gradient-to-t from-cyan-400 to-violet-500 animate-pulse' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Tốc độ đọc (Speed Rate)</span>
                  <span className="font-mono text-cyan-400 font-bold">{speechSpeed}x</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={1.5}
                  step={0.05}
                  value={speechSpeed}
                  onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Cao độ biểu cảm (Pitch)</span>
                  <span className="font-mono text-violet-400 font-bold">{speechPitch}x</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.3}
                  step={0.05}
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-violet-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Quick Test Bar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleTestVoice(assignedVoiceId, sampleTestText)}
                className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Phát Âm Thử Nghiệm Ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
