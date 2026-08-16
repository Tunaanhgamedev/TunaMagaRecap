import React, { useState, useEffect } from 'react';
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
  BookOpen,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Download,
  Upload,
  Layers,
} from 'lucide-react';
import { voiceAudioEngine } from '../../utils/audioSynthesizer';
import { PronunciationRule } from '../../types/studio';

export const VoiceView: React.FC = () => {
  const {
    voiceActors,
    assignedVoiceId,
    setAssignedVoiceId,
    isSynthesizingTTS,
    synthesizeVoiceAudio,
    setActiveTab,
    customPronunciationRules,
    selectedGenreDictionary,
    setSelectedGenreDictionary,
    addPronunciationRule,
    removePronunciationRule,
    autoExtractTermsWithAI,
    isExtractingTerms,
  } = useStudioStore();

  const [speechSpeed, setSpeechSpeed] = useState(1.15);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);
  const [customTestText, setCustomTestText] = useState(
    'Chào mừng các bạn đến với video recap chapter mới nhất! Hôm nay Sung Jinwoo sẽ chính thức thức tỉnh sức mạnh Chúa Tể Bóng Tối cấp SSS.'
  );

  // Dictionary Tab State
  const [dictTab, setDictTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [serverDictionaries, setServerDictionaries] = useState<Record<string, Array<{ term: string; reading: string }>>>({});
  const [isLoadingDict, setIsLoadingDict] = useState<boolean>(false);

  // New Rule Form State
  const [isAddingRule, setIsAddingRule] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<string>('');
  const [newReading, setNewReading] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'character' | 'skill' | 'realm' | 'system' | 'general'>('character');
  const [newNote, setNewNote] = useState<string>('');

  // Fetch Server Genre Dictionaries
  useEffect(() => {
    const fetchDictionary = async () => {
      setIsLoadingDict(true);
      try {
        const res = await fetch('/api/tts/dictionary');
        const data = await res.json();
        if (data.success && data.dictionaries) {
          setServerDictionaries(data.dictionaries);
        }
      } catch (err) {
        console.warn('[Dictionary Fetch Error]:', err);
      } finally {
        setIsLoadingDict(false);
      }
    };
    fetchDictionary();
  }, []);

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
      },
      {
        genre: selectedGenreDictionary !== 'all' ? selectedGenreDictionary : undefined,
        customDictionary: customPronunciationRules.map((r) => ({ term: r.term, reading: r.reading })),
      }
    );
  };

  const handleTestPronunciation = async (termText: string) => {
    const testSentence = `Nhân vật ${termText} vừa tung chiêu thức bộc phát sức mạnh.`;
    handleTestVoice(assignedVoiceId, testSentence);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newReading.trim()) return;

    addPronunciationRule({
      term: newTerm.trim(),
      reading: newReading.trim(),
      category: newCategory,
      genre: selectedGenreDictionary !== 'all' ? selectedGenreDictionary : 'general',
      note: newNote.trim() || 'Tùy chỉnh người dùng',
    });

    setNewTerm('');
    setNewReading('');
    setNewNote('');
    setIsAddingRule(false);
  };

  // Genre Tabs Definition
  const genreCategories = [
    { id: 'all', name: 'Tất Cả Thể Loại', icon: '✨' },
    { id: 'thosan', name: 'Thợ Săn / Hệ Thống', icon: '⚡' },
    { id: 'tutien', name: 'Tu Tiên / Tiên Hiệp', icon: '🐉' },
    { id: 'shonen', name: 'Manga Shonen / Isekai', icon: '⚔️' },
    { id: 'dothi', name: 'Đô Thị / Giang Hồ', icon: '🏙️' },
    { id: 'gaming', name: 'Esports / Game Thủ', icon: '🎮' },
    { id: 'custom', name: 'Tùy Chỉnh Của Bạn', icon: '⭐' },
  ];

  // Combine and Filter Terms
  const getDisplayTerms = () => {
    const list: Array<{ term: string; reading: string; source: 'custom' | 'builtin'; genre?: string; id?: string; category?: string; note?: string }> = [];

    // 1. Add user custom rules
    customPronunciationRules.forEach((r) => {
      list.push({
        id: r.id,
        term: r.term,
        reading: r.reading,
        source: 'custom',
        genre: r.genre || 'custom',
        category: r.category,
        note: r.note,
      });
    });

    // 2. Add server built-in dictionary
    if (dictTab === 'all') {
      Object.entries(serverDictionaries).forEach(([genreKey, items]) => {
        items.forEach((item) => {
          list.push({
            term: item.term,
            reading: item.reading,
            source: 'builtin',
            genre: genreKey,
          });
        });
      });
    } else if (dictTab !== 'custom' && serverDictionaries[dictTab]) {
      serverDictionaries[dictTab].forEach((item) => {
        list.push({
          term: item.term,
          reading: item.reading,
          source: 'builtin',
          genre: dictTab,
        });
      });
    }

    // Filter by tab and search
    return list.filter((item) => {
      if (dictTab === 'custom' && item.source !== 'custom') return false;
      if (dictTab !== 'all' && dictTab !== 'custom' && item.genre !== dictTab && item.source !== 'custom') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return item.term.toLowerCase().includes(q) || item.reading.toLowerCase().includes(q);
      }
      return true;
    });
  };

  const displayTerms = getDisplayTerms();

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
            <span>Voice TTS Studio & Đa Dạng Bộ Từ Điển Phiên Âm Truyện Tranh</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tự động chuyển đổi tên nhân vật & thuật ngữ ngoại lai (Hàn, Nhật, Trung, Gaming) sang phát âm tiếng Việt tự nhiên chuẩn xác 100%.
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

      {/* Main Workspace Split: Left Voice Selection + Right Controls */}
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

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
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
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center space-x-1.5 h-20">
              {[12, 28, 45, 18, 35, 52, 24, 40, 16, 32, 48, 20, 36, 14, 26, 42].map((height, i) => (
                <div
                  key={i}
                  style={{
                    height: isPlayingSample ? `${Math.min(50, height * 1.3)}px` : `${Math.max(4, height * 0.3)}px`,
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
                <span className="text-[10px] text-slate-400 font-mono">Tự động áp dụng từ điển</span>
              </label>
              <textarea
                value={customTestText}
                onChange={(e) => setCustomTestText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none font-medium"
                placeholder="Nhập câu tiếng Việt chứa tên nhân vật hoặc thuật ngữ để nghe thử..."
              />
            </div>

            {/* Sliders */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Tốc độ đọc (Chuẩn YouTube: 1.15x)</span>
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
            <div className="pt-1">
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

      {/* NEW: DYNAMIC PRONUNCIATION DICTIONARY MANAGER FOR ALL SERIES */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-violet-600/30 text-violet-400 border border-violet-500/40">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Từ Điển Phiên Âm Thuật Ngữ Đa Vũ Trụ (Manga / Manhwa / Manhua / Tu Tiên)</span>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {displayTerms.length} Quy Tắc Kích Hoạt
                </span>
              </h3>
              <p className="text-[10.5px] text-slate-400">
                Tự động chuẩn hóa phát âm cho mọi bộ truyện. Hỗ trợ hàng trăm tên tiếng Hàn, Nhật, Pinyin, và thuật ngữ game.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* AI Auto-Extract Button */}
            <button
              type="button"
              onClick={autoExtractTermsWithAI}
              disabled={isExtractingTerms}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isExtractingTerms ? 'animate-spin' : ''}`} />
              <span>{isExtractingTerms ? 'AI Đang Quét Kịch Bản...' : '⚡ AI Tự Động Quét Thuật Ngữ Kịch Bản'}</span>
            </button>

            {/* Add Custom Rule Button */}
            <button
              type="button"
              onClick={() => setIsAddingRule(!isAddingRule)}
              className="flex items-center space-x-1 bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thuật Ngữ Mới</span>
            </button>
          </div>
        </div>

        {/* Add New Rule Form */}
        {isAddingRule && (
          <form onSubmit={handleCreateRule} className="p-3.5 bg-slate-950 rounded-xl border border-violet-500/50 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-violet-300 flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thêm Quy Tắc Phiên Âm Riêng Cho Bộ Truyện Này</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Hủy
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300">Tên gốc trong truyện</label>
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Ví dụ: Cheon Yeo Woon, Zhuo Fan..."
                  className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300">Cách đọc phiên âm tiếng Việt</label>
                <input
                  type="text"
                  value={newReading}
                  onChange={(e) => setNewReading(e.target.value)}
                  placeholder="Ví dụ: Thiên Như Vân, Trác Phàm..."
                  className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 font-semibold text-emerald-300"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300">Phân loại</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="character">Nhân Vật (Character)</option>
                  <option value="skill">Chiêu Thức / Kỹ Năng (Skill)</option>
                  <option value="realm">Cảnh Giới / Cấp Bậc (Realm)</option>
                  <option value="system">Hệ Thống / Gaming (System)</option>
                  <option value="general">Thuật Ngữ Chung</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-300">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ví dụ: Nhân vật chính Ma Đạo..."
                  className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow"
              >
                Lưu Quy Tắc Vào Bộ Từ Điển
              </button>
            </div>
          </form>
        )}

        {/* Genre Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Genre Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            {genreCategories.map((cat) => {
              const isSelected = dictTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setDictTab(cat.id);
                    if (cat.id !== 'all' && cat.id !== 'custom') {
                      setSelectedGenreDictionary(cat.id);
                    } else {
                      setSelectedGenreDictionary('all');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center space-x-1 cursor-pointer ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                      : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tên / phiên âm..."
              className="w-full bg-slate-950 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Dictionary Table Grid */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 max-h-[320px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/80 sticky top-0 z-10 text-[11px] font-bold text-slate-300 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Tên Gốc Trong Truyện</th>
                <th className="py-2.5 px-3">Phiên Âm Tiếng Việt (TTS)</th>
                <th className="py-2.5 px-3">Thể Loại / Nguồn</th>
                <th className="py-2.5 px-3 text-right">Nghe Thử & Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayTerms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                    {searchTerm ? 'Không tìm thấy thuật ngữ nào phù hợp với từ khóa.' : 'Chưa có thuật ngữ tùy chỉnh nào. Bấm "Thêm Thuật Ngữ Mới" hoặc "AI Tự Động Quét" để thêm.'}
                  </td>
                </tr>
              ) : (
                displayTerms.map((item, idx) => (
                  <tr key={`${item.term}-${idx}`} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2 px-3 font-semibold text-white font-mono flex items-center space-x-1.5">
                      <span>{item.term}</span>
                    </td>
                    <td className="py-2 px-3 font-bold text-emerald-400">
                      {item.reading}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          item.source === 'custom'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-700/60 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.source === 'custom' ? '⭐ Tùy Chỉnh' : item.genre?.toUpperCase() || 'BUILT-IN'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Play Audition */}
                        <button
                          type="button"
                          onClick={() => handleTestPronunciation(item.reading)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Nghe phát âm thử"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button for custom rules */}
                        {item.source === 'custom' && item.id && (
                          <button
                            type="button"
                            onClick={() => removePronunciationRule(item.id!)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Xóa quy tắc này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
