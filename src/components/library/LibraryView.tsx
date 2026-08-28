import React, { useState, useEffect } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { getProxyImageUrl } from '../../utils/constants';
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
  Folder,
  FolderCheck,
  Search,
  CheckSquare,
  Square,
  PlayCircle,
  Clock,
  Film,
  Download,
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
    loadProject,
    isLoadingProject,

    // Batch Series State & Actions
    librarySubTab,
    setLibrarySubTab,
    discoveredSeries,
    discoveredChapters,
    selectedChapterUrls,
    isDiscoveringSeries,
    isBatchScraping,
    batchScrapeProgress,
    seriesFolders,
    selectedSeriesName,
    setSelectedSeriesName,
    discoverSeriesFromUrl,
    toggleSelectChapter,
    selectAllChapters,
    deselectAllChapters,
    selectChapterRange,
    startBatchScrape,
    fetchSeriesFolders,
  } = useStudioStore();

  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(20);
  const [seriesSearchQuery, setSeriesSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchSeriesFolders();
  }, [fetchSeriesFolders]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addMangaPages('chapter-local', Array.from(e.target.files));
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlToScrape = mangaUrlInput.trim();
    if (!urlToScrape) return;
    setMangaUrlInput(urlToScrape);
    fetchMangaFromUrl(urlToScrape);
  };

  const handleDiscoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlToDiscover = mangaUrlInput.trim();
    if (!urlToDiscover) return;
    discoverSeriesFromUrl(urlToDiscover);
  };

  const quickLinks = [
    { title: 'Ví Dụ: ThuVienSach Chapter 1', url: 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html' },
    { title: 'Ví Dụ: AsuraScans Chapter 178', url: 'https://asuracomic.net/series/solo-leveling-chapter-178' },
    { title: 'Ví Dụ: NetTruyen Kì Nguyên Anh Hùng', url: 'https://nettruyen.africa/truyen-tranh/ki-nguyen-cua-anh-hung/chapter-220/754844' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header & Subtab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-violet-400" />
            <span>Thư Viện & Quản Lý Chapter Truyện Tranh</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dán link để cào 1 chapter hoặc tự động dò toàn bộ 200+ chapter và lưu vào từng thư mục riêng.
          </p>
        </div>

        {/* Subtab Navigation Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1 self-start md:self-auto">
          <button
            onClick={() => setLibrarySubTab('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              librarySubTab === 'single'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Cào 1 Chapter (Nhanh)</span>
          </button>

          <button
            onClick={() => setLibrarySubTab('batch_series')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              librarySubTab === 'batch_series'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>🚀 Dò & Cào Cả Bộ Truyện</span>
          </button>

          <button
            onClick={() => {
              setLibrarySubTab('folders');
              fetchSeriesFolders();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              librarySubTab === 'folders'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>📁 Thư Mục Chapters ({seriesFolders.reduce((acc, s) => acc + s.totalChapters, 0)})</span>
          </button>
        </div>
      </div>

      {/* Global Scrape Status Toast Banner */}
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

      {/* ========================================================= */}
      {/* MODE 1: SINGLE CHAPTER SCRAPER (EXISTING & UNTOUCHED)     */}
      {/* ========================================================= */}
      {librarySubTab === 'single' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-cyan-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Link className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Dán Đường Link Chapter Truyện Cần Làm Video</span>
              </span>
              <span className="text-[9.5px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Hỗ trợ 13+ nguồn: Nettruyen, TruyenQQ, ThuVienSach, MangaDex...
              </span>
            </div>

            <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={mangaUrlInput}
                  onChange={(e) => setMangaUrlInput(e.target.value)}
                  placeholder="Dán link chapter (VD: https://nettruyen.africa/truyen-tranh/ki-nguyen-cua-anh-hung/chapter-220/754844)..."
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isLoadingUrl || isAutoPipelineRunning}
                  className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-700 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
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
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-violet-900/30 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
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
                  className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors whitespace-nowrap font-mono text-[10px] cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Current Scraped Chapter Pages View */}
          {pages.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {selectedProject?.seriesName} - {selectedProject?.episodeTitle} ({pages.length} trang ảnh thật)
                  </span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearCurrentProject}
                    className="text-[11px] text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                  >
                    Làm Mới / Đổi Link
                  </button>
                  <button
                    onClick={() => setActiveTab('ocr')}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Mở Trình OCR Panel ({pages.length} trang)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                          const fallback = getProxyImageUrl(raw, mangaUrlInput.trim() || 'https://truyenqqko.com/');
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
            <div className="glass-panel py-12 px-4 rounded-xl border border-slate-800 text-center space-y-4">
              <Layers className="w-10 h-10 text-violet-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100">Chưa Có Chapter Truyện Nào Được Nạp</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Dán link bất kỳ ở trên hoặc chuyển sang tab "Dò & Cào Cả Bộ Truyện" để tải tự động toàn bộ chapter.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-900/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>⚡ Cào Tự Động Toàn Bộ Trang Ảnh & Thoại Từ URL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: BATCH SERIES SCANNER & DOWNLOADER (NEW FEATURE)   */}
      {/* ========================================================= */}
      {librarySubTab === 'batch_series' && (
        <div className="space-y-4">
          {/* Scanner Input Panel */}
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-violet-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dò & Quét Toàn Bộ Danh Sách Chapter Của Bộ Truyện</span>
              </span>
              <span className="text-[9.5px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Tự động tìm từ Chap 1 đến Chap mới nhất
              </span>
            </div>

            <form onSubmit={handleDiscoverSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={mangaUrlInput}
                  onChange={(e) => setMangaUrlInput(e.target.value)}
                  placeholder="Dán link trang chủ truyện hoặc link bất kỳ chapter nào (VD: https://nettruyen.africa/truyen-tranh/ki-nguyen-cua-anh-hung/chapter-220/754844)..."
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isDiscoveringSeries || isBatchScraping}
                className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-violet-900/30 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {isDiscoveringSeries ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Dò Tìm Chapters...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 text-cyan-300" />
                    <span>🔍 Dò Toàn Bộ Chapter</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Scanned Series Overview Card */}
          {discoveredSeries && (
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  {discoveredSeries.coverUrl ? (
                    <img
                      src={discoveredSeries.coverUrl.startsWith('http') ? discoveredSeries.coverUrl : `http://localhost:3001${discoveredSeries.coverUrl}`}
                      alt={discoveredSeries.name}
                      className="w-14 h-18 rounded-lg object-cover border border-slate-700 shadow-md shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-14 h-18 rounded-lg bg-violet-950/60 border border-violet-800 flex items-center justify-center shrink-0">
                      <Folder className="w-6 h-6 text-violet-400" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-bold text-white">{discoveredSeries.name}</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        {discoveredChapters.length} Chapter
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-lg">
                      Link nguồn: <span className="text-cyan-400 font-mono">{discoveredSeries.sourceUrl}</span>
                    </p>
                    <p className="text-[11px] text-violet-300 font-medium">
                      Đã chọn: <span className="font-bold text-white">{selectedChapterUrls.length}</span> / {discoveredChapters.length} Chapter cần cào
                    </p>
                  </div>
                </div>

                {/* Batch Action Button */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    disabled={isBatchScraping || selectedChapterUrls.length === 0}
                    onClick={startBatchScrape}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isBatchScraping ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Đang Cào ({batchScrapeProgress?.current}/{batchScrapeProgress?.total})...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-white" />
                        <span>⚡ Cào & Lưu {selectedChapterUrls.length} Chapter Vào Từng Folder</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Realtime Batch Scrape Progress Bar */}
              {isBatchScraping && batchScrapeProgress && (
                <div className="glass-panel p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Cào: {batchScrapeProgress.currentChapter} ({batchScrapeProgress.current}/{batchScrapeProgress.total})</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold">{batchScrapeProgress.percent}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
                      style={{ width: `${batchScrapeProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Từng chapter sau khi cào xong sẽ tự động được lưu vào database và tạo thư mục riêng để bạn chỉnh sửa.
                  </p>
                </div>
              )}

              {/* Selection Bar: All, Quick Range, Custom Range */}
              <div className="glass-panel p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-medium">Chọn nhanh:</span>
                  <button
                    onClick={selectAllChapters}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                  >
                    Tất Cả ({discoveredChapters.length})
                  </button>
                  <button
                    onClick={() => selectChapterRange(1, 10)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    10 Chap Đầu
                  </button>
                  <button
                    onClick={() => selectChapterRange(1, 20)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    20 Chap Đầu
                  </button>
                  <button
                    onClick={() => selectChapterRange(1, 50)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    50 Chap Đầu
                  </button>
                  <button
                    onClick={deselectAllChapters}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-400 transition-colors"
                  >
                    Bỏ Chọn
                  </button>
                </div>

                {/* Custom Range Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Từ Chap:</span>
                  <input
                    type="number"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                    className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-xs text-white"
                  />
                  <span className="text-slate-400">Đến:</span>
                  <input
                    type="number"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(parseInt(e.target.value) || 1)}
                    className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-xs text-white"
                  />
                  <button
                    onClick={() => selectChapterRange(rangeStart, rangeEnd)}
                    className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
                  >
                    Áp Dụng
                  </button>
                </div>
              </div>

              {/* Chapters Checklist Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {discoveredChapters.map((ch) => {
                  const isSelected = selectedChapterUrls.includes(ch.url);
                  return (
                    <div
                      key={ch.url}
                      onClick={() => toggleSelectChapter(ch.url)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-violet-950/50 border-violet-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className="font-semibold truncate">{ch.title}</span>
                      </div>

                      {ch.isScraped && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          ✓ Đã Cào
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: CHAPTER FOLDERS EXPLORER (MANAGE EACH CHAPTER)    */}
      {/* ========================================================= */}
      {librarySubTab === 'folders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FolderCheck className="w-4 h-4 text-emerald-400" />
              <span>Quản Lý Thư Mục Chapters Theo Từng Bộ Truyện</span>
            </h2>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={seriesSearchQuery}
                onChange={(e) => setSeriesSearchQuery(e.target.value)}
                placeholder="Tìm bộ truyện..."
                className="bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 w-44"
              />
              <button
                onClick={fetchSeriesFolders}
                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Làm Mới</span>
              </button>
            </div>
          </div>

          {seriesFolders.length > 0 ? (
            <div className="space-y-6">
              {seriesFolders
                .filter((s) => !seriesSearchQuery || s.seriesName.toLowerCase().includes(seriesSearchQuery.toLowerCase()))
                .map((series) => (
                  <div
                    key={series.seriesName}
                    className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3"
                  >
                    {/* Series Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
                          <Folder className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{series.seriesName}</h3>
                          <p className="text-[11px] text-slate-400">
                            Đã lưu <span className="text-cyan-300 font-bold">{series.totalChapters} Chapter</span> trong hệ thống
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setLibrarySubTab('batch_series');
                          discoverSeriesFromUrl(series.chapters[0]?.sourceUrl || series.seriesName);
                        }}
                        className="text-xs text-cyan-400 hover:underline font-semibold flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cào Thêm Chapter Mới</span>
                      </button>
                    </div>

                    {/* Chapter Folders Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {series.chapters.map((ch) => {
                        const isCurrentActive = selectedProject?.id === ch.id;
                        return (
                          <div
                            key={ch.id}
                            onClick={() => {
                              loadProject(ch.id);
                              setLibrarySubTab('single');
                            }}
                            className={`glass-card p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] space-y-2 ${
                              isCurrentActive
                                ? 'bg-violet-950/60 border-violet-500 shadow-lg shadow-violet-900/30'
                                : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white flex items-center space-x-1">
                                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Chap {ch.chapterNumber}</span>
                              </span>
                              {isCurrentActive && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                  Đang Mở
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-400 truncate">
                              {ch.episodeTitle || `Chapter ${ch.chapterNumber}`}
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-900 text-slate-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>~{Math.round(ch.durationEst || 240)}s</span>
                              </span>
                              <span className="text-cyan-400 font-semibold hover:underline">
                                Bấm để sửa →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="glass-panel py-12 px-4 rounded-xl border border-slate-800 text-center space-y-4">
              <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Chưa Có Thư Mục Chapter Nào</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Hãy chuyển sang tab "Dò & Cào Cả Bộ Truyện" để quét và cào toàn bộ các chapter tự động.
                </p>
              </div>

              <button
                onClick={() => setLibrarySubTab('batch_series')}
                className="inline-flex items-center space-x-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Chuyển Sang Dò & Cào Cả Bộ Truyện</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
