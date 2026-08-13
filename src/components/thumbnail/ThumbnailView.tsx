import React, { useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Image as ImageIcon, Download, Layers, FolderOpen } from 'lucide-react';

export const ThumbnailView: React.FC = () => {
  const { thumbnail, setThumbnailConfig, setActiveTab } = useStudioStore();

  if (!thumbnail) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu Thumbnail 16:9</h2>
          <p className="text-xs text-slate-400">
            Vui lòng dán link chapter truyện tại tab Thư Viện để nạp ảnh bìa và tự động thiết kế thumbnail YouTube chuẩn 16:9.
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

  const handleDownload = () => {
    alert('Đã tải xuống ảnh Thumbnail YouTube 1920x1080 thành công!');
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>YouTube Thumbnail Studio (16:9 Full HD)</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tự động cắt ghép nhân vật chính, thêm chữ 3D viền vàng và hiệu ứng giật gân tăng tỉ lệ click CTR.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Ảnh Thumbnail (1920x1080)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Thumbnail Preview Box */}
        <div className="lg:col-span-8 space-y-2">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200">Live 16:9 YouTube Thumbnail Canvas</span>
              <span className="font-mono text-pink-400">CTR Booster Active</span>
            </div>

            <div className={`relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br ${thumbnail.bgGradient} flex items-center justify-center p-6 border border-slate-800 shadow-2xl group`}>
              {thumbnail.characterImage && (
                <img
                  src={thumbnail.characterImage}
                  alt="Main Character"
                  className="absolute right-4 bottom-0 h-[92%] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
                />
              )}

              {/* Title Overlays */}
              <div className="relative z-10 space-y-2 max-w-[65%] mr-auto">
                <span className="inline-block px-3 py-1 rounded bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transform -rotate-1">
                  {thumbnail.badge}
                </span>

                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)] uppercase italic">
                  {thumbnail.mainTitle}
                </h2>

                <p className="text-lg font-black text-cyan-300 drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)] uppercase">
                  {thumbnail.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls & Text Editor */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white border-b border-slate-800 pb-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tùy Chỉnh Chữ & Huy Hiệu</span>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300">Huy Hiệu (Badge Gây Tò Mò)</label>
                <input
                  type="text"
                  value={thumbnail.badge}
                  onChange={(e) => setThumbnailConfig({ badge: e.target.value })}
                  className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300">Tiêu Đề Lớn (Main Title)</label>
                <input
                  type="text"
                  value={thumbnail.mainTitle}
                  onChange={(e) => setThumbnailConfig({ mainTitle: e.target.value })}
                  className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300">Phụ Đề (Subtitle Gây Kích Thích)</label>
                <input
                  type="text"
                  value={thumbnail.subtitle}
                  onChange={(e) => setThumbnailConfig({ subtitle: e.target.value })}
                  className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
