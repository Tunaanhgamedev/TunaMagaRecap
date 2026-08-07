import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Video, Sparkles, Hash, PlaySquare, FolderOpen } from 'lucide-react';

export const SEOView: React.FC = () => {
  const { seo, setSEOMetadata, generateAISEO, setActiveTab } = useStudioStore();

  if (!seo) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <Video className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu SEO YouTube</h2>
          <p className="text-xs text-slate-400">
            Hệ thống không tự ý đưa metadata giả. Vui lòng dán link chapter truyện tại tab Thư Viện để nạp truyện và tự động tối ưu tiêu đề, tag, hashtag YouTube.
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
            <Video className="w-4 h-4 text-red-500" />
            <span>YouTube SEO & Metadata Optimizer</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tối ưu tiêu đề giật tít CTR cao, thẻ tag thịnh hành và mô tả chuẩn thuật toán YouTube Recap.
          </p>
        </div>

        <button
          onClick={generateAISEO}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          <span>AI Tối Ưu Title CTR Cao</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Editor */}
        <div className="lg:col-span-8 space-y-3">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-200">Tiêu Đề Video YouTube (Max 100 ký tự)</label>
              <input
                type="text"
                value={seo.title}
                onChange={(e) => setSEOMetadata({ title: e.target.value })}
                className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-200">Mô Tả Video (Description)</label>
              <textarea
                value={seo.description}
                onChange={(e) => setSEOMetadata({ description: e.target.value })}
                rows={6}
                className="w-full bg-slate-950 text-xs text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-red-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Tag Cloud & Ranking */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white border-b border-slate-800 pb-2">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thẻ Tags Thịnh Hành ({seo.tags.length})</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {seo.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  #{t}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-bold text-white border-b border-slate-800 pb-2 pt-2">
              <PlaySquare className="w-3.5 h-3.5 text-red-400" />
              <span>Playlist Khuyên Dùng</span>
            </div>
            <p className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 font-mono">
              {seo.playlist}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
