import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Video,
  Sparkles,
  Hash,
  PlaySquare,
  FolderOpen,
  Copy,
  Check,
  Flame,
  MessageSquare,
  Clock,
  Share2,
  ListCheck,
  TrendingUp,
} from 'lucide-react';

export const SEOView: React.FC = () => {
  const { seo, setSEOMetadata, generateAISEO, setActiveTab } = useStudioStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!seo) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <Video className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu Content & SEO YouTube</h2>
          <p className="text-xs text-slate-400">
            Hệ thống tối ưu thuật toán YouTube & TikTok. Bấm nút dưới đây để tạo ngay bộ content gồm 10 tiêu đề giật tít CTR cao, Timecodes, Mô tả chuẩn SEO, Thẻ Tags và Bình luận ghim!
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={generateAISEO}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Sinh Bộ Content & SEO Mẫu Ngay</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Nạp Truyện Từ Thư Viện</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Video className="w-5 h-5 text-red-500" />
            <span className="gradient-text">YouTube & TikTok Content Director (Viral SEO Suite)</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Bộ công cụ sáng tạo nội dung YouTube Manga Recap: 10 Tiêu Đề A/B CTR cao, Timecodes mục lục, Mô tả chuẩn SEO, Thẻ Tags và Bình luận ghim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateAISEO}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Tối Ưu Lại Toàn Bộ Content</span>
          </button>
        </div>
      </div>

      {/* 10 High-CTR Video Titles (A/B Testing Selection) */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">10 Tiêu Đề Đạt CTR Cao (A/B Testing Cho YouTube)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Viral Clickbait
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Bấm vào tiêu đề bất kỳ để chọn & copy nhanh</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(seo.alternativeTitles || [seo.title]).map((t, idx) => {
            const isSelected = seo.title === t;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSEOMetadata({ title: t });
                  copyToClipboard(t, `title-${idx}`);
                }}
                className={`p-2.5 rounded-lg border text-[11.5px] cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-red-950/40 border-red-500/80 text-white font-semibold shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{t}</span>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-slate-400 hover:text-white p-1"
                  title="Copy tiêu đề"
                >
                  {copiedKey === `title-${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Left Column: Description & Timecodes */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Title & Description Box */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Tiêu Đề Đang Chọn (YouTube Title)</span>
              </label>
              <button
                onClick={() => copyToClipboard(seo.title, 'active-title')}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              >
                {copiedKey === 'active-title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'active-title' ? 'Đã chép!' : 'Copy'}</span>
              </button>
            </div>
            <input
              type="text"
              value={seo.title}
              onChange={(e) => setSEOMetadata({ title: e.target.value })}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-red-500 font-semibold"
            />

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <ListCheck className="w-4 h-4 text-cyan-400" />
                <span>Mô Tả Video Đầy Đủ (YouTube Description & Timecodes)</span>
              </label>
              <button
                onClick={() => copyToClipboard(seo.description, 'description')}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              >
                {copiedKey === 'description' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'description' ? 'Đã chép mô tả!' : 'Copy Toàn Bộ Mô Tả'}</span>
              </button>
            </div>
            <textarea
              value={seo.description}
              onChange={(e) => setSEOMetadata({ description: e.target.value })}
              rows={9}
              className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-red-500 font-mono leading-relaxed"
            />
          </div>

          {/* Timecodes Chapters */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-white">Mục Lục Video (YouTube Chapters / Timecodes)</span>
              </div>
              <button
                onClick={() => {
                  const tcText = (seo.timecodes || []).map((t) => `${t.timestamp} - ${t.label}`).join('\n');
                  copyToClipboard(tcText, 'timecodes');
                }}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              >
                {copiedKey === 'timecodes' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'timecodes' ? 'Đã chép Timecodes!' : 'Copy Timecodes'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {(seo.timecodes || [
                { timestamp: '00:00', label: 'Hook Mở Đầu & Tóm Tắt Nhanh' },
                { timestamp: '00:15', label: 'Khởi Đầu Diễn Biến Trận Chiến' },
                { timestamp: '01:30', label: 'Cao Trào & Thức Tỉnh Sức Mạnh' },
                { timestamp: '03:15', label: 'Cú Lội Ngược Dòng Ngoạn Mục' },
                { timestamp: '04:30', label: 'Hồi Kết & Kêu Gọi Đăng Ký Kênh' },
              ]).map((tc, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs">
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    {tc.timestamp}
                  </span>
                  <span className="text-slate-200">{tc.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tags, Pinned Comment, TikTok Caption */}
        <div className="lg:col-span-4 space-y-4">
          {/* Pinned Comment */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                <MessageSquare className="w-4 h-4 text-yellow-400" />
                <span>Bình Luận Ghim (Pinned Comment)</span>
              </div>
              <button
                onClick={() => copyToClipboard(seo.pinnedComment || '', 'pinned-comment')}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              >
                {copiedKey === 'pinned-comment' ? <Check className="w-3 h-3 text-emerald-400 inline" /> : <Copy className="w-3 h-3 inline" />}
              </button>
            </div>
            <textarea
              value={seo.pinnedComment || ''}
              onChange={(e) => setSEOMetadata({ pinnedComment: e.target.value })}
              rows={4}
              className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-yellow-500 font-sans text-[11px] leading-relaxed"
            />
          </div>

          {/* TikTok / Shorts Caption */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                <Share2 className="w-4 h-4 text-pink-400" />
                <span>TikTok / Shorts Caption & Hashtags</span>
              </div>
              <button
                onClick={() => copyToClipboard(seo.tiktokCaption || '', 'tiktok-caption')}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              >
                {copiedKey === 'tiktok-caption' ? <Check className="w-3 h-3 text-emerald-400 inline" /> : <Copy className="w-3 h-3 inline" />}
              </button>
            </div>
            <textarea
              value={seo.tiktokCaption || ''}
              onChange={(e) => setSEOMetadata({ tiktokCaption: e.target.value })}
              rows={3}
              className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-pink-500 font-sans text-[11px]"
            />
          </div>

          {/* Tag Cloud */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thẻ Tags Thịnh Hành ({seo.tags.length})</span>
              </div>
              <button
                onClick={() => copyToClipboard(seo.tags.join(', '), 'tags-csv')}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded transition-colors cursor-pointer"
              >
                {copiedKey === 'tags-csv' ? <Check className="w-3 h-3 text-emerald-400 inline" /> : <Copy className="w-3 h-3 inline" />}
                <span>Copy CSV Tags</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {seo.tags.map((t) => (
                <span
                  key={t}
                  onClick={() => copyToClipboard(t, `tag-${t}`)}
                  className="text-[10px] bg-slate-900 border border-slate-800 hover:border-red-500/60 hover:text-white text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Playlist & Schedule Time */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1">
                  <PlaySquare className="w-3 h-3 text-red-400" />
                  <span>Playlist:</span>
                </span>
                <span className="font-semibold text-slate-200 truncate max-w-[180px]">{seo.playlist}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Giờ Đăng Khuyên Dùng:</span>
                <span className="font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                  {seo.scheduleTime || '19:00 - 20:30'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
