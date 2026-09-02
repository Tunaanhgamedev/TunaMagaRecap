import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Globe2, Sparkles, Copy, Check, ArrowRight, FolderOpen } from 'lucide-react';

const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
];

export const TranslationView: React.FC = () => {
  const {
    scriptData,
    setActiveTab,
    updateScriptContent,
    geminiApiKey,
    translateAllDialogues,
    targetLanguage,
    setTargetLanguage,
  } = useStudioStore();
  const [sourceLang, setSourceLang] = useState('vi');
  const [targetLang, setTargetLang] = useState(targetLanguage || 'en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!scriptData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <Globe2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Kịch Bản Để Dịch</h2>
          <p className="text-xs text-slate-400">
            Vui lòng dán link chapter truyện tại tab Thư Viện để nạp thoại và dịch đa ngôn ngữ toàn cầu.
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

  const handleTranslate = async () => {
    if (!scriptData || !scriptData.content) return;
    setIsTranslating(true);
    setApplied(false);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptData.content,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang,
          apiKey: geminiApiKey,
        }),
      });
      const data = await res.json();
      if (data.success && data.translatedText) {
        setTranslatedText(data.translatedText);
      } else {
        setTranslatedText(`❌ Lỗi dịch thuật: ${data.error || 'Không thể dịch kịch bản.'}`);
      }
    } catch (err: any) {
      setTranslatedText(`❌ Lỗi kết nối máy chủ dịch: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApplyToScript = async () => {
    if (!translatedText || translatedText.startsWith('❌')) return;
    setIsApplying(true);
    try {
      // 1. Update global script content
      updateScriptContent(translatedText);
      // 2. Set target language in store & sync dialogues
      setTargetLanguage(targetLang as any);
      await translateAllDialogues(targetLang as any);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>AI Multi-Language Studio Translator</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dịch kịch bản và thoại sang 8 ngôn ngữ để phát hành video toàn cầu (Global YouTube Reach).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-300 ${isTranslating ? 'animate-spin' : ''}`} />
            <span>{isTranslating ? 'Đang Dịch AI...' : 'Dịch Kịch Bản Ngay'}</span>
          </button>

          {translatedText && !translatedText.startsWith('❌') && (
            <button
              onClick={handleApplyToScript}
              disabled={isApplying}
              className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Cập nhật văn bản dịch vào kịch bản chính & thoại của chapter"
            >
              {applied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{applied ? '✓ Đã Áp Dụng Kịch Bản' : 'Áp Dụng Vào Kịch Bản'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('voice')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Sang Studio Lồng Tiếng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Text */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <span>🇻🇳</span>
              <span>Ngôn Ngữ Gốc: Tiếng Việt</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{scriptData.wordCount} Từ</span>
          </div>

          <textarea
            readOnly
            value={scriptData.content}
            rows={12}
            className="w-full bg-slate-950/80 text-slate-300 p-3 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed focus:outline-none"
          />
        </div>

        {/* Target Text */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as any)}
                className="bg-slate-900 text-xs font-bold text-cyan-300 border border-slate-800 rounded px-2 py-1 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCopy}
              className="text-[10px] flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-800"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Đã Copy' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            value={translatedText}
            onChange={(e) => setTranslatedText(e.target.value)}
            rows={12}
            className="w-full bg-slate-950/90 text-cyan-200 p-3 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};
