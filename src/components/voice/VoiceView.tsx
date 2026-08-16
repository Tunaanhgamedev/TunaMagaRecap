import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Volume2,
  Play,
  Square,
  Sparkles,
  Check,
  ArrowRight,
  ExternalLink,
  Mic,
  Sliders,
  Radio,
  Zap,
} from 'lucide-react';
import { voiceAudioEngine } from '../../utils/audioSynthesizer';

export const VoiceView: React.FC = () => {
  const {
    voiceActors,
    assignedVoiceId,
    setAssignedVoiceId,
    isSynthesizingTTS,
    synthesizeVoiceAudio,
    setActiveTab,
  } = useStudioStore();

  const [speechSpeed, setSpeechSpeed] = useState(1.15);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);
  const [customTestText, setCustomTestText] = useState(
    'Chào mừng các bạn đến với video recap chapter mới nhất! Hôm nay Sung Jinwoo sẽ chính thức thức tỉnh sức mạnh Chúa Tể Bóng Tối cấp SSS.'
  );

  const handleTestVoice = async (actorId: string, textToSpeak: string) => {
    if (isPlayingSample === actorId) {
      voiceAudioEngine.stop();
      setIsPlayingSample(null);
      return;
    }

    setIsPlayingSample(actorId);
    await voiceAudioEngine.speak(
      textToSpeak,
      actorId,
      speechSpeed,
      speechPitch,
      0.9,
      () => {
        setIsPlayingSample(null);
      }
    );
  };

  const vbeeServices = [
    {
      title: 'Edge Neural TTS (Đang Bật)',
      url: 'https://speech.platform.bing.com',
      desc: 'Giọng đọc AI tự nhiên 100% như MC review thật (Nam Minh & Hoài My). Hoàn toàn miễn phí, không giới hạn.',
      badge: 'Edge Neural Studio 48kHz',
      active: true,
    },
    {
      title: 'Vbee AI Studio Việt Nam',
      url: 'https://studio.vbee.vn/studio/text-to-speech',
      desc: 'Giọng đọc AI chuẩn tiếng Việt đa vùng miền (Mạnh Dũng, Thảo Trinh, Quỳnh Anh, Bá Hùng).',
      badge: 'studio.vbee.vn',
      active: false,
    },
    {
      title: 'ElevenLabs Multilingual',
      url: 'https://elevenlabs.io',
      desc: 'Công nghệ tái tạo cảm xúc điện ảnh Hollywood (Adam, Rachel).',
      badge: 'elevenlabs.io',
      active: false,
    },
  ];

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Voice & Multi-Character TTS Studio (Microsoft Edge Neural & Vbee AI)</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Lồng tiếng AI tự nhiên, hào hùng chuẩn review YouTube triệu view với bộ giọng Neural HD không bị giật cục hay méo tiếng.
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

      {/* Services Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {vbeeServices.map((service) => (
          <a
            key={service.title}
            href={service.url}
            target="_blank"
            rel="noreferrer"
            className={`p-3.5 rounded-xl border transition-all group block shadow-md ${
              service.active
                ? 'bg-gradient-to-br from-emerald-950/50 via-slate-950 to-cyan-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                : 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border-slate-800 hover:border-violet-500/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-violet-300 group-hover:text-cyan-300 transition-colors flex items-center space-x-1">
                {service.active ? (
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{service.title}</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <p className="text-[10.5px] text-slate-400 leading-snug">{service.desc}</p>
            <span
              className={`inline-block mt-2 text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                service.active
                  ? 'text-emerald-300 bg-emerald-950/80 border-emerald-700/60'
                  : 'text-cyan-400 bg-cyan-950/70 border-cyan-800/40'
              }`}
            >
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
                <span>Danh Sách Diễn Viên Lồng Tiếng AI (Neural Studio HD)</span>
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
                        ? 'bg-violet-950/40 border-violet-500/80 ring-1 ring-violet-500/40 shadow-lg shadow-violet-500/10'
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
                          <span
                            className={`text-[8.5px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                              actor.id.includes('Neural')
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 font-bold'
                                : 'bg-violet-600/30 text-violet-300 border-violet-500/30'
                            }`}
                          >
                            {actor.id.includes('Neural') ? 'EDGE NEURAL 48KHZ' : actor.provider.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-snug">{actor.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Audition Play/Stop Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestVoice(actor.id, customTestText);
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow flex items-center space-x-1 transition-all active:scale-95 cursor-pointer ${
                          isPlayingThis
                            ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                            : 'bg-cyan-600/80 hover:bg-cyan-500 text-white'
                        }`}
                      >
                        {isPlayingThis ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3" />}
                        <span>{isPlayingThis ? 'Dừng Lại' : 'Nghe Thử'}</span>
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

            {/* Animated Audio Waveform */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center space-x-1.5 h-24">
              {[12, 28, 45, 18, 35, 52, 24, 40, 16, 32, 48, 20, 36, 14, 26, 42].map((height, i) => (
                <div
                  key={i}
                  style={{
                    height: isPlayingSample ? `${Math.min(60, height * 1.5)}px` : `${Math.max(6, height * 0.4)}px`,
                  }}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isPlayingSample ? 'bg-gradient-to-t from-cyan-400 to-violet-500 animate-pulse' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Custom Test Text Input */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>Câu Thử Nghiệm Giọng Đọc</span>
                <span className="text-[10px] text-slate-400 font-mono">Tự động phiên âm chuẩn</span>
              </label>
              <textarea
                value={customTestText}
                onChange={(e) => setCustomTestText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none font-medium"
                placeholder="Nhập câu tiếng Việt để nghe thử cách phát âm..."
              />
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-1 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Tốc độ đọc (Speed Rate - Chuẩn YouTube: 1.15x)</span>
                  <span className="font-mono text-cyan-400 font-bold">{speechSpeed}x</span>
                </div>
                <input
                  type="range"
                  min={0.85}
                  max={1.4}
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
                  min={0.8}
                  max={1.2}
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
                onClick={() => handleTestVoice(assignedVoiceId, customTestText)}
                className={`w-full py-2 text-white text-xs font-bold rounded-lg shadow transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isPlayingSample === assignedVoiceId
                    ? 'bg-amber-600 hover:bg-amber-500 animate-pulse'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
                }`}
              >
                {isPlayingSample === assignedVoiceId ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng Đọc Thử Nghiệm</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Phát Âm Thử Nghiệm Giọng Đang Chọn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
