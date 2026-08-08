import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { ScanText, Sparkles, Camera, MessageSquare, ArrowRight, FolderOpen, AlertCircle } from 'lucide-react';

export const OCRView: React.FC = () => {
  const {
    pages,
    activePageIndex,
    setActivePageIndex,
    autoDetectPanels,
    updateDialogueText,
    setActiveTab,
  } = useStudioStore();

  if (pages.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <ScanText className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu Trang Truyện Nào Được Nạp</h2>
          <p className="text-xs text-slate-400">
            Hệ thống không tự ý bịa dữ liệu giả. Vui lòng dán đường link chapter truyện (hoặc chọn file ảnh) tại tab Thư Viện để tải ảnh thật và chạy OCR.
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

  const currentPage = pages[activePageIndex] || pages[0];

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <ScanText className="w-4 h-4 text-cyan-400" />
            <span>OCR & Panel Bounding Box Detector ({pages.length} trang)</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tự động chia khung hình (Panel), nhận diện bóng thoại và trích xuất hội thoại ra JSON.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => autoDetectPanels(activePageIndex)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
            <span>AI Auto-Detect BBox</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Tạo Kịch Bản</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Page Selector Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {pages.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActivePageIndex(idx)}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
              activePageIndex === idx
                ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Trang {p.pageIndex} ({p.panels.length} BBox)
          </button>
        ))}
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Manga Page with Bounding Box overlays */}
        <div className="lg:col-span-7 space-y-2">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200">Trang {currentPage?.pageIndex} Canvas</span>
              <span className="font-mono text-cyan-400">100% | BBox Active</span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[420px]">
              {currentPage ? (
                <div className="relative max-w-full max-h-[520px]">
                  <img
                    src={currentPage.imageUrl.startsWith('http') ? currentPage.imageUrl : `http://localhost:3001${currentPage.imageUrl.startsWith('/') ? '' : '/'}${currentPage.imageUrl}`}
                    referrerPolicy="no-referrer"
                    alt="Manga Page"
                    className="w-full h-auto rounded object-contain max-h-[500px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const raw = (currentPage as any).rawImageUrl || currentPage.imageUrl;
                      const fallback = `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(raw)}&referer=https%3A%2F%2Ftruyenqqko.com%2F`;
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />

                  {currentPage.panels.map((panel, pIdx) => (
                    <div
                      key={panel.id}
                      style={{
                        left: `${panel.bbox.x}%`,
                        top: `${panel.bbox.y}%`,
                        width: `${panel.bbox.w}%`,
                        height: `${panel.bbox.h}%`,
                      }}
                      className="absolute border-2 border-cyan-400/80 bg-cyan-500/10 rounded group transition-all hover:bg-cyan-500/20 shadow-md cursor-pointer"
                    >
                      <div className="absolute top-1 left-1 bg-cyan-500 text-slate-950 font-mono font-black text-[9px] px-1 py-0.2 rounded shadow">
                        Panel {pIdx + 1}
                      </div>

                      {panel.suggestedCameraEffect && (
                        <div className="absolute top-1 right-1 bg-violet-600 text-white text-[8.5px] font-semibold px-1 py-0.2 rounded shadow flex items-center space-x-0.5">
                          <Camera className="w-2.5 h-2.5" />
                          <span>{panel.suggestedCameraEffect}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa chọn trang manga</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Dialogue JSON & Panel Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                <h3 className="text-xs font-bold text-white">Kết Quả OCR & Dialogue</h3>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">
                JSON Ready
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {currentPage?.panels.map((panel, idx) => (
                <div key={panel.id} className="glass-card p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-cyan-300 font-mono">Panel #{idx + 1}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded">
                      {panel.suggestedCameraEffect || 'zoom_in'}
                    </span>
                  </div>

                  {panel.aiDescription && (
                    <p className="text-[10.5px] text-slate-300 italic bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      💡 {panel.aiDescription}
                    </p>
                  )}

                  <div className="space-y-1 pt-0.5">
                    {panel.dialogues.map((d) => (
                      <div key={d.id} className="space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-violet-300">{d.speaker}</span>
                          <span className="text-[8.5px] uppercase px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">
                            {d.emotion}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={d.text}
                          onChange={(e) => updateDialogueText(activePageIndex, panel.id, d.id, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
