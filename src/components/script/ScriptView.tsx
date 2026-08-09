import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ScriptMode, MangaGenre } from '../../types/studio';
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
  Copy,
  Check,
  Sword,
  Radio,
  Share2,
  Sliders,
  Compass,
  User,
  Shield,
} from 'lucide-react';

interface ModeOption {
  id: ScriptMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MODES: ModeOption[] = [
  { id: 'review', label: 'Review Chi Tiết', desc: '1500w phân tích sâu', icon: Flame, color: 'text-pink-400' },
  { id: 'yt_friendly', label: 'YouTube Retention', desc: 'Hook 5s giữ chân cao', icon: Video, color: 'text-red-500' },
  { id: 'summary', label: 'Tóm Tắt Nhanh', desc: 'Nhịp nhanh 60s Shorts', icon: Zap, color: 'text-amber-400' },
  { id: 'funny', label: 'Hài Hước Meme', desc: 'Meme & bắt trend GenZ', icon: Smile, color: 'text-yellow-400' },
  { id: 'horror', label: 'Kinh Dị & Kịch Tính', desc: 'Dồn dập, nghẹt thở', icon: Flame, color: 'text-red-400' },
  { id: 'emotional', label: 'Cảm Xúc Lắng Đọng', desc: 'Chiều sâu nhân vật', icon: Heart, color: 'text-rose-400' },
  { id: 'storytelling', label: 'Audiobook Manga', desc: 'Giọng đọc truyền cảm', icon: BookMarked, color: 'text-violet-400' },
  { id: 'rewrite', label: 'AI Rewrite Pro', desc: 'Văn phong sắc bén', icon: Wand2, color: 'text-cyan-400' },
];

interface GenreOption {
  id: MangaGenre;
  label: string;
  icon: string;
}

const GENRES: GenreOption[] = [
  { id: 'hunter_system', label: 'Thợ Săn / Hệ Thống', icon: '🗡️' },
  { id: 'cultivation_wuxia', label: 'Tu Tiên / Huyền Huyễn', icon: '🐉' },
  { id: 'isekai_fantasy', label: 'Isekai / Chuyển Sinh', icon: '🌀' },
  { id: 'regression_revenge', label: 'Trùng Sinh / Báo Thù', icon: '⏳' },
  { id: 'school_urban', label: 'Học Đường / Đô Thị', icon: '🏫' },
  { id: 'horror_survival', label: 'Kinh Dị / Sinh Tồn', icon: '👻' },
  { id: 'romance_drama', label: 'Ngôn Tình / Drama', icon: '👑' },
  { id: 'mystery_mindgame', label: 'Trinh Thám / Đấu Trí', icon: '🕵️' },
  { id: 'general_shonen', label: 'Shonen / Phiêu Lưu', icon: '⚡' },
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
    mangaGenre,
    setMangaGenre,
    protagonistName,
    setProtagonistName,
    playNarrationAudio,
    stopNarrationAudio,
    pages,
  } = useStudioStore();

  const [copied, setCopied] = useState(false);
  const [isPlayingScript, setIsPlayingScript] = useState(false);

  const promptPresets = [
    {
      title: '🎯 Hook Triệu View (5s Đầu)',
      prompt: 'Viết kịch bản giật gân, mở đầu với câu hook gây tò mò cao trào trong 5s đầu, phân vai lời thoại kịch tính và kêu gọi đăng ký kênh.',
    },
    {
      title: '⚔️ Phân Tích Sức Mạnh & Chiến Thuật',
      prompt: 'Tập trung phân tích hệ thống sức mạnh, cấp bậc kỹ năng, chiến thuật từng pha combat và diễn biến tâm lý nhân vật.',
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

  const handleCopyScript = () => {
    if (!scriptData?.content) return;
    navigator.clipboard.writeText(scriptData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoiceAudio = () => {
    if (isPlayingScript) {
      stopNarrationAudio();
      setIsPlayingScript(false);
    } else {
      const sampleText = scriptData?.content?.slice(0, 200) || 'Chào mừng các bạn đến với video review truyện!';
      playNarrationAudio(sampleText);
      setIsPlayingScript(true);
      setTimeout(() => setIsPlayingScript(false), 12000);
    }
  };

  const appendScriptSection = (textToAppend: string) => {
    if (!scriptData) return;
    updateScriptContent(`${scriptData.content}\n\n${textToAppend}`);
  };

  if (!scriptData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Kịch Bản Review</h2>
          <p className="text-xs text-slate-400">
            Hệ thống huấn luyện AI viết kịch bản đa thể loại (Hệ Thống, Tu Tiên, Isekai, Trùng Sinh, Đô Thị...). Bấm nút dưới đây để tạo ngay kịch bản hoặc nạp chapter mới từ Thư Viện.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => generateAIScript('yt_friendly')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Sinh Kịch Bản Mẫu Ngay</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Thư Viện Truyện</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sName = selectedProject?.seriesName || 'Bộ Truyện Tuyệt Đỉnh';
  const cNum = selectedProject?.chapterNumber || 1;

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <span className="gradient-text">Universal AI Script Director ({sName} - Chap {cNum})</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Trình đạo diễn & tạo kịch bản tóm tắt đa thể loại: Tự động điều chỉnh văn phong theo từng dòng truyện (Tu Tiên, Isekai, Thợ Săn, Trùng Sinh, Học Đường...).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleVoiceAudio}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
              isPlayingScript
                ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isPlayingScript ? 'Đang Đọc Thử...' : 'Nghe Thử Giọng Đọc'}</span>
          </button>

          <button
            onClick={() => generateAIScript(scriptData.mode)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Tạo Lại Kịch Bản ({scriptData.mode})</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Sang Lồng Tiếng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 9 Universal Manga Genre Selector */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2 bg-slate-950/90">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Chọn Thể Loại Truyện (AI Tự Động Thích Ứng Văn Phong & Hình Ảnh):</span>
          </span>
          <div className="flex items-center space-x-2">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="text"
              value={protagonistName}
              onChange={(e) => setProtagonistName(e.target.value)}
              placeholder="Tên nhân vật chính (tùy chọn)..."
              className="bg-slate-900 text-slate-100 text-[11px] px-2.5 py-1 rounded border border-slate-800 focus:outline-none focus:border-cyan-400 font-mono w-48"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => {
            const isSelected = mangaGenre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setMangaGenre(g.id);
                  generateAIScript(scriptData.mode);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            );
          })}
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
            Dữ liệu OCR: Tự động tổng hợp thoại từ {pages.length || 2} trang truyện
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
            placeholder="Nhập phong cách viết kịch bản (VD: Giọng hào hứng, tập trung vào pha thức tỉnh sức mạnh ở cao trào)..."
            className="flex-1 bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="button"
            onClick={() => generateAIScript(scriptData.mode)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Áp Dụng Huấn Luyện</span>
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
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-violet-600/30 border-violet-500/60 shadow-sm text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <div className="mt-1.5">
                <div className="text-[11px] font-bold truncate">{m.label}</div>
                <div className="text-[9px] text-slate-400 truncate">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Script Editor & AI Enhancer Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Script Editor with 1-Click Tools */}
        <div className="lg:col-span-8 space-y-3">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            {/* Title & Word Count Bar */}
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
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-200">
                  {scriptData.wordCount} Từ
                </span>
                <span>•</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                  ~{scriptData.estReadTimeMinutes} Phút Đọc
                </span>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 transition-colors cursor-pointer"
                  title="Copy toàn bộ kịch bản"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Đã chép!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick Content Enhancer Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-cyan-400 font-bold px-1 flex items-center space-x-1">
                <Sliders className="w-3 h-3" />
                <span>Thêm Phân Đoạn Nhanh:</span>
              </span>

              <button
                type="button"
                onClick={() =>
                  appendScriptSection(
                    '## 🎯 HOOK GIỮ CHÂN 5S ĐẦU:\n**[Dẫn Chuyện]**: "Khoan đã! Bạn có tin chỉ trong một khoảnh khắc ngắn ngủi, toàn bộ thế trận đã bị đảo ngược hoàn toàn không? Hãy xem hết video để biết lý do tại sao!"'
                  )
                }
                className="text-[10px] bg-slate-900 hover:bg-violet-900/40 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-800 hover:border-violet-500/40 cursor-pointer flex items-center space-x-1"
              >
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                <span>+ Hook Giật Gân</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  appendScriptSection(
                    '## ⚔️ PHÂN TÍCH SỨC MẠNH & CHIẾN THUẬT:\n**[Dẫn Chuyện]**: "Chiêu thức vừa rồi không chỉ đơn thuần là đòn tấn công vật lý, mà nó là sự kết hợp hoàn hảo giữa năng lượng bộc phát và tốc độ vượt qua giới hạn âm thanh!"'
                  )
                }
                className="text-[10px] bg-slate-900 hover:bg-cyan-900/40 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center space-x-1"
              >
                <Sword className="w-2.5 h-2.5 text-cyan-400" />
                <span>+ Phân Tích Combat</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  appendScriptSection(
                    '## 🎭 ĐOẠN ĐỐI THOẠI KỊCH TÍNH:\n**[Nhân Vật Chính]**: "Ngươi nghĩ mình có thể thoát khỏi đây sau những gì đã gây ra sao?"\n**[Kẻ Địch]**: "Đừng có đắc ý quá sớm! Trận chiến thực sự chỉ mới bắt đầu thôi!"'
                  )
                }
                className="text-[10px] bg-slate-900 hover:bg-pink-900/40 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-800 hover:border-pink-500/40 cursor-pointer flex items-center space-x-1"
              >
                <Radio className="w-2.5 h-2.5 text-pink-400" />
                <span>+ Đối Thoại Nhân Vật</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  appendScriptSection(
                    '## 🔔 KÊU GỌI ĐĂNG KÝ & THẢO LUẬN:\n**[Dẫn Chuyện]**: "Nếu bạn thấy video recap này hấp dẫn, đừng quên bấm Like, Đăng ký kênh và để lại bình luận xem ai sẽ là người chiến thắng trong tập tiếp theo nhé!"'
                  )
                }
                className="text-[10px] bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-800 hover:border-emerald-500/40 cursor-pointer flex items-center space-x-1"
              >
                <Share2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>+ CTA Subscribe</span>
              </button>
            </div>

            {/* Script Text Area */}
            <textarea
              value={scriptData.content}
              onChange={(e) => updateScriptContent(e.target.value)}
              rows={16}
              className="w-full bg-slate-950/90 text-slate-100 p-3.5 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed focus:outline-none focus:border-violet-500/60 shadow-inner"
              placeholder="Nhập hoặc để AI sinh kịch bản tại đây..."
            />
          </div>
        </div>

        {/* Right Column: Character Cards, Dialogue Context & Navigation */}
        <div className="lg:col-span-4 space-y-3">
          {/* Character & Lore Card */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white border-b border-slate-800 pb-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ngữ Cảnh & Dữ Liệu Truyện</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="glass-card p-2.5 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-violet-300">{sName}</span>
                <p className="text-[10.5px] text-slate-400">
                  Chapter {cNum} • Thể loại: <span className="text-amber-300 font-semibold">{mangaGenre}</span>
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9.5px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                    Chế Độ: {scriptData.mode.toUpperCase()}
                  </span>
                  <span className="text-[9.5px] bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/40">
                    Sẵn Sàng Voice TTS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions to Next Stages */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-white border-b border-slate-800 pb-1.5">
              Bước Tiếp Theo Trong Quy Trình:
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('voice')}
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>🎙️ Chuyển Sang Lồng Tiếng AI Voice</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>🔥 Tối Ưu Tiêu Đề & SEO YouTube</span>
                <ArrowRight className="w-3 h-3 text-red-400" />
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>🎬 Dựng Video 60 FPS & Xuất CapCut</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
