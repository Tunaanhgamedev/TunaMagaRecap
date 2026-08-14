import React, { useState, useRef } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Image as ImageIcon,
  Download,
  Layers,
  FolderOpen,
  Sparkles,
  Wand2,
  Zap,
  Flame,
  Sliders,
  Palette,
  Type,
  Check,
  Copy,
  Upload,
  Smartphone,
  Monitor,
  RefreshCw,
  Plus,
  Trash2,
  Cpu,
} from 'lucide-react';
import {
  THUMBNAIL_THEMES,
  AI_PRESET_ASSETS,
  CTR_STICKERS,
  createDefaultThumbnailConfig,
} from '../../utils/thumbnailPresets';
import { downloadThumbnailImage } from '../../utils/thumbnailExporter';
import {
  ThumbnailTheme,
  ThumbnailBadgeStyle,
  ThumbnailTitleStyle,
  ThumbnailOverlayEffect,
  AIVisualElement,
} from '../../types/studio';

export const ThumbnailView: React.FC = () => {
  const { thumbnail, setThumbnailConfig, setActiveTab, selectedProject, pages } = useStudioStore();

  const [activeControlTab, setActiveControlTab] = useState<'theme' | 'character' | 'typography' | 'ai_prompt'>('theme');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);

  // Fallback initialize if thumbnail is null
  const currentThumbnail =
    thumbnail ||
    createDefaultThumbnailConfig(
      selectedProject?.seriesName || 'Tôi Thăng Cấp Một Mình',
      selectedProject?.chapterNumber || 1,
      pages[0]?.imageUrl || ''
    );

  const handleApplyTheme = (themeId: ThumbnailTheme) => {
    const theme = THUMBNAIL_THEMES[themeId];
    if (!theme) return;
    setThumbnailConfig({
      theme: theme.id,
      bgGradient: theme.bgGradient,
      glowColor: theme.glowColor,
      badge: theme.badge,
      badgeStyle: theme.badgeStyle,
      titleStyle: theme.titleStyle,
      overlayEffect: theme.overlayEffect,
      subtitle: `CHAPTER ${selectedProject?.chapterNumber || 1} • ${theme.defaultSubtitle}`,
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const series = selectedProject?.seriesName || 'Manga';
    const chap = selectedProject?.chapterNumber || 1;
    const ratio = currentThumbnail.aspectRatio === '9:16' ? '9x16-TikTok' : '16x9-YouTube';
    const fileName = `Thumbnail-${series.replace(/\s+/g, '')}-Chap${chap}-${ratio}.png`;

    try {
      await downloadThumbnailImage(currentThumbnail, fileName);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>, isSecondary: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (isSecondary) {
        setThumbnailConfig({ characterSecondaryImage: url });
      } else {
        setThumbnailConfig({ characterImage: url });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAIElement = (assetId: string) => {
    const asset = AI_PRESET_ASSETS.find((a) => a.id === assetId);
    if (!asset) return;

    const newElem: AIVisualElement = {
      id: `elem_${Date.now()}`,
      name: asset.name,
      url: `data:image/svg+xml;utf8,${encodeURIComponent(asset.svgContent)}`,
      x: 75,
      y: 50,
      scale: 1.0,
      opacity: 0.85,
      type: 'aura',
      blendMode: 'screen',
    };

    const currentElems = currentThumbnail.aiElements || [];
    setThumbnailConfig({ aiElements: [...currentElems, newElem] });
  };

  const handleRemoveAIElement = (elemId: string) => {
    const currentElems = currentThumbnail.aiElements || [];
    setThumbnailConfig({ aiElements: currentElems.filter((e) => e.id !== elemId) });
  };

  const toggleSticker = (sticker: string) => {
    const current = currentThumbnail.activeStickers || [];
    if (current.includes(sticker)) {
      setThumbnailConfig({ activeStickers: current.filter((s) => s !== sticker) });
    } else {
      setThumbnailConfig({ activeStickers: [...current, sticker] });
    }
  };

  const getAIPrompt = () => {
    const series = selectedProject?.seriesName || 'Solo Leveling Protagonist';
    return `Masterpiece, ultra high resolution 8K anime key visual of ${series}, glowing neon electric eyes, badass dynamic battle stance, holding glowing legendary weapon, dramatic dark lighting, cinematic volumetric aura, speed action lines, sharp details, detailed digital art wallpaper, octane render, trending on pixiv, highly saturated vibrant colors --ar 16:9 --v 6.0`;
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(getAIPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const isPortrait = currentThumbnail.aspectRatio === '9:16';
  const isSquare = currentThumbnail.aspectRatio === '1:1';

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 backdrop-blur border border-slate-800 p-3.5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black text-white flex items-center gap-2">
              <span>Studio Thiết Kế AI Thumbnail Siêu Ngầu</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-black tracking-wider uppercase">
                CTR Booster 3D
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Ghép ảnh nhân vật truyện, chèn luồng sét AI, ma pháp trận, hiệu ứng 3D viền vàng và sticker giật gân thu hút hàng triệu view.
            </p>
          </div>
        </div>

        {/* Aspect Ratio & Download Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Aspect Ratio Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setThumbnailConfig({ aspectRatio: '16:9' })}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                !isPortrait && !isSquare
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9 YouTube</span>
            </button>
            <button
              onClick={() => setThumbnailConfig({ aspectRatio: '9:16' })}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                isPortrait
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 TikTok</span>
            </button>
          </div>

          <button
            onClick={() => handleApplyTheme(currentThumbnail.theme || 'solo_awakening')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition-all active:scale-95"
            title="Tự động tối ưu lại theo phong cách truyện"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Auto Tối Ưu AI</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg shadow-pink-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Đang Render 4K...' : 'Tải Xuất Full HD (PNG)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left / Center: Live High-Impact Thumbnail Canvas Preview */}
        <div className="lg:col-span-8 space-y-3">
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl relative">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-200">
                  Live Canvas Preview ({isPortrait ? '1080 x 1920' : '1920 x 1080'})
                </span>
              </div>
              <span className="font-mono text-cyan-400 font-bold">
                {currentThumbnail.theme ? THUMBNAIL_THEMES[currentThumbnail.theme]?.name : 'Solo Awakening'}
              </span>
            </div>

            {/* Canvas Outer Box */}
            <div
              className={`relative mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-800/80 select-none group transition-all duration-300 ${
                isPortrait ? 'aspect-[9/16] max-w-sm' : 'aspect-video w-full'
              } bg-gradient-to-br ${currentThumbnail.bgGradient || 'from-slate-950 via-blue-950 to-cyan-950'}`}
              style={{
                filter: `brightness(${currentThumbnail.filterSettings?.brightness ?? 105}%) contrast(${
                  currentThumbnail.filterSettings?.contrast ?? 125
                }%) saturate(${currentThumbnail.filterSettings?.saturation ?? 130}%)`,
              }}
            >
              {/* 1. Ambient Glow Burst */}
              <div
                className="absolute right-10 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl opacity-40 pointer-events-none"
                style={{ backgroundColor: currentThumbnail.glowColor || '#06b6d4' }}
              />

              {/* 2. Secondary AI Monster / Opponent Silhouette Layer */}
              {currentThumbnail.characterSecondaryImage && (
                <img
                  src={currentThumbnail.characterSecondaryImage}
                  alt="Secondary Boss / Monster"
                  className="absolute right-12 bottom-4 h-[80%] max-w-[50%] object-contain opacity-50 mix-blend-screen pointer-events-none filter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                />
              )}

              {/* 3. AI Overlay Graphic Effects */}
              {currentThumbnail.overlayEffect === 'speed_lines' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                  style={{
                    backgroundImage: `repeating-conic-gradient(from 0deg at 70% 50%, rgba(255,255,255,0.4) 0deg 2deg, transparent 2deg 10deg)`,
                  }}
                />
              )}

              {currentThumbnail.overlayEffect === 'lightning_storm' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-75">
                  <svg className="w-full h-full" viewBox="0 0 400 225" fill="none">
                    <path
                      d="M160 0 L190 70 L170 85 L220 150 L195 160 L240 225"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      filter="drop-shadow(0 0 6px #06b6d4)"
                      opacity="0.9"
                    />
                    <path
                      d="M320 0 L340 50 L325 60 L360 120"
                      stroke="#67e8f9"
                      strokeWidth="2"
                      filter="drop-shadow(0 0 4px #38bdf8)"
                      opacity="0.8"
                    />
                  </svg>
                </div>
              )}

              {currentThumbnail.overlayEffect === 'flaming_embers' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute w-3 h-3 bg-amber-400 rounded-full blur-[1px] top-1/4 left-1/3 animate-ping opacity-60" />
                  <div className="absolute w-2 h-2 bg-orange-500 rounded-full blur-[1px] bottom-1/3 right-1/4 animate-pulse opacity-70" />
                  <div className="absolute w-4 h-4 bg-yellow-300 rounded-full blur-[2px] top-1/2 right-1/3 opacity-50" />
                </div>
              )}

              {currentThumbnail.overlayEffect === 'magic_runes' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-64 h-64 border-2 border-fuchsia-500/40 rounded-full flex items-center justify-center animate-spin-slow pointer-events-none">
                  <div className="w-48 h-48 border border-dashed border-pink-400/50 rounded-full" />
                </div>
              )}

              {currentThumbnail.overlayEffect === 'system_hud' && (
                <div className="absolute inset-2 border border-cyan-500/40 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-2 bg-cyan-500" />
                  <div className="absolute top-0 left-0 w-2 h-8 bg-cyan-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-2 bg-cyan-500" />
                  <div className="absolute bottom-0 right-0 w-2 h-8 bg-cyan-500" />
                  <span className="absolute top-2 right-3 text-[9px] font-mono font-bold text-cyan-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                    SYSTEM QUEST // SSS
                  </span>
                </div>
              )}

              {/* 4. Custom Inserted AI Visual Elements */}
              {currentThumbnail.aiElements?.map((elem) => (
                <img
                  key={elem.id}
                  src={elem.url}
                  alt={elem.name}
                  className="absolute pointer-events-none select-none transition-all"
                  style={{
                    left: `${elem.x}%`,
                    top: `${elem.y}%`,
                    transform: `translate(-50%, -50%) scale(${elem.scale})`,
                    opacity: elem.opacity,
                    mixBlendMode: (elem.blendMode as any) || 'screen',
                    maxWidth: '60%',
                    maxHeight: '60%',
                  }}
                />
              ))}

              {/* 5. Main Hero Character Image Cutout */}
              {currentThumbnail.characterImage && (
                <img
                  src={currentThumbnail.characterImage}
                  alt="Main Character"
                  className={`absolute bottom-0 object-contain transition-all duration-300 ${
                    currentThumbnail.characterPosition === 'left'
                      ? 'left-4'
                      : currentThumbnail.characterPosition === 'center'
                      ? 'left-1/2 -translate-x-1/2'
                      : 'right-2'
                  }`}
                  style={{
                    height: `${currentThumbnail.characterScale || 105}%`,
                    maxHeight: '98%',
                    filter: currentThumbnail.characterGlow
                      ? `drop-shadow(0 0 25px ${currentThumbnail.glowColor || '#38bdf8'}) drop-shadow(0 15px 20px rgba(0,0,0,0.9))`
                      : 'drop-shadow(0 15px 25px rgba(0,0,0,0.9))',
                    mixBlendMode: (currentThumbnail.characterBlend as any) || 'normal',
                  }}
                />
              )}

              {/* 6. Dark Vignette Rim */}
              <div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{
                  boxShadow: `inset 0 0 ${
                    (currentThumbnail.filterSettings?.vignette ?? 40) * 1.5
                  }px rgba(0,0,0,0.85)`,
                }}
              />

              {/* 7. Active Stickers Strip */}
              <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 max-w-[60%]">
                {currentThumbnail.activeStickers?.map((stk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-600/90 text-white font-black text-[10px] uppercase tracking-wider shadow-lg border border-red-400/40 backdrop-blur-sm transform -rotate-1"
                  >
                    {stk}
                  </span>
                ))}
              </div>

              {/* 8. 3D Glowing Text & High CTR Badge Overlay */}
              <div
                className={`absolute z-20 space-y-2 left-4 ${
                  isPortrait ? 'bottom-8 max-w-[92%]' : 'bottom-6 max-w-[62%]'
                }`}
              >
                {/* Slanted Badge */}
                {currentThumbnail.badge && (
                  <div className="inline-block transform -rotate-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg font-black text-xs md:text-sm uppercase tracking-wider shadow-2xl border ${
                        currentThumbnail.badgeStyle === 'neon_cyan'
                          ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-cyan-500/40'
                          : currentThumbnail.badgeStyle === 'blood_red'
                          ? 'bg-red-600 text-white border-red-300 shadow-red-600/50'
                          : currentThumbnail.badgeStyle === 'purple_void'
                          ? 'bg-purple-600 text-white border-purple-300 shadow-purple-600/50'
                          : currentThumbnail.badgeStyle === 'flaming_orange'
                          ? 'bg-orange-500 text-slate-950 border-orange-300 shadow-orange-500/50'
                          : currentThumbnail.badgeStyle === 'emerald_god'
                          ? 'bg-emerald-400 text-slate-950 border-emerald-200 shadow-emerald-500/40'
                          : 'bg-yellow-400 text-slate-950 border-yellow-200 shadow-yellow-500/50'
                      }`}
                    >
                      {currentThumbnail.badge}
                    </span>
                  </div>
                )}

                {/* 3D Extruded Title */}
                <h2
                  className={`font-black tracking-tight leading-none uppercase italic ${
                    isPortrait ? 'text-3xl' : 'text-3xl lg:text-5xl'
                  }`}
                  style={{
                    textShadow:
                      '0 1px 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 4px 0 #000, 0 6px 12px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)',
                    WebkitTextStroke: '2px #000000',
                  }}
                >
                  <span
                    className={
                      currentThumbnail.titleStyle === 'electric_blue'
                        ? 'bg-gradient-to-b from-cyan-200 via-sky-400 to-blue-600 bg-clip-text text-transparent'
                        : currentThumbnail.titleStyle === 'fiery_orange'
                        ? 'bg-gradient-to-b from-yellow-200 via-orange-400 to-red-600 bg-clip-text text-transparent'
                        : currentThumbnail.titleStyle === 'crimson_blood'
                        ? 'bg-gradient-to-b from-rose-200 via-red-500 to-rose-900 bg-clip-text text-transparent'
                        : currentThumbnail.titleStyle === 'toxic_green'
                        ? 'bg-gradient-to-b from-emerald-200 via-green-400 to-teal-700 bg-clip-text text-transparent'
                        : currentThumbnail.titleStyle === 'pure_white'
                        ? 'text-white'
                        : 'bg-gradient-to-b from-yellow-100 via-amber-400 to-yellow-600 bg-clip-text text-transparent'
                    }
                  >
                    {currentThumbnail.mainTitle}
                  </span>
                </h2>

                {/* High Contrast Subtitle */}
                {currentThumbnail.subtitle && (
                  <div className="inline-block bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 shadow-xl">
                    <p
                      className="text-xs md:text-sm font-black tracking-wide uppercase"
                      style={{ color: currentThumbnail.glowColor || '#67e8f9' }}
                    >
                      {currentThumbnail.subtitle}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Page Picker as Hero Cutout */}
            {pages && pages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Chọn Nhanh Trang Truyện Làm Nhân Vật Bìa ({pages.length} trang)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Click vào ảnh để gán làm Hero Thumbnail</span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {pages.map((p, idx) => (
                    <button
                      key={p.id || idx}
                      onClick={() => setThumbnailConfig({ characterImage: p.imageUrl })}
                      className={`relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden border-2 transition-all group ${
                        currentThumbnail.characterImage === p.imageUrl
                          ? 'border-pink-500 shadow-lg shadow-pink-500/30 scale-105'
                          : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.imageUrl} alt={`Trang ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-bold text-center py-0.5 text-white">
                        T.{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Comprehensive Multi-Tab Controls */}
        <div className="lg:col-span-4 space-y-3">
          {/* Navigation Control Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveControlTab('theme')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeControlTab === 'theme'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Chủ Đề & FX</span>
            </button>
            <button
              onClick={() => setActiveControlTab('character')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeControlTab === 'character'
                  ? 'bg-slate-800 text-pink-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ảnh AI & Hero</span>
            </button>
            <button
              onClick={() => setActiveControlTab('typography')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeControlTab === 'typography'
                  ? 'bg-slate-800 text-amber-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Chữ 3D</span>
            </button>
            <button
              onClick={() => setActiveControlTab('ai_prompt')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeControlTab === 'ai_prompt'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Prompt AI</span>
            </button>
          </div>

          {/* TAB 1: THEMES & VISUAL EFFECTS */}
          {activeControlTab === 'theme' && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-4">
              {/* Preset Manga Theme Grid */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Phong Cách Manga / Manhwa Siêu Ngầu</span>
                  </span>
                  <span className="text-[10px] text-slate-400">1-Click đổi toàn bộ</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THUMBNAIL_THEMES) as ThumbnailTheme[]).map((themeKey) => {
                    const t = THUMBNAIL_THEMES[themeKey];
                    const isSelected = currentThumbnail.theme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => handleApplyTheme(themeKey)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? `${t.accentBorder} bg-slate-800/90 shadow-md ring-1 ring-cyan-500`
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-black text-white truncate">{t.name.split('(')[0]}</span>
                          {isSelected && <Check className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                        </div>
                        <p className="text-[9px] text-slate-400 line-clamp-1">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Overlay FX Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hiệu Ứng Phủ (Overlay Effect)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'lightning_storm', label: '⚡ Bão Sét Neon' },
                    { id: 'speed_lines', label: '💥 Tia Tốc Độ Zoom' },
                    { id: 'flaming_embers', label: '🔥 Tàn Lửa Embers' },
                    { id: 'magic_runes', label: '🔮 Ma Pháp Trận' },
                    { id: 'system_hud', label: '🖥️ Khung Hệ Thống' },
                    { id: 'none', label: '🚫 Không Phủ' },
                  ].map((fx) => (
                    <button
                      key={fx.id}
                      onClick={() => setThumbnailConfig({ overlayEffect: fx.id as ThumbnailOverlayEffect })}
                      className={`p-2 rounded-lg border text-left font-bold text-[10px] transition-all ${
                        currentThumbnail.overlayEffect === fx.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fx.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Sliders */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Bộ Lọc Màu Điện Ảnh (Cinematic Grading)</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Độ Tương Phản (Contrast)</span>
                    <span className="font-mono text-cyan-400">
                      {currentThumbnail.filterSettings?.contrast ?? 125}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    value={currentThumbnail.filterSettings?.contrast ?? 125}
                    onChange={(e) =>
                      setThumbnailConfig({
                        filterSettings: {
                          brightness: currentThumbnail.filterSettings?.brightness ?? 105,
                          saturation: currentThumbnail.filterSettings?.saturation ?? 130,
                          vignette: currentThumbnail.filterSettings?.vignette ?? 40,
                          contrast: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Độ Rực Màu (Saturation)</span>
                    <span className="font-mono text-pink-400">
                      {currentThumbnail.filterSettings?.saturation ?? 130}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="200"
                    value={currentThumbnail.filterSettings?.saturation ?? 130}
                    onChange={(e) =>
                      setThumbnailConfig({
                        filterSettings: {
                          brightness: currentThumbnail.filterSettings?.brightness ?? 105,
                          contrast: currentThumbnail.filterSettings?.contrast ?? 125,
                          vignette: currentThumbnail.filterSettings?.vignette ?? 40,
                          saturation: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Tối Góc Kịch Tính (Vignette)</span>
                    <span className="font-mono text-amber-400">
                      {currentThumbnail.filterSettings?.vignette ?? 40}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={currentThumbnail.filterSettings?.vignette ?? 40}
                    onChange={(e) =>
                      setThumbnailConfig({
                        filterSettings: {
                          brightness: currentThumbnail.filterSettings?.brightness ?? 105,
                          contrast: currentThumbnail.filterSettings?.contrast ?? 125,
                          saturation: currentThumbnail.filterSettings?.saturation ?? 130,
                          vignette: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHARACTER & AI LAYERS */}
          {activeControlTab === 'character' && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-4">
              {/* Main Hero Controls */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Ảnh Nhân Vật Chính (Main Hero Cutout)</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-bold"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Tải Ảnh Lên</span>
                  </button>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleCustomUpload(e, false)}
                  accept="image/*"
                  className="hidden"
                />

                {/* Character Position & Scale */}
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                  {(['right', 'center', 'left'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setThumbnailConfig({ characterPosition: pos })}
                      className={`py-1.5 rounded-lg border text-center uppercase transition-all ${
                        currentThumbnail.characterPosition === pos
                          ? 'border-pink-500 bg-pink-950/40 text-pink-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pos === 'right' ? 'Phải' : pos === 'center' ? 'Giữa' : 'Trái'}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Kích Thước Nhân Vật (Scale)</span>
                    <span className="font-mono text-pink-400">{currentThumbnail.characterScale || 105}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="150"
                    value={currentThumbnail.characterScale || 105}
                    onChange={(e) => setThumbnailConfig({ characterScale: Number(e.target.value) })}
                    className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300">Viền Hào Quang Sáng (Glow Rim)</span>
                  <input
                    type="checkbox"
                    checked={currentThumbnail.characterGlow ?? true}
                    onChange={(e) => setThumbnailConfig({ characterGlow: e.target.checked })}
                    className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Secondary AI Boss / Monster Layer */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300">Ảnh Trùm / Quái Vật AI Phía Sau</label>
                  <button
                    onClick={() => secondaryFileInputRef.current?.click()}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Tải Lên</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={secondaryFileInputRef}
                  onChange={(e) => handleCustomUpload(e, true)}
                  accept="image/*"
                  className="hidden"
                />

                {currentThumbnail.characterSecondaryImage && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-300 truncate max-w-[200px]">Đã nạp ảnh nền phụ</span>
                    <button
                      onClick={() => setThumbnailConfig({ characterSecondaryImage: '' })}
                      className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Built-in AI Vector Element Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Thư Viện Hào Quang & Ma Pháp Trận AI</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Chèn vào ảnh</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {AI_PRESET_ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => handleAddAIElement(asset.id)}
                      className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-cyan-500/60 text-left transition-all group"
                    >
                      <div className="w-full h-12 bg-slate-950/80 rounded-lg flex items-center justify-center overflow-hidden mb-1.5 border border-slate-800/60">
                        <img src={asset.thumbnailUrl} alt={asset.name} className="h-8 object-contain" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Layer Elements Manager */}
                {currentThumbnail.aiElements && currentThumbnail.aiElements.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-400">Các Layer Đang Chèn:</span>
                    {currentThumbnail.aiElements.map((elem) => (
                      <div
                        key={elem.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      >
                        <span className="text-[11px] text-white font-bold">{elem.name}</span>
                        <button
                          onClick={() => handleRemoveAIElement(elem.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY & CTR STICKERS */}
          {activeControlTab === 'typography' && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3.5">
              {/* Title Style Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300">Phong Cách Chữ 3D Nổi Bật</label>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                  {[
                    { id: 'gold_3d', label: '👑 Vàng Kim 3D' },
                    { id: 'electric_blue', label: '⚡ Xanh Sét Neon' },
                    { id: 'fiery_orange', label: '🔥 Cam Lửa Bùng Cháy' },
                    { id: 'crimson_blood', label: '🩸 Huyết Nguyệt Đỏ' },
                    { id: 'toxic_green', label: '💎 Xanh Ngọc Hệ Thống' },
                    { id: 'pure_white', label: '🤍 Trắng Tinh Điện Ảnh' },
                  ].map((ts) => (
                    <button
                      key={ts.id}
                      onClick={() => setThumbnailConfig({ titleStyle: ts.id as ThumbnailTitleStyle })}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        currentThumbnail.titleStyle === ts.id
                          ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ts.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Inputs */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300">Huy Hiệu Gây Tò Mò (Badge)</label>
                  <input
                    type="text"
                    value={currentThumbnail.badge}
                    onChange={(e) => setThumbnailConfig({ badge: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300">Tiêu Đề Lớn (Main Title)</label>
                  <input
                    type="text"
                    value={currentThumbnail.mainTitle}
                    onChange={(e) => setThumbnailConfig({ mainTitle: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 font-black uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300">Phụ Đề Kích Thích (Subtitle)</label>
                  <input
                    type="text"
                    value={currentThumbnail.subtitle}
                    onChange={(e) => setThumbnailConfig({ subtitle: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              {/* High-CTR Stickers Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Sticker Giật Gân Tăng Click (CTR Booster)</span>
                  <span className="text-[10px] text-slate-400">Click để bật/tắt</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CTR_STICKERS.map((stk) => {
                    const isChecked = currentThumbnail.activeStickers?.includes(stk);
                    return (
                      <button
                        key={stk}
                        onClick={() => toggleSticker(stk)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                          isChecked
                            ? 'bg-red-600 border-red-400 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {stk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI PROMPT GENERATOR */}
          {activeControlTab === 'ai_prompt' && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Prompt Sinh Ảnh AI 8K Wallpaper</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Copy prompt bên dưới và dán vào Midjourney, Stable Diffusion, DALL-E 3 hoặc Fal.ai để tạo ảnh nhân vật bìa chất lượng điện ảnh chuẩn 1920x1080:
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 break-words leading-relaxed select-all">
                {getAIPrompt()}
              </div>

              <button
                onClick={copyPromptToClipboard}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPrompt ? 'Đã Sao Chép Prompt!' : 'Sao Chép Prompt AI'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
