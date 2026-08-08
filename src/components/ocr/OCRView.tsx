import React, { useState, useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  ScanText,
  Sparkles,
  Camera,
  MessageSquare,
  ArrowRight,
  FolderOpen,
  Trash2,
  Plus,
  Move,
  Maximize2,
  CheckCircle,
  Film,
  Zap,
} from 'lucide-react';

export const OCRView: React.FC = () => {
  const {
    pages,
    activePageIndex,
    setActivePageIndex,
    autoDetectPanels,
    updateDialogueText,
    updatePanelBBox,
    updatePanelEffect,
    addPanel,
    deletePanel,
    deletePage,
    addDialogueToPanel,
    deleteDialogue,
    setActiveTab,
  } = useStudioStore();

  const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);
  const [resizingPanelId, setResizingPanelId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number; initialW: number; initialH: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialH: 0,
  });

  if (pages.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <ScanText className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu Trang Truyện Nào Được Nạp</h2>
          <p className="text-xs text-slate-400">
            Vui lòng dán đường link chapter truyện tại tab Thư Viện để tải ảnh thật và chỉnh sửa Panel Bounding Box.
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

  // Mouse Drag / Move Handler
  const handleMouseDownMove = (e: React.MouseEvent, panelId: string, bbox: { x: number; y: number; w: number; h: number }) => {
    e.stopPropagation();
    setDraggingPanelId(panelId);
    setSelectedPanelId(panelId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: bbox.x,
      initialY: bbox.y,
      initialW: bbox.w,
      initialH: bbox.h,
    };
  };

  // Mouse Resize Handler
  const handleMouseDownResize = (e: React.MouseEvent, panelId: string, bbox: { x: number; y: number; w: number; h: number }) => {
    e.stopPropagation();
    setResizingPanelId(panelId);
    setSelectedPanelId(panelId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: bbox.x,
      initialY: bbox.y,
      initialW: bbox.w,
      initialH: bbox.h,
    };
  };

  // Global Mouse Move on Canvas Container
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaXPercent = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

    if (draggingPanelId) {
      const newX = Math.max(0, Math.min(100 - dragStartRef.current.initialW, dragStartRef.current.initialX + deltaXPercent));
      const newY = Math.max(0, Math.min(100 - dragStartRef.current.initialH, dragStartRef.current.initialY + deltaYPercent));
      updatePanelBBox(activePageIndex, draggingPanelId, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      });
    } else if (resizingPanelId) {
      const newW = Math.max(15, Math.min(100 - dragStartRef.current.initialX, dragStartRef.current.initialW + deltaXPercent));
      const newH = Math.max(10, Math.min(100 - dragStartRef.current.initialY, dragStartRef.current.initialH + deltaYPercent));
      updatePanelBBox(activePageIndex, resizingPanelId, {
        w: Math.round(newW * 10) / 10,
        h: Math.round(newH * 10) / 10,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingPanelId(null);
    setResizingPanelId(null);
  };

  const cameraEffects = [
    { value: 'dramatic_zoom', label: 'Dramatic Zoom' },
    { value: 'camera_shake', label: 'Camera Shake (Fight)' },
    { value: 'fast_zoom_in', label: 'Fast Zoom In (Power Up)' },
    { value: 'slow_zoom_out', label: 'Slow Zoom Out (Sad)' },
    { value: 'pan_left', label: 'Pan Left' },
    { value: 'pan_right', label: 'Pan Right' },
    { value: 'pan_up', label: 'Pan Up' },
    { value: 'pan_down', label: 'Pan Down' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto select-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <ScanText className="w-4 h-4 text-cyan-400" />
            <span>Trình Chỉnh Sửa Khung Hình Bounding Box & OCR ({pages.length} trang)</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Di chuyển (kéo thả), phóng to/thu nhỏ (kéo góc), xóa panel tùy ý (dùng 1 panel hoặc nhiều panel), hoặc xóa các bức ảnh không cần thiết.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Add Panel Button */}
          <button
            onClick={() => addPanel(activePageIndex)}
            className="flex items-center space-x-1 bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Panel Mới</span>
          </button>

          {/* Delete Page Button */}
          <button
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn xóa Trang ${activePageIndex + 1} khỏi danh sách?`)) {
                deletePage(activePageIndex);
              }
            }}
            className="flex items-center space-x-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Xóa Trang Này</span>
          </button>

          {/* AI Auto-Detect */}
          <button
            onClick={() => autoDetectPanels(activePageIndex)}
            className="flex items-center space-x-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>Tự Động BBox</span>
          </button>

          {/* Next Step */}
          <button
            onClick={() => setActiveTab('script')}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Tạo Kịch Bản</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Page Selector Strip */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5">
        {pages.map((p, idx) => (
          <div key={p.id} className="relative group/pill shrink-0">
            <button
              onClick={() => setActivePageIndex(idx)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                activePageIndex === idx
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm ring-2 ring-cyan-300'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Trang {p.pageIndex} ({p.panels.length} P)
            </button>

            {/* Quick delete page button on pill */}
            <button
              type="button"
              title="Xóa trang này"
              onClick={(e) => {
                e.stopPropagation();
                deletePage(idx);
              }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/pill:opacity-100 transition-opacity text-[8px]"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Canvas: Interactive Image with Drag & Resize Bounding Boxes */}
        <div className="lg:col-span-7 space-y-2">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200">
                🖼️ Canvas Trang {currentPage?.pageIndex} ({currentPage?.panels.length} Panels)
              </span>
              <span className="font-mono text-cyan-400 text-[10px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Kéo để di chuyển • Kéo góc để co giãn
              </span>
            </div>

            <div
              ref={containerRef}
              className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[460px] p-2"
            >
              {currentPage ? (
                <div className="relative max-w-full max-h-[580px] select-none">
                  {/* Manga Image */}
                  <img
                    src={currentPage.imageUrl.startsWith('http') ? currentPage.imageUrl : `http://localhost:3001${currentPage.imageUrl.startsWith('/') ? '' : '/'}${currentPage.imageUrl}`}
                    referrerPolicy="no-referrer"
                    alt="Manga Page"
                    className="w-full h-auto rounded object-contain max-h-[560px] pointer-events-none"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const raw = (currentPage as any).rawImageUrl || currentPage.imageUrl;
                      const fallback = `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(raw)}&referer=https%3A%2F%2Ftruyenqqko.com%2F`;
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />

                  {/* Interactive Panels */}
                  {currentPage.panels.map((panel, pIdx) => {
                    const isSelected = selectedPanelId === panel.id;
                    return (
                      <div
                        key={panel.id}
                        onClick={() => setSelectedPanelId(panel.id)}
                        onMouseDown={(e) => handleMouseDownMove(e, panel.id, panel.bbox)}
                        style={{
                          left: `${panel.bbox.x}%`,
                          top: `${panel.bbox.y}%`,
                          width: `${panel.bbox.w}%`,
                          height: `${panel.bbox.h}%`,
                        }}
                        className={`absolute border-2 rounded transition-colors group cursor-move shadow-md ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-300'
                            : 'border-violet-500/80 bg-violet-600/10 hover:bg-violet-600/20'
                        }`}
                      >
                        {/* Top Label & Delete Action */}
                        <div className="absolute top-1 left-1 flex items-center space-x-1">
                          <span className="bg-cyan-500 text-slate-950 font-mono font-black text-[9px] px-1.5 py-0.5 rounded shadow flex items-center space-x-1">
                            <Move className="w-2 h-2" />
                            <span>Panel {pIdx + 1}</span>
                          </span>
                        </div>

                        {/* Camera Effect Badge & Delete Button */}
                        <div className="absolute top-1 right-1 flex items-center space-x-1">
                          <span className="bg-violet-600/90 text-white text-[8.5px] font-semibold px-1.5 py-0.5 rounded shadow flex items-center space-x-0.5">
                            <Camera className="w-2.5 h-2.5" />
                            <span>{panel.suggestedCameraEffect || 'zoom_in'}</span>
                          </span>

                          <button
                            type="button"
                            title="Xóa panel này"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePanel(activePageIndex, panel.id);
                            }}
                            className="bg-rose-600/90 hover:bg-rose-500 text-white p-0.5 rounded shadow transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Resize Handle at Bottom-Right Corner */}
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, panel.id, panel.bbox)}
                          className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-400 text-slate-950 rounded-tl cursor-se-resize flex items-center justify-center shadow-lg"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa chọn trang manga</p>
              )}
            </div>

            {/* Helper Tips */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1 border-t border-slate-800/80">
              <span>💡 Bạn có thể dùng 1 panel bao trọn toàn bộ ảnh hoặc chia thành nhiều panel tùy thích.</span>
              <button
                onClick={() => addPanel(activePageIndex)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                + Thêm Panel
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Panel & Dialogue Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                <h3 className="text-xs font-bold text-white">Danh Sách Panel & Thoại OCR</h3>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/50">
                {currentPage?.panels.length || 0} Panels
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {currentPage?.panels.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">Trang này chưa có panel nào.</p>
                  <button
                    onClick={() => addPanel(activePageIndex)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow"
                  >
                    + Tạo Panel Đầu Tiên
                  </button>
                </div>
              ) : (
                currentPage?.panels.map((panel, idx) => (
                  <div
                    key={panel.id}
                    onClick={() => setSelectedPanelId(panel.id)}
                    className={`p-3 rounded-lg border space-y-2 transition-all ${
                      selectedPanelId === panel.id
                        ? 'bg-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header with Camera Effect Selector & Delete */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-300">
                        Panel #{idx + 1} ({panel.bbox.w}% × {panel.bbox.h}%)
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {/* Effect Selector */}
                        <select
                          value={panel.suggestedCameraEffect || 'dramatic_zoom'}
                          onChange={(e) => updatePanelEffect(activePageIndex, panel.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-violet-300 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-400"
                        >
                          {cameraEffects.map((eff) => (
                            <option key={eff.value} value={eff.value}>
                              {eff.label}
                            </option>
                          ))}
                        </select>

                        {/* Delete Panel Button */}
                        <button
                          type="button"
                          onClick={() => deletePanel(activePageIndex, panel.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/50 transition-colors"
                          title="Xóa panel này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* AI Scene Description */}
                    {panel.aiDescription && (
                      <p className="text-[10.5px] text-slate-300 italic bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        💡 {panel.aiDescription}
                      </p>
                    )}

                    {/* Dialogues */}
                    <div className="space-y-1.5 pt-0.5">
                      {panel.dialogues.map((d) => (
                        <div key={d.id} className="space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-violet-300">{d.speaker}</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-[8.5px] uppercase px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">
                                {d.emotion}
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteDialogue(activePageIndex, panel.id, d.id)}
                                className="text-slate-500 hover:text-rose-400 text-[10px] ml-1"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={d.text}
                            onChange={(e) => updateDialogueText(activePageIndex, panel.id, d.id, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      ))}

                      {/* Add Dialogue Line */}
                      <button
                        type="button"
                        onClick={() => addDialogueToPanel(activePageIndex, panel.id)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold pt-1 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm câu thoại</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
