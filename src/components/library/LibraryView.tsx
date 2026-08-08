import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  FolderOpen,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  Link,
  Sparkles,
  RefreshCw,
  Layers,
  Check,
  Zap,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const {
    pages,
    selectedProject,
    addMangaPages,
    setActiveTab,
    mangaUrlInput,
    setMangaUrlInput,
    fetchMangaFromUrl,
    isLoadingUrl,
    scrapeStatusMessage,
    clearCurrentProject,
    isAutoPipelineRunning,
    pipelineStep,
    runFullPipeline,
    setActivePageIndex,
    deletePage,
  } = useStudioStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addMangaPages('chapter-local', Array.from(e.target.files));
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlToScrape = mangaUrlInput.trim() || 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html';
    setMangaUrlInput(urlToScrape);
    fetchMangaFromUrl(urlToScrape);
  };

  const quickLinks = [
    { title: 'Solo Leveling (Chap 1)', url: 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html' },
    { title: 'Đại Quản Gia Ma Hoàng', url: 'https://thuviensach.vn/truyen-tranh/dai-quan-gia-la-ma-hoang-chap-1.html' },
    { title: 'One Piece (Đảo Hải Tặc)', url: 'https://thuviensach.vn/truyen-tranh/dao-hai-tac-one-piece-chap-1.html' },
    { title: 'Chú Thuật Hồi Chiến', url: 'https://thuviensach.vn/truyen-tranh/chu-thuat-hoi-chien-jujutsu-kaisen-chap-1.html' },
    { title: 'Asura: Solo Leveling Chap 178', url: 'https://asuracomic.net/series/solo-leveling-chapter-178' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-violet-400" />
            <span>Thư Viện & Nhập Chapter Truyện Tranh Thật</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dán đường link chapter truyện (ThuVienSach, AsuraScans, Nettruyen...) để tự động cào 65+ trang ảnh & thoại thật.
          </p>
        </div>

        {pages.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={clearCurrentProject}
              className="text-[11px] text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
            >
              Làm Mới / Nhập Link Khác
            </button>
            <button
              onClick={() => setActiveTab('ocr')}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
            >
              <span>Mở Trình OCR Panel ({pages.length} trang)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Input Form: Paste Manga URL */}
      <div className="glass-panel p-4 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-cyan-950/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Link className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. Dán Đường Link Chapter Truyện Cần Làm Video</span>
          </span>
          <span className="text-[9.5px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Hỗ trợ: thuviensach.vn / Nettruyen / AsuraScans / MangaDex
          </span>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={mangaUrlInput}
              onChange={(e) => setMangaUrlInput(e.target.value)}
              placeholder="Dán link (VD: https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html)..."
              className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isLoadingUrl || isAutoPipelineRunning}
              className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-700 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {isLoadingUrl && !isAutoPipelineRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                  <span>Đang Cào Ảnh...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Cào Link</span>
                </>
              )}
            </button>

            {/* The 1-Click Full Video Pipeline (MagaRecap AI Engine) */}
            <button
              type="button"
              disabled={isLoadingUrl || isAutoPipelineRunning}
              onClick={() => {
                if (mangaUrlInput.trim()) {
                  runFullPipeline(mangaUrlInput.trim());
                } else {
                  const defaultUrl = 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html';
                  setMangaUrlInput(defaultUrl);
                  runFullPipeline(defaultUrl);
                }
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-violet-900/30 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              <Zap className={`w-4 h-4 text-yellow-300 ${isAutoPipelineRunning ? 'animate-bounce' : ''}`} />
              <span>{isAutoPipelineRunning ? `Đang Xử Lý Bước ${pipelineStep}/6...` : '⚡ 1-Click Tự Động Tạo Video (MagaRecap)'}</span>
            </button>

            <label className="flex items-center justify-center space-x-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-800 cursor-pointer transition-colors whitespace-nowrap">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tải File Máy</span>
              <input type="file" multiple accept="image/*,.cbz,.zip,.pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </form>

        {/* Live Status Toast Banner */}
        {scrapeStatusMessage && (
          <div className="p-3 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-xs text-cyan-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{scrapeStatusMessage}</span>
            </div>
            {isAutoPipelineRunning && (
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-900/80 px-2 py-0.5 rounded border border-cyan-500/30 animate-pulse">
                Bước {pipelineStep}/6
              </span>
            )}
          </div>
        )}

        {/* Quick Sample Links Bar */}
        <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80 overflow-x-auto text-[11px]">
          <span className="text-slate-400 whitespace-nowrap">Mẫu link test nhanh:</span>
          {quickLinks.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setMangaUrlInput(item.url);
                fetchMangaFromUrl(item.url);
              }}
              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors whitespace-nowrap font-mono text-[10px]"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Display Section */}
      {pages.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {selectedProject?.seriesName} - {selectedProject?.episodeTitle} ({pages.length} trang ảnh thật)
              </span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Click từng trang để mở OCR Bounding Box</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pages.map((page, pIdx) => (
              <div
                key={page.id}
                onClick={() => {
                  setActivePageIndex(pIdx);
                  setActiveTab('ocr');
                }}
                className="glass-card rounded-lg overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-lg relative"
              >
                <div className="relative h-56 bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={page.imageUrl.startsWith('http') ? page.imageUrl : `http://localhost:3001${page.imageUrl.startsWith('/') ? '' : '/'}${page.imageUrl}`}
                    referrerPolicy="no-referrer"
                    alt={`Page ${page.pageIndex}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const raw = (page as any).rawImageUrl || page.imageUrl;
                      const fallback = `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(raw)}&referer=${encodeURIComponent(mangaUrlInput.trim() || 'https://truyenqqko.com/')}`;
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono font-bold text-cyan-300 shadow">
                    Trang {page.pageIndex}
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-violet-600/90 text-[9px] font-semibold text-white shadow">
                    {page.panels.length} Panels
                  </span>

                  {/* Delete unwanted page button on hover */}
                  <button
                    type="button"
                    title="Xóa trang không cần thiết này"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(pIdx);
                    }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow text-xs"
                  >
                    ×
                  </button>
                </div>

                <div className="p-2 flex items-center justify-between text-[10px] bg-slate-950/80 border-t border-slate-900">
                  <span className="text-slate-400">Ảnh Chapter Gốc</span>
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Sẵn Sàng</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel py-12 px-4 rounded-xl border border-slate-800 text-center space-y-4">
          <Layers className="w-10 h-10 text-violet-400 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100">Chưa Có Chapter Truyện Nào Được Nạp</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Nhấn nút bên dưới hoặc dán link bất kỳ để tải toàn bộ 65 trang ảnh truyện thật vào phần mềm.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => {
                const sample = 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html';
                setMangaUrlInput(sample);
                fetchMangaFromUrl(sample);
              }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>⚡ Nạp Ngay Solo Leveling Chapter 1 (65 Trang Ảnh Thật)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
