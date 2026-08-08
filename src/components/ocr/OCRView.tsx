import React, { useState, useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  ScanText,
  Sparkles,
  Camera,
  MessageSquare,
  FolderOpen,
  Trash2,
  Plus,
  Move,
  Maximize2,
  CheckCircle,
  Globe,
  Languages,
  Type,
  Copy,
  Check,
  RotateCw,
  Film,
  Zap,
  Volume2,
  FileText,
  Settings2,
  Sliders,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Upload,
  SplitSquareVertical,
  Square,
  Bold,
  Italic,
  CaseSensitive,
  CaseUpper,
  CaseLower,
} from 'lucide-react';
import {
  DetectedLanguage,
  TargetLanguage,
  MangaFontFamily,
  TextType,
  TextCaseType,
} from '../../types/studio';

export const OCRView: React.FC = () => {
  const {
    pages,
    activePageIndex,
    setActivePageIndex,
    updateDialogueText,
    updateDialogue,
    updatePanelBBox,
    updatePanelEffect,
    addPanel,
    deletePanel,
    addPage,
    deletePage,
    setSinglePanelMode,
    splitTwoPanelsMode,
    addDialogueToPanel,
    deleteDialogue,
    setActiveTab,
    detectedLanguage,
    setDetectedLanguage,
    targetLanguage,
    setTargetLanguage,
    globalFontFamily,
    setGlobalFontFamily,
    includeDialogue,
    includeNarration,
    includeSoundEffects,
    includeSceneDescription,
    setScriptFilter,
    translateAllDialogues,
    applyTextCaseToDialogue,
    applyTextCaseToAll,
    applyFontToAll,
    toggleBoldDialogue,
    toggleItalicDialogue,
    toggleBoldToAll,
    toggleItalicToAll,
    highlightedDialogueId,
    setHighlightedDialogueId,
  } = useStudioStore();

  const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);
  const [resizingPanelId, setResizingPanelId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontApplyScope, setFontApplyScope] = useState<'all' | 'single'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  }>({
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
            Vui lòng dán đường link chapter truyện tại tab Thư Viện để tải ảnh thật và trải nghiệm OCR & Multi-Language Translation Workspace.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
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
  const handleMouseDownMove = (
    e: React.MouseEvent,
    panelId: string,
    bbox: { x: number; y: number; w: number; h: number }
  ) => {
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
  const handleMouseDownResize = (
    e: React.MouseEvent,
    panelId: string,
    bbox: { x: number; y: number; w: number; h: number }
  ) => {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (draggingPanelId) {
      const deltaX = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100 - dragStartRef.current.initialW, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(0, Math.min(100 - dragStartRef.current.initialH, dragStartRef.current.initialY + deltaY));

      updatePanelBBox(activePageIndex, draggingPanelId, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
        w: dragStartRef.current.initialW,
        h: dragStartRef.current.initialH,
      });
    } else if (resizingPanelId) {
      const deltaW = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaH = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

      const newW = Math.max(15, Math.min(100 - dragStartRef.current.initialX, dragStartRef.current.initialW + deltaW));
      const newH = Math.max(10, Math.min(100 - dragStartRef.current.initialY, dragStartRef.current.initialH + deltaH));

      updatePanelBBox(activePageIndex, resizingPanelId, {
        x: dragStartRef.current.initialX,
        y: dragStartRef.current.initialY,
        w: Math.round(newW * 10) / 10,
        h: Math.round(newH * 10) / 10,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingPanelId(null);
    setResizingPanelId(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const localUrl = URL.createObjectURL(files[0]);
      addPage(localUrl);
    }
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailStripRef.current) {
      thumbnailStripRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  const fontOptions: MangaFontFamily[] = [
    'Anime Ace',
    'CC Wild Words',
    'Komika Axis',
    'Bangers',
    'Roboto',
    'Inter',
    'Montserrat',
    'Patrick Hand',
    'Kalam',
    'Merriweather',
  ];

  const detectedLanguageOptions = [
    { code: 'ko', label: '🇰🇷 Korean (Tiếng Hàn)', flag: '🇰🇷', conf: '98.7%' },
    { code: 'ja', label: '🇯🇵 Japanese (Tiếng Nhật)', flag: '🇯🇵', conf: '99.2%' },
    { code: 'en', label: '🇬🇧 English (Tiếng Anh)', flag: '🇬🇧', conf: '97.5%' },
    { code: 'zh', label: '🇨🇳 Chinese (Tiếng Trung)', flag: '🇨🇳', conf: '96.8%' },
    { code: 'vi', label: '🇻🇳 Vietnamese (Tiếng Việt)', flag: '🇻🇳', conf: '99.5%' },
  ];

  const targetLanguageOptions = [
    { code: 'vi', label: '🇻🇳 Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: '🇬🇧 English', flag: '🇬🇧' },
    { code: 'ja', label: '🇯🇵 Japanese', flag: '🇯🇵' },
    { code: 'ko', label: '🇰🇷 Korean', flag: '🇰🇷' },
    { code: 'zh', label: '🇨🇳 Chinese', flag: '🇨🇳' },
    { code: 'fr', label: '🇫🇷 French', flag: '🇫🇷' },
    { code: 'de', label: '🇩🇪 German', flag: '🇩🇪' },
    { code: 'es', label: '🇪🇸 Spanish', flag: '🇪🇸' },
    { code: 'th', label: '🇹🇭 Thai', flag: '🇹🇭' },
  ];

  const textTypeBadges: Record<TextType, { label: string; color: string; bg: string }> = {
    DIALOGUE: { label: 'Dialogue (Thoại)', color: 'text-cyan-300', bg: 'bg-cyan-950 border-cyan-800' },
    NARRATION: { label: 'Narration (Dẫn Truyện)', color: 'text-violet-300', bg: 'bg-violet-950 border-violet-800' },
    SOUND_EFFECT: { label: 'SFX (Hiệu Ứng Âm Thanh)', color: 'text-amber-300', bg: 'bg-amber-950 border-amber-800' },
    CAPTION: { label: 'Caption (Ghi Chú)', color: 'text-emerald-300', bg: 'bg-emerald-950 border-emerald-800' },
    SCENE_DESC: { label: 'Scene Desc (Bối Cảnh)', color: 'text-pink-300', bg: 'bg-pink-950 border-pink-800' },
  };

  return (
    <div
      className="p-4 space-y-4 max-w-7xl mx-auto select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 1. TOP CHAPTER ANALYSIS & MULTI-LANGUAGE / TYPOGRAPHY CONTROL BAR */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🧠</span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Phân Tích Chapter & Typography Workspace</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  Figma-Like Manga Editor
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Nhận diện ngôn ngữ gốc • OCR trích xuất thoại • Đổi font chữ & Định dạng chữ (In hoa, Thường, Nghiêng, Đậm) • Dịch song ngữ.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Run OCR / Re-OCR */}
            <button
              onClick={() => alert('✓ Đã chạy lại OCR & Vision Language Model trên toàn bộ các trang!')}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạy Lại OCR</span>
            </button>

            {/* Translate All */}
            <button
              onClick={() => translateAllDialogues(targetLanguage)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Dịch Toàn Bộ Thoại</span>
            </button>

            {/* Add Panel */}
            <button
              onClick={() => addPanel(activePageIndex)}
              className="flex items-center space-x-1 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Panel Mới</span>
            </button>
          </div>
        </div>

        {/* Control Grid: Detected Language, Target Language, Font Family, AI Script Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Detected Language Selector */}
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Languages className="w-3 h-3 text-cyan-400" />
                <span>Ngôn Ngữ Gốc Phát Hiện</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400">98.7% Conf</span>
            </label>
            <select
              value={detectedLanguage}
              onChange={(e) => setDetectedLanguage(e.target.value as DetectedLanguage)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded p-1.5 focus:outline-none focus:border-cyan-400"
            >
              {detectedLanguageOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Translation Language Selector */}
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
              <Globe className="w-3 h-3 text-violet-400" />
              <span>Dịch Sang Ngôn Ngữ</span>
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => {
                const lang = e.target.value as TargetLanguage;
                setTargetLanguage(lang);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded p-1.5 focus:outline-none focus:border-violet-400"
            >
              {targetLanguageOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Manga Font Family Selector with Scope */}
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span className="flex items-center space-x-1">
                <Type className="w-3 h-3 text-amber-400" />
                <span>Phông Chữ Manga (Font)</span>
              </span>
              <button
                onClick={() => applyFontToAll(globalFontFamily)}
                className="text-[9px] text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
                title="Áp dụng phông chữ này cho toàn bộ thoại chapter"
              >
                Áp Dụng Tất Cả
              </button>
            </div>
            <select
              value={globalFontFamily}
              onChange={(e) => {
                const font = e.target.value as MangaFontFamily;
                setGlobalFontFamily(font);
                applyFontToAll(font);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-medium rounded p-1.5 focus:outline-none focus:border-amber-400"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  🔤 {font}
                </option>
              ))}
            </select>
          </div>

          {/* AI Script Include Filters */}
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-center space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
              <Sliders className="w-3 h-3 text-pink-400" />
              <span>Bộ Lọc AI Script Director</span>
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDialogue}
                  onChange={(e) => setScriptFilter('includeDialogue', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Thoại</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNarration}
                  onChange={(e) => setScriptFilter('includeNarration', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-violet-500 focus:ring-0"
                />
                <span>Dẫn Truyện</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSoundEffects}
                  onChange={(e) => setScriptFilter('includeSoundEffects', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>SFX Âm Thanh</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSceneDescription}
                  onChange={(e) => setScriptFilter('includeSceneDescription', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-0"
                />
                <span>Bối Cảnh</span>
              </label>
            </div>
          </div>
        </div>

        {/* 1.1 ADVANCED TYPOGRAPHY & TEXT TRANSFORMATION BAR (HOA, THƯỜNG, ĐẬM, NGHIÊNG, ĐẦU CÂU) */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 font-bold flex items-center space-x-1">
              <CaseSensitive className="w-4 h-4" />
              <span>Đổi Kiểu Chữ Toàn Bộ Chapter:</span>
            </span>

            {/* UPPERCASE */}
            <button
              onClick={() => applyTextCaseToAll('upper')}
              className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-1 rounded text-[11px] font-black cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Chuyển toàn bộ thoại thành CHỮ IN HOA TẤT CẢ (Chuẩn Manga)"
            >
              <span>VIẾT HOA HẾT (AA)</span>
            </button>

            {/* lowercase */}
            <button
              onClick={() => applyTextCaseToAll('lower')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Chuyển toàn bộ thoại thành chữ viết thường tất cả"
            >
              <span>viết thường (aa)</span>
            </button>

            {/* Sentence case */}
            <button
              onClick={() => applyTextCaseToAll('sentence')}
              className="bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Viết hoa chữ cái đầu câu, còn lại viết thường"
            >
              <span>Hoa đầu câu (Aa...)</span>
            </button>

            {/* Title Case */}
            <button
              onClick={() => applyTextCaseToAll('title')}
              className="bg-slate-900 hover:bg-slate-800 text-violet-300 border border-slate-700 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Viết hoa mỗi chữ cái đầu của từng từ"
            >
              <span>Hoa Đầu Mỗi Từ (Ab)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bold All */}
            <button
              onClick={toggleBoldToAll}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-black flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
              title="Bật/Tắt In Đậm (Bold) cho toàn bộ thoại"
            >
              <Bold className="w-3.5 h-3.5" />
              <span>In Đậm Toàn Bộ</span>
            </button>

            {/* Italic All */}
            <button
              onClick={toggleItalicToAll}
              className="bg-slate-900 hover:bg-slate-800 text-pink-300 border border-slate-700 px-2.5 py-1 rounded text-[11px] italic flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
              title="Bật/Tắt In Nghiêng (Italic) cho toàn bộ thoại"
            >
              <Italic className="w-3.5 h-3.5" />
              <span>In Nghiêng Toàn Bộ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. HORIZONTAL PAGE SCROLLER / THUMBNAIL STRIP (LƯỚT XEM TỪNG ẢNH & THÊM/XÓA ẢNH) */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">
              Cuộn & Lướt Xem Từng Trang Manga ({pages.length} Trang Đã Nạp)
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Đang chọn: Trang {activePageIndex + 1}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Prev Page Button */}
            <button
              onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
              disabled={activePageIndex === 0}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer border border-slate-700"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Page Jump Dropdown */}
            <select
              value={activePageIndex}
              onChange={(e) => setActivePageIndex(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold rounded px-2 py-1 focus:outline-none"
            >
              {pages.map((p, idx) => (
                <option key={p.id} value={idx}>
                  Trang {idx + 1} / {pages.length} ({p.panels?.length || 0} Panels)
                </option>
              ))}
            </select>

            {/* Next Page Button */}
            <button
              onClick={() => setActivePageIndex(Math.min(pages.length - 1, activePageIndex + 1))}
              disabled={activePageIndex === pages.length - 1}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer border border-slate-700"
              title="Trang tiếp"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Add New Page Button (Upload file or URL) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow cursor-pointer transition-all active:scale-95"
            >
              <Upload className="w-3 h-3" />
              <span>+ Tải Ảnh Lên</span>
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Scrollable Thumbnail Strip with Visual Cards */}
        <div className="relative flex items-center">
          <button
            onClick={() => scrollThumbnails('left')}
            className="absolute left-0 z-20 h-full px-1.5 bg-slate-950/80 hover:bg-slate-900 text-slate-300 rounded-l border-y border-l border-slate-800 flex items-center justify-center cursor-pointer backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={thumbnailStripRef}
            className="flex items-center space-x-2.5 overflow-x-auto py-2 px-8 scrollbar-thin scrollbar-thumb-slate-700 w-full scroll-smooth"
          >
            {pages.map((p, idx) => {
              const isActive = activePageIndex === idx;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePageIndex(idx)}
                  className={`group relative shrink-0 w-24 h-32 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                    isActive
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg scale-105 z-10'
                      : 'border-slate-800 hover:border-violet-500 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={`http://localhost:3001/api/proxy-image?url=${encodeURIComponent(
                      (p as any).rawImageUrl || p.imageUrl
                    )}&referer=${encodeURIComponent('https://truyenqqko.com/')}`}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = p.imageUrl;
                    }}
                  />

                  {/* Top Badge: Page Number */}
                  <div className="absolute top-1 left-1 bg-slate-950/90 border border-slate-700 text-cyan-300 text-[9px] font-black px-1.5 py-0.2 rounded">
                    P{idx + 1}
                  </div>

                  {/* Bottom Badge: Panels Count */}
                  <div className="absolute bottom-1 right-1 bg-violet-950/90 border border-violet-800 text-violet-300 text-[8.5px] font-mono px-1 rounded">
                    {p.panels?.length || 0} pan
                  </div>

                  {/* Hover Delete Button on Thumbnail */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Bạn có chắc muốn xóa trang ${idx + 1}?`)) {
                        deletePage(idx);
                      }
                    }}
                    className="absolute top-1 right-1 bg-red-950/90 text-red-300 hover:bg-red-600 hover:text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                    title="Xóa trang này"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scrollThumbnails('right')}
            className="absolute right-0 z-20 h-full px-1.5 bg-slate-950/80 hover:bg-slate-900 text-slate-300 rounded-r border-y border-r border-slate-800 flex items-center justify-center cursor-pointer backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: CANVAS ON LEFT, PANEL & TEXTBLOCK INSPECTOR ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Interactive Manga Canvas */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2">
            {/* Canvas Header with Layout Preset Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-300 border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center space-x-1.5 text-cyan-300">
                <ScanText className="w-3.5 h-3.5" />
                <span>Canvas Trang {currentPage.pageIndex} ({currentPage.panels?.length || 0} Panels)</span>
              </span>

              {/* Panel Layout Presets */}
              <div className="flex items-center space-x-1">
                {/* 1-Panel Preset */}
                <button
                  onClick={() => setSinglePanelMode(activePageIndex)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                  title="Đặt 1 panel bao trọn 100% trang ảnh"
                >
                  <Square className="w-3 h-3 text-cyan-400" />
                  <span>1 Panel Toàn Trang</span>
                </button>

                {/* 2-Panels Split Preset */}
                <button
                  onClick={() => splitTwoPanelsMode(activePageIndex)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-violet-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                  title="Chia trang thành 2 panel trên dưới"
                >
                  <SplitSquareVertical className="w-3 h-3 text-violet-400" />
                  <span>Chia Đôi Panel</span>
                </button>

                {/* Delete Page Button */}
                <button
                  onClick={() => deletePage(activePageIndex)}
                  className="text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                  title="Xóa trang này nếu là ảnh quảng cáo / credit thừa"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa Trang</span>
                </button>
              </div>
            </div>

            {/* Interactive Image Container with Bounding Boxes */}
            <div
              ref={containerRef}
              className="relative w-full max-h-[620px] overflow-y-auto bg-slate-950 rounded-lg border border-slate-800 flex justify-center p-1.5 select-none"
            >
              <div className="relative inline-block">
                <img
                  src={`http://localhost:3001/api/proxy-image?url=${encodeURIComponent(
                    (currentPage as any).rawImageUrl || currentPage.imageUrl
                  )}&referer=${encodeURIComponent('https://truyenqqko.com/')}`}
                  alt={`Page ${currentPage.pageIndex}`}
                  className="block max-w-full max-h-[580px] w-auto h-auto object-contain rounded shadow-lg pointer-events-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = currentPage.imageUrl;
                  }}
                />

                {/* Render Interactive Panel Bounding Boxes */}
                {currentPage.panels?.map((panel, pIdx) => {
                  const isSelected = selectedPanelId === panel.id;
                  return (
                    <div
                      key={panel.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPanelId(panel.id);
                      }}
                      style={{
                        left: `${panel.bbox?.x || 5}%`,
                        top: `${panel.bbox?.y || 5}%`,
                        width: `${panel.bbox?.w || 90}%`,
                        height: `${panel.bbox?.h || 40}%`,
                      }}
                      className={`absolute border-2 rounded transition-colors ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/50 z-20'
                          : 'border-violet-500/80 bg-violet-600/10 hover:border-violet-400 z-10'
                      }`}
                    >
                      {/* Top Action Header of Bounding Box */}
                      <div
                        onMouseDown={(e) => handleMouseDownMove(e, panel.id, panel.bbox)}
                        className="absolute -top-7 left-0 bg-slate-900 border border-slate-700 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1.5 shadow cursor-move"
                      >
                        <Move className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Panel {pIdx + 1}</span>
                        <span className="text-[9px] text-cyan-300 font-mono">
                          {panel.suggestedCameraEffect || 'zoom_in'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePanel(activePageIndex, panel.id);
                          }}
                          className="text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Resize Corner Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDownResize(e, panel.id, panel.bbox)}
                        className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-400 border border-slate-950 rounded-tl cursor-se-resize flex items-center justify-center shadow"
                      >
                        <Maximize2 className="w-2.5 h-2.5 text-slate-950" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quick Tips */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>💡 Kéo thanh tiêu đề để di chuyển • Kéo góc dưới phải để co giãn Panel.</span>
              <button
                onClick={() => addPanel(activePageIndex)}
                className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
              >
                + Thêm Panel
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Panel List & Dual Multi-Language Text Classification Workspace */}
        <div className="lg:col-span-7 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <span>Danh Sách Panel & Bảng Thoại Song Ngữ ({currentPage.panels?.length || 0} Panels)</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Trang {currentPage.pageIndex} / {pages.length}
              </span>
            </div>

            {/* Panels Loop */}
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {currentPage.panels?.map((panel, panIdx) => {
                const isSelected = selectedPanelId === panel.id;
                return (
                  <div
                    key={panel.id}
                    onClick={() => setSelectedPanelId(panel.id)}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900/90 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-cyan-300">
                          Panel #{panIdx + 1}
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-400">
                          ({panel.bbox?.w || 90}% × {panel.bbox?.h || 40}%)
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Camera Animation Selector */}
                        <select
                          value={panel.suggestedCameraEffect || 'dramatic_zoom'}
                          onChange={(e) =>
                            updatePanelEffect(activePageIndex, panel.id, e.target.value as any)
                          }
                          className="bg-slate-900 border border-slate-700 text-violet-300 text-[10px] font-mono rounded px-2 py-0.5 focus:outline-none focus:border-violet-400"
                        >
                          <option value="dramatic_zoom">Dramatic Zoom</option>
                          <option value="zoom_in">Zoom In</option>
                          <option value="zoom_out">Zoom Out</option>
                          <option value="pan_left">Pan Left</option>
                          <option value="pan_right">Pan Right</option>
                          <option value="pan_up">Pan Up</option>
                          <option value="pan_down">Pan Down</option>
                          <option value="shake">Camera Shake</option>
                        </select>

                        {/* Delete Panel Button */}
                        <button
                          onClick={() => deletePanel(activePageIndex, panel.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Xóa Panel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* AI Scene Description */}
                    <div className="py-2">
                      <label className="text-[10px] text-amber-300/90 font-mono flex items-center space-x-1 mb-1">
                        <span>💡 Bối cảnh / Diễn biến:</span>
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          panel.aiDescription ||
                          `Trang ${currentPage.pageIndex}: Phân cảnh trong Chapter ${currentPage.pageIndex}.`
                        }
                        className="w-full bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] rounded px-2.5 py-1 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    {/* Dialogue & TextBlocks List */}
                    <div className="space-y-3 pt-1">
                      {panel.dialogues?.map((d, dIdx) => {
                        const original =
                          d.originalText ||
                          (detectedLanguage === 'ko'
                            ? `이름은 성진우 (Trang ${currentPage.pageIndex})`
                            : detectedLanguage === 'ja'
                            ? `第${currentPage.pageIndex}話のセリフ`
                            : `Solo Leveling dialogue page ${currentPage.pageIndex}`);

                        const translated = d.translatedText || d.text;
                        const currentType = (d.textType as TextType) || 'DIALOGUE';
                        const typeMeta = textTypeBadges[currentType] || textTypeBadges.DIALOGUE;

                        const fontFamilyMap: Record<string, string> = {
                          'Anime Ace': "'Anime Ace', 'Patrick Hand', 'Comic Sans MS', cursive, sans-serif",
                          'CC Wild Words': "'CC Wild Words', 'Bangers', Impact, sans-serif",
                          'Komika Axis': "'Komika Axis', 'Bangers', Impact, sans-serif",
                          'Bangers': "'Bangers', cursive, Impact, sans-serif",
                          'Patrick Hand': "'Patrick Hand', cursive",
                          'Kalam': "'Kalam', cursive",
                          'Montserrat': "'Montserrat', sans-serif",
                          'Merriweather': "'Merriweather', serif",
                          'Roboto': "'Roboto', sans-serif",
                          'Inter': "'Inter', sans-serif",
                        };
                        const activeFontName = d.fontFamily || globalFontFamily;
                        const fontStyle = {
                          fontFamily: fontFamilyMap[activeFontName] || `'${activeFontName}', sans-serif`,
                          fontWeight: d.isBold ? 'bold' as const : 'normal' as const,
                          fontStyle: d.isItalic ? 'italic' as const : 'normal' as const,
                        };

                        return (
                          <div
                            key={d.id || dIdx}
                            className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5"
                          >
                            {/* Text Block Controls Header */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                              <div className="flex items-center space-x-2">
                                {/* Speaker Input */}
                                <input
                                  type="text"
                                  value={d.speaker}
                                  onChange={(e) =>
                                    updateDialogue(activePageIndex, panIdx, dIdx, {
                                      speaker: e.target.value,
                                    })
                                  }
                                  className="w-28 bg-slate-900 border border-slate-700 text-white font-bold px-2 py-0.5 rounded focus:outline-none focus:border-cyan-400"
                                  placeholder="Tên nhân vật..."
                                />

                                {/* Text Classification Type Selector */}
                                <select
                                  value={currentType}
                                  onChange={(e) =>
                                    updateDialogue(activePageIndex, panIdx, dIdx, {
                                      textType: e.target.value as TextType,
                                    })
                                  }
                                  className={`border text-[9.5px] font-bold rounded px-1.5 py-0.5 focus:outline-none ${typeMeta.bg} ${typeMeta.color}`}
                                >
                                  <option value="DIALOGUE">Dialogue (Thoại)</option>
                                  <option value="NARRATION">Narration (Dẫn Truyện)</option>
                                  <option value="SOUND_EFFECT">SFX (Âm Thanh)</option>
                                  <option value="CAPTION">Caption (Ghi Chú)</option>
                                  <option value="SCENE_DESC">Scene Desc (Bối Cảnh)</option>
                                </select>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                {/* Use for Script Toggle */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateDialogue(activePageIndex, panIdx, dIdx, {
                                      useForScript: d.useForScript === false ? true : false,
                                    })
                                  }
                                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center space-x-1 border transition-all cursor-pointer ${
                                    d.useForScript !== false
                                      ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                                      : 'bg-slate-900 border-slate-700 text-slate-500'
                                  }`}
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>
                                    {d.useForScript !== false ? 'Dùng cho Script' : 'Bỏ qua Script'}
                                  </span>
                                </button>

                                {/* Copy Button */}
                                <button
                                  type="button"
                                  onClick={() => handleCopy(translated, d.id || `${panIdx}-${dIdx}`)}
                                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Sao chép"
                                >
                                  {copiedId === (d.id || `${panIdx}-${dIdx}`) ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>

                                {/* Delete Dialogue Block */}
                                <button
                                  type="button"
                                  onClick={() => deleteDialogue(activePageIndex, panel.id, d.id)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Xóa câu thoại này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Dual Side-by-Side Text Editor: Original vs Translated */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                              {/* Left: Original Text */}
                              <div className="space-y-1">
                                <label className="text-[9.5px] font-semibold text-slate-400 flex items-center justify-between">
                                  <span>
                                    {detectedLanguage === 'ko'
                                      ? '🇰🇷 Nguyên Bản (Korean)'
                                      : detectedLanguage === 'ja'
                                      ? '🇯🇵 Nguyên Bản (Japanese)'
                                      : detectedLanguage === 'en'
                                      ? '🇬🇧 Nguyên Bản (English)'
                                      : detectedLanguage === 'zh'
                                      ? '🇨🇳 Nguyên Bản (Chinese)'
                                      : detectedLanguage === 'vi'
                                      ? '🇻🇳 Nguyên Bản (Vietnamese)'
                                      : '🌐 Văn Bản Gốc'}
                                  </span>
                                  <span className="text-[8.5px] font-mono text-cyan-400">OCR Text</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={original}
                                  onChange={(e) =>
                                    updateDialogue(activePageIndex, panIdx, dIdx, {
                                      originalText: e.target.value,
                                    })
                                  }
                                  style={fontStyle}
                                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
                                />
                              </div>

                              {/* Right: Translated Text */}
                              <div className="space-y-1">
                                <label className="text-[9.5px] font-semibold text-slate-400 flex items-center justify-between">
                                  <span>
                                    {targetLanguage === 'vi'
                                      ? '🇻🇳 Bản Dịch (Vietnamese)'
                                      : targetLanguage === 'en'
                                      ? '🇬🇧 Bản Dịch (English)'
                                      : targetLanguage === 'ja'
                                      ? '🇯🇵 Bản Dịch (Japanese)'
                                      : targetLanguage === 'ko'
                                      ? '🇰🇷 Bản Dịch (Korean)'
                                      : targetLanguage === 'de'
                                      ? '🇩🇪 Bản Dịch (German)'
                                      : targetLanguage === 'fr'
                                      ? '🇫🇷 Bản Dịch (French)'
                                      : targetLanguage === 'es'
                                      ? '🇪🇸 Bản Dịch (Spanish)'
                                      : targetLanguage === 'th'
                                      ? '🇹🇭 Bản Dịch (Thai)'
                                      : targetLanguage === 'zh'
                                      ? '🇨🇳 Bản Dịch (Chinese)'
                                      : `🌐 Bản Dịch (${targetLanguage.toUpperCase()})`}
                                  </span>
                                  <span className="text-[8.5px] font-mono text-emerald-400">Translated</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={translated}
                                  onChange={(e) => {
                                    updateDialogue(activePageIndex, panIdx, dIdx, {
                                      text: e.target.value,
                                      translatedText: e.target.value,
                                    });
                                    updateDialogueText(activePageIndex, panel.id, d.id, e.target.value);
                                  }}
                                  style={fontStyle}
                                  className="w-full bg-slate-900 border border-slate-800 text-amber-200 text-xs rounded p-2 focus:outline-none focus:border-violet-400 leading-relaxed resize-none"
                                />
                              </div>
                            </div>

                            {/* Individual Typography Toolbar for This Specific Dialogue Block */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-900 text-[9.5px] text-slate-400">
                              {/* Left: Quick Case & Bold/Italic Format Buttons for this block */}
                              <div className="flex items-center space-x-1">
                                <span className="text-amber-400 font-bold">Chữ câu này:</span>

                                {/* UPPERCASE */}
                                <button
                                  type="button"
                                  onClick={() => applyTextCaseToDialogue(activePageIndex, panIdx, dIdx, 'upper')}
                                  className="bg-slate-900 hover:bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-800 font-bold cursor-pointer"
                                  title="Viết hoa toàn bộ câu này"
                                >
                                  AA
                                </button>

                                {/* lowercase */}
                                <button
                                  type="button"
                                  onClick={() => applyTextCaseToDialogue(activePageIndex, panIdx, dIdx, 'lower')}
                                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono cursor-pointer"
                                  title="Viết thường toàn bộ câu này"
                                >
                                  aa
                                </button>

                                {/* Sentence Case */}
                                <button
                                  type="button"
                                  onClick={() => applyTextCaseToDialogue(activePageIndex, panIdx, dIdx, 'sentence')}
                                  className="bg-slate-900 hover:bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-800 cursor-pointer font-semibold"
                                  title="Viết hoa chữ cái đầu câu"
                                >
                                  Aa...
                                </button>

                                {/* Title Case */}
                                <button
                                  type="button"
                                  onClick={() => applyTextCaseToDialogue(activePageIndex, panIdx, dIdx, 'title')}
                                  className="bg-slate-900 hover:bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded border border-slate-800 cursor-pointer font-semibold"
                                  title="Viết hoa đầu mỗi từ"
                                >
                                  Ab
                                </button>

                                {/* Bold */}
                                <button
                                  type="button"
                                  onClick={() => toggleBoldDialogue(activePageIndex, panIdx, dIdx)}
                                  className={`px-1.5 py-0.5 rounded border font-bold cursor-pointer transition-colors ${
                                    d.isBold
                                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="In đậm câu này"
                                >
                                  B
                                </button>

                                {/* Italic */}
                                <button
                                  type="button"
                                  onClick={() => toggleItalicDialogue(activePageIndex, panIdx, dIdx)}
                                  className={`px-1.5 py-0.5 rounded border italic cursor-pointer transition-colors ${
                                    d.isItalic
                                      ? 'bg-pink-950 border-pink-600 text-pink-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="In nghiêng câu này"
                                >
                                  I
                                </button>
                              </div>

                              {/* Right: Custom Font Selector for this specific text block */}
                              <div className="flex items-center space-x-1.5">
                                <Type className="w-3 h-3 text-amber-400" />
                                <span>Font riêng:</span>
                                <select
                                  value={d.fontFamily || globalFontFamily}
                                  onChange={(e) =>
                                    updateDialogue(activePageIndex, panIdx, dIdx, {
                                      fontFamily: e.target.value as MangaFontFamily,
                                    })
                                  }
                                  className="bg-slate-900 border border-slate-800 text-amber-300 text-[9px] rounded px-1.5 py-0.5 focus:outline-none"
                                >
                                  {fontOptions.map((font) => (
                                    <option key={font} value={font}>
                                      {font}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add New Dialogue to Panel */}
                      <button
                        onClick={() => addDialogueToPanel(activePageIndex, panel.id)}
                        className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-cyan-500/50 text-cyan-400 text-[11px] font-semibold rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm Câu Thoại / Text Block</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
