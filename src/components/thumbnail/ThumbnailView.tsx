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
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  X,
  ImagePlus,
  TrendingUp,
  Video,
  Award,
  ExternalLink,
} from 'lucide-react';
import {
  THUMBNAIL_THEMES,
  AI_PRESET_ASSETS,
  CTR_STICKERS,
  VIRAL_TITLE_TEMPLATES,
  PROGRESSION_BADGES,
  YOUTUBE_CHANNELS_BENCHMARK,
  ViralTitleTemplate,
  YouTubeChannelBenchmark,
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

  const [activeControlTab, setActiveControlTab] = useState<'theme' | 'character' | 'typography' | 'viral_research' | 'ai_prompt'>('character');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputText, setUrlInputText] = useState('');
  const [showMobileView, setShowMobileView] = useState(false);
  const [showViralModal, setShowViralModal] = useState(false);
  const [selectedViralCategory, setSelectedViralCategory] = useState<string>('all');
  const [activeViralSubTab, setActiveViralSubTab] = useState<'templates' | 'channels'>('templates');
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<number | null>(null);
  
  // Custom uploaded or pasted external images
  const [customImages, setCustomImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tuna_custom_thumb_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  const externalPanelInputRef = useRef<HTMLInputElement>(null);

  // Fallback initialize if thumbnail is null
  const currentThumbnail =
    thumbnail ||
    createDefaultThumbnailConfig(
      selectedProject?.seriesName || 'Tôi Thăng Cấp Một Mình',
      selectedProject?.chapterNumber || 1,
      pages[0]?.imageUrl || ''
    );

  const saveCustomImages = (newImages: string[]) => {
    setCustomImages(newImages);
    try {
      localStorage.setItem('tuna_custom_thumb_images', JSON.stringify(newImages));
    } catch (e) {}
  };

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

  // Upload an external image directly into the gallery & active collage
  const handleUploadExternalPanel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (!url) return;
      
      const updated = [url, ...customImages.filter(i => i !== url)];
      saveCustomImages(updated);

      // Automatically add to active collage if space allows
      const currentImages = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
      if (currentImages.length < 4) {
        setThumbnailConfig({ characterImages: [...currentImages, url] });
      } else {
        const newImages = [...currentImages];
        newImages[newImages.length - 1] = url;
        setThumbnailConfig({ characterImages: newImages });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add external image from direct URL
  const handleAddUrlImage = () => {
    const trimmed = urlInputText.trim();
    if (!trimmed) return;
    
    const updated = [trimmed, ...customImages.filter(i => i !== trimmed)];
    saveCustomImages(updated);

    const currentImages = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
    if (currentImages.length < 4) {
      setThumbnailConfig({ characterImages: [...currentImages, trimmed] });
    } else {
      const newImages = [...currentImages];
      newImages[newImages.length - 1] = trimmed;
      setThumbnailConfig({ characterImages: newImages });
    }

    setUrlInputText('');
    setShowUrlInput(false);
  };

  const handleDeleteCustomImage = (url: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = customImages.filter(i => i !== url);
    saveCustomImages(updated);

    const currentImages = currentThumbnail.characterImages || [];
    if (currentImages.includes(url)) {
      setThumbnailConfig({ characterImages: currentImages.filter(i => i !== url) });
    }
  };

  const handleAddAIElement = (assetId: string) => {
    const asset = AI_PRESET_ASSETS.find((a) => a.id === assetId);
    if (!asset) return;

    const newElem: AIVisualElement = {
      id: `elem_${Date.now()}`,
      name: asset.name,
      url: `data:image/svg+xml;utf8,${encodeURIComponent(asset.svgContent)}`,
      x: 50,
      y: 40,
      scale: 1.0,
      opacity: 0.9,
      type: 'aura',
      blendMode: 'normal',
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

  const toggleCharacterImage = (url: string) => {
    const currentImages = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
    if (currentImages.includes(url)) {
      setThumbnailConfig({ characterImages: currentImages.filter(i => i !== url) });
    } else {
      if (currentImages.length < 4) {
        setThumbnailConfig({ characterImages: [...currentImages, url] });
      } else {
        const newImages = [...currentImages];
        newImages[3] = url;
        setThumbnailConfig({ characterImages: newImages });
      }
    }
  };

  // Reorder slots in the collage
  const handleReorderSlot = (index: number, direction: 'left' | 'right') => {
    const currentImages = [...(currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []))];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    const temp = currentImages[index];
    currentImages[index] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;
    setThumbnailConfig({ characterImages: currentImages });
  };

  const handleRemoveSlot = (index: number) => {
    const currentImages = [...(currentThumbnail.characterImages || [])];
    currentImages.splice(index, 1);
    setThumbnailConfig({ characterImages: currentImages });
  };

  // Set focal point (top, center, bottom) for a specific slot
  const handleSetSlotFocus = (index: number, focus: 'top' | 'center' | 'bottom') => {
    const currentFocus = [...(currentThumbnail.slotFocus || [])];
    currentFocus[index] = focus;
    setThumbnailConfig({ slotFocus: currentFocus });
  };

  // Set zoom scale (1.0 to 1.8) for a specific slot
  const handleSetSlotZoom = (index: number, zoom: number) => {
    const currentZooms = [...(currentThumbnail.slotZooms || [])];
    currentZooms[index] = zoom;
    setThumbnailConfig({ slotZooms: currentZooms });
  };

  // Apply viral template (1-Click YouTube Formula)
  const handleApplyViralTemplate = (template: ViralTitleTemplate) => {
    const theme = THUMBNAIL_THEMES[template.theme] || THUMBNAIL_THEMES.solo_awakening;
    setThumbnailConfig({
      mainTitle: template.title,
      subtitle: template.subtitle,
      badge: template.badge,
      theme: template.theme,
      bgGradient: theme.bgGradient,
      glowColor: theme.glowColor,
      badgeStyle: theme.badgeStyle,
      titleStyle: template.titleStyle,
      overlayEffect: theme.overlayEffect,
      progressionBadge: template.progressionBadge || currentThumbnail.progressionBadge,
    });
    setShowViralModal(false);
  };

  // Preset Layout Selector (1 to 4 panels)
  const handleSetLayoutPreset = (count: number) => {
    const allAvailable = [
      ...customImages,
      ...(pages || []).map(p => p.imageUrl),
    ];
    if (allAvailable.length === 0) return;
    const selected = allAvailable.slice(0, count);
    setThumbnailConfig({ characterImages: selected });
  };

  const getAIPrompt = () => {
    const series = selectedProject?.seriesName || 'Epic Manga Protagonist';
    const theme = currentThumbnail.theme || 'solo_awakening';

    if (theme === 'tutien_mahoang' || theme === 'golden_immortal') {
      return `Masterpiece, ultra high resolution 8K oriental fantasy key visual of ${series}, ancient handsome cultivation grandmaster in flowing silk robes, glowing golden dragon aura swirling around body, floating celestial spirit swords, dramatic misty mountains background, intense martial gaze, highly detailed digital painting, trending on ArtStation, octane render --ar 16:9 --v 6.0`;
    }
    if (theme === 'dark_monarch') {
      return `Masterpiece, 8K dark fantasy manhwa key visual of ${series}, intimidating Shadow Monarch with glowing electric purple eyes, surrounded by rising black mist and legion of armored undead shadow soldiers, sharp dynamic battle stance, obsidian dagger, volumetric dark lighting, cinematic octane render --ar 16:9 --v 6.0`;
    }
    if (theme === 'haihuoc_su_muoi') {
      return `Masterpiece, 8K anime key visual of ${series}, extremely beautiful waifu anime girl with subtle red dragon horns, cute shy blushing expression yet holding massive flaming warhammer, vibrant pink and orange sunset lighting, hyper-detailed anime illustration, trending on pixiv --ar 16:9 --v 6.0`;
    }
    if (theme === 'boss_nhatu') {
      return `Masterpiece, 8K gritty action manhwa illustration of ${series}, cold-blooded badass chemistry teacher secretly feared as the most dangerous maximum-security prison boss, wearing suit with glowing blood-red eyes, shattered neon glass background, dramatic high contrast shadows --ar 16:9 --v 6.0`;
    }
    if (theme === 'nguyento_vodich') {
      return `Masterpiece, 8K epic fantasy artwork of ${series}, all-powerful elemental archmage simultaneously summoning blazing inferno, freezing glacial frost, and crackling cyan lightning storm, glowing elemental runes encircling hands, high dynamic range --ar 16:9 --v 6.0`;
    }
    if (theme === 'chuyensinh_bochet') {
      return `Masterpiece, 8K comedic fantasy anime illustration of ${series}, microscopic mutant beast leveling up into an apex predator, glowing neon green toxic venom aura, dynamic funny shock manga expression, high details --ar 16:9 --v 6.0`;
    }
    if (theme === 'dothi_gianghe') {
      return `Masterpiece, 8K modern urban manhwa visual of ${series}, ultra wealthy CEO protagonist revealing true overpowered identity, glowing golden aura, luxury skyscrapers night city backdrop, confident smug smile, sharp black suit --ar 16:9 --v 6.0`;
    }

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

          {/* 1-Click Viral Formula & Mobile Simulator */}
          <button
            onClick={() => setShowViralModal(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            title="Kho mẫu tiêu đề và concept giật gân đã được chứng minh viral trên YouTube"
          >
            <Flame className="w-3.5 h-3.5 text-slate-950 fill-current" />
            <span>Tiêu Đề Triệu View (1-Click)</span>
          </button>

          <button
            onClick={() => setShowMobileView(!showMobileView)}
            className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              showMobileView
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Mô phỏng kích thước thu nhỏ trên app YouTube điện thoại di động"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showMobileView ? 'Tắt Giả Lập Mobile' : 'Xem Thử Mobile'}</span>
          </button>

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

      {/* VIRAL TITLE & CHANNEL RESEARCH MODAL */}
      {showViralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[88vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-md">
                  <Flame className="w-4 h-4 text-slate-950 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Kho Dữ Liệu Thumbnail & Tiêu Đề Triệu View YouTube</span>
                    <span className="text-[10px] bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-800">
                      vidIQ Verified
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Phân tích từ top kênh recap hàng đầu: Sắn Review, Gấu Xàm Anime, Bé Khôi, Tỷ Tỷ, Mèo Cày, DuuDey...
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViralModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub Tabs: Templates vs Channels */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <button
                onClick={() => setActiveViralSubTab('templates')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  activeViralSubTab === 'templates'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>25+ Mẫu Tiêu Đề & Concept Triệu View</span>
              </button>
              <button
                onClick={() => setActiveViralSubTab('channels')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  activeViralSubTab === 'channels'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Top Kênh YouTube Benchmark</span>
              </button>
            </div>

            {/* TAB CONTENT 1: VIRAL TITLE TEMPLATES */}
            {activeViralSubTab === 'templates' && (
              <div className="space-y-3">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {[
                    { id: 'all', label: '⚡ Tất Cả Mẫu' },
                    { id: 'fulldai', label: '🏆 Full Bộ 10h+ (Sắn/Bé Khôi)' },
                    { id: 'tutien', label: '🐉 Tu Tiên / Ma Hoàng' },
                    { id: 'thosan', label: '⚡ Thợ Săn / Bug Game' },
                    { id: 'harem', label: '🌸 Sư Muội / Waifu' },
                    { id: 'dothi', label: '💼 Đô Thị / Chủ Tịch' },
                    { id: 'baothu', label: '🩸 Báo Thù Rửa Hận' },
                    { id: 'shorts', label: '🦗 Shorts Triệu View' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedViralCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold flex-shrink-0 transition-all ${
                        selectedViralCategory === cat.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60'
                          : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {VIRAL_TITLE_TEMPLATES.filter(
                    (tmpl) => selectedViralCategory === 'all' || tmpl.category === selectedViralCategory
                  ).map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-amber-500/70 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-400 uppercase tracking-wider bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                            {tmpl.categoryLabel}
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                            {tmpl.viewsEstimate && (
                              <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                {tmpl.viewsEstimate}
                              </span>
                            )}
                            {tmpl.durationLabel && (
                              <span className="text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded">
                                {tmpl.durationLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-xs font-black text-white group-hover:text-amber-300 leading-snug">
                          {tmpl.title}
                        </h4>
                        <p className="text-[10px] text-slate-300 font-medium line-clamp-2">
                          {tmpl.subtitle}
                        </p>
                        
                        {tmpl.hookExplanation && (
                          <p className="text-[9px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                            💡 {tmpl.hookExplanation}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                        <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/60 font-bold">
                          {tmpl.badge}
                        </span>
                        <button
                          onClick={() => handleApplyViralTemplate(tmpl)}
                          className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow transition-all active:scale-95 text-[10px]"
                        >
                          <span>1-Click Áp Dụng</span>
                          <span>➔</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: YOUTUBE CHANNELS BENCHMARK */}
            {activeViralSubTab === 'channels' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Tổng hợp phong cách làm thumbnail và định dạng video của các kênh review truyện hàng đầu Việt Nam:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {YOUTUBE_CHANNELS_BENCHMARK.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2.5 hover:border-cyan-500/60 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center font-black text-xs text-cyan-300">
                            {ch.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white flex items-center gap-1">
                              <span>{ch.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{ch.handle}</span>
                            </h4>
                            <span className="text-[9px] text-cyan-400 font-bold">{ch.genreFocus}</span>
                          </div>
                        </div>

                        <div className="text-right text-[10px] font-mono">
                          <span className="text-emerald-400 font-bold block">{ch.subs} subs</span>
                          <span className="text-slate-400">{ch.totalViews} views</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 space-y-1 text-[10px]">
                        <div className="text-slate-300">
                          <span className="font-bold text-amber-400">🔥 Video Tiêu Biểu:</span> {ch.hitVideoTitle}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[9px]">
                          <span className="text-emerald-400 font-bold">{ch.hitViews}</span>
                          <span>•</span>
                          <span>Độ dài: {ch.hitDuration}</span>
                        </div>
                        <div className="text-slate-400 pt-1 border-t border-slate-800 text-[9px]">
                          <span className="font-bold text-slate-300">🎨 Style Thumbnail:</span> {ch.thumbnailStyle}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleApplyTheme(ch.recommendedTheme);
                          setShowViralModal(false);
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-slate-300 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Áp Dụng Style Thumbnail Kênh Này</span>
                        <span>➔</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              {/* Multi-Character Background Layout with Crisp Dividers & Slot Focal Points */}
              {(() => {
                const images = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
                if (images.length === 0) return null;
                return (
                  <div className="absolute inset-0 flex">
                    {images.map((imgUrl, i) => {
                      const focus = currentThumbnail.slotFocus?.[i] || 'top';
                      const zoom = currentThumbnail.slotZooms?.[i] || 1.0;
                      const objPos = focus === 'center' ? 'object-center' : focus === 'bottom' ? 'object-bottom' : 'object-top';

                      return (
                        <div key={i} className="flex-1 h-full relative overflow-hidden border-r-2 md:border-r-4 border-black shadow-[0_0_12px_rgba(0,0,0,0.8)] last:border-r-0">
                          <img
                            src={imgUrl}
                            alt={`Character panel ${i + 1}`}
                            className={`w-full h-full object-cover ${objPos} transition-transform duration-200`}
                            style={{
                              transform: `scale(${zoom})`,
                              filter: `brightness(${currentThumbnail.filterSettings?.brightness ?? 105}%) contrast(${
                                currentThumbnail.filterSettings?.contrast ?? 125
                              }%) saturate(${currentThumbnail.filterSettings?.saturation ?? 130}%)`,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Progression Badge (Top-Right Evolution) */}
              {currentThumbnail.progressionBadge && (
                <div className="absolute top-3 right-3 z-20">
                  <div className="bg-slate-950/90 text-amber-300 font-black text-[11px] md:text-xs px-2.5 py-1 rounded-lg border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] uppercase tracking-wider">
                    {currentThumbnail.progressionBadge}
                  </div>
                </div>
              )}

              {/* Overlay FX Graphic Layer */}
              {currentThumbnail.overlayEffect === 'speed_lines' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen"
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
                      strokeWidth="3"
                      filter="drop-shadow(0 0 6px #06b6d4)"
                      opacity="0.9"
                    />
                    <path
                      d="M320 0 L340 50 L325 60 L360 120"
                      stroke="#67e8f9"
                      strokeWidth="2.5"
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
                <div className="absolute inset-2 border-2 border-cyan-500/40 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-2 bg-cyan-500" />
                  <div className="absolute top-0 left-0 w-2 h-8 bg-cyan-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-2 bg-cyan-500" />
                  <div className="absolute bottom-0 right-0 w-2 h-8 bg-cyan-500" />
                  <span className="absolute top-2 right-3 text-[9px] font-mono font-bold text-cyan-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                    SYSTEM QUEST // SSS
                  </span>
                </div>
              )}

              {/* Custom AI Visual Elements (Floating Skill Cards, Hologram, Red Arrow) */}
              {currentThumbnail.aiElements?.map((elem) => (
                <img
                  key={elem.id}
                  src={elem.url}
                  alt={elem.name}
                  className="absolute pointer-events-none select-none transition-all z-10"
                  style={{
                    left: `${elem.x}%`,
                    top: `${elem.y}%`,
                    transform: `translate(-50%, -50%) scale(${elem.scale || 1.0})`,
                    opacity: elem.opacity ?? 0.9,
                    mixBlendMode: (elem.blendMode as any) || 'normal',
                    maxWidth: '45%',
                    maxHeight: '45%',
                  }}
                />
              ))}

              {/* Bottom Gradient Overlay */}
              <div 
                className="absolute inset-x-0 bottom-0 h-[48%] pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
                }}
              />

              {/* Chapter Pill (Top-Left) */}
              <div className="absolute top-3 left-3 z-20">
                <div className="bg-red-600 text-white font-black text-xs md:text-sm px-2.5 py-0.5 rounded-md shadow-[0_0_12px_rgba(220,38,38,0.8)] border border-white/30 tracking-wider uppercase">
                  {currentThumbnail.badge || `1 - ${selectedProject?.chapterNumber || 9}`}
                </div>
              </div>

              {/* Giant Bottom Text Title (YouTube Recap Style) */}
              <div className="absolute inset-x-0 bottom-4 z-20 px-3 flex flex-col items-center text-center">
                <h2
                  className="font-black uppercase w-full tracking-tight"
                  style={{
                    fontSize: isPortrait ? '2.2rem' : 'clamp(1.8rem, 4.2vw, 3.8rem)',
                    lineHeight: '1.05',
                    WebkitTextStroke: '3.5px #000000',
                    color: currentThumbnail.titleStyle === 'fiery_orange' ? '#fbbf24' : currentThumbnail.titleStyle === 'crimson_blood' ? '#ef4444' : currentThumbnail.titleStyle === 'neon_cyan' ? '#38bdf8' : '#ffffff',
                    textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 8px 16px rgba(0,0,0,0.8)',
                  }}
                >
                  {currentThumbnail.mainTitle}
                </h2>
                {currentThumbnail.subtitle && (
                  <p
                    className="font-black uppercase mt-0.5 tracking-tight"
                    style={{
                      fontSize: isPortrait ? '1.3rem' : 'clamp(1.1rem, 2.5vw, 2.2rem)',
                      WebkitTextStroke: '2.5px #000000',
                      color: currentThumbnail.titleStyle === 'fiery_orange' ? '#ffffff' : currentThumbnail.glowColor || '#fbbf24',
                      textShadow: '0 3px 6px rgba(0,0,0,0.9)',
                    }}
                  >
                    {currentThumbnail.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Multi-Source Image Picker Strip (Manga Pages + Custom Uploads) */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kho Ảnh Ghép Thumbnail ({pages.length + customImages.length} ảnh)</span>
                  <span className="text-[10px] text-pink-400 bg-pink-950/60 px-1.5 py-0.2 rounded border border-pink-800/50">
                    Đã chọn: {(currentThumbnail.characterImages || []).length || 1}/4
                  </span>
                </span>
                
                {/* Upload & URL Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => externalPanelInputRef.current?.click()}
                    className="flex items-center gap-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md transition-all active:scale-95"
                    title="Tải ảnh PNG/JPG ngoài từ máy tính vào khung ghép"
                  >
                    <ImagePlus className="w-3 h-3" />
                    <span>+ Tải Ảnh Ngoài</span>
                  </button>
                  <input
                    type="file"
                    ref={externalPanelInputRef}
                    onChange={handleUploadExternalPanel}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] px-2 py-1 rounded-lg border border-slate-700 transition-all"
                    title="Dán đường dẫn ảnh trên mạng (Pinterest, Google, AI)"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>+ Dán Link URL</span>
                  </button>

                  <button
                    onClick={() => setThumbnailConfig({ characterImages: [] })}
                    className="text-slate-400 hover:text-white text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800"
                    title="Bỏ chọn toàn bộ khung ảnh"
                  >
                    Bỏ Chọn
                  </button>
                </div>
              </div>

              {/* Inline URL Input Box */}
              {showUrlInput && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-cyan-500/40 animate-in fade-in duration-200">
                  <input
                    type="url"
                    placeholder="Dán link ảnh trực tiếp (https://...jpg, png, webp)..."
                    value={urlInputText}
                    onChange={(e) => setUrlInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrlImage()}
                    className="flex-1 bg-slate-950 text-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    onClick={handleAddUrlImage}
                    className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg transition-all"
                  >
                    Thêm Ảnh
                  </button>
                  <button
                    onClick={() => setShowUrlInput(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Image Horizontal Scroll Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {/* 1. Custom Uploaded External Images (Highlighted with Purple/Pink Border) */}
                {customImages.map((imgUrl, cIdx) => {
                  const currentImages = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
                  const isSelected = currentImages.includes(imgUrl);
                  return (
                    <div key={`custom-${cIdx}`} className="relative flex-shrink-0 group">
                      <button
                        onClick={() => toggleCharacterImage(imgUrl)}
                        className={`w-18 h-24 rounded-lg overflow-hidden border-2 transition-all block relative ${
                          isSelected
                            ? 'border-purple-400 shadow-lg shadow-purple-500/40 scale-105 ring-2 ring-purple-400/50'
                            : 'border-purple-700/60 hover:border-purple-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Custom ${cIdx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-0 inset-x-0 bg-purple-900/90 text-[8px] font-black text-center py-0.5 text-purple-200 uppercase">
                          Ảnh Ngoài
                        </span>
                        {isSelected && (
                          <div className="absolute bottom-1 right-1 bg-purple-500 text-white rounded-full p-0.5 shadow-lg">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomImage(imgUrl, e)}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-500 z-10"
                        title="Xóa ảnh ngoài này khỏi thư viện"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}

                {/* 2. Manga Chapter Pages */}
                {pages.map((p, idx) => {
                  const currentImages = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
                  const isSelected = currentImages.includes(p.imageUrl);
                  return (
                    <button
                      key={p.id || idx}
                      onClick={() => toggleCharacterImage(p.imageUrl)}
                      className={`relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden border-2 transition-all group ${
                        isSelected
                          ? 'border-pink-500 shadow-lg shadow-pink-500/30 scale-105'
                          : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.imageUrl} alt={`Trang ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-bold text-center py-0.5 text-white">
                        T.{idx + 1}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5 shadow-lg">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* YOUTUBE MOBILE FEED SIMULATOR (A/B Test Mobile Readability) */}
            {showMobileView && (
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/50 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs text-cyan-300 font-black">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Giả Lập Màn Hình YouTube Mobile App (Kiểm Tra Độ Đọc Text 160px)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Mobile CTR Audit</span>
                </div>

                {/* Mobile Card Mockup */}
                <div className="max-w-[340px] mx-auto bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                  {/* Miniature Thumbnail */}
                  <div className="aspect-video w-full relative overflow-hidden bg-slate-900">
                    {/* Background Images */}
                    {(() => {
                      const images = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
                      if (images.length === 0) return null;
                      return (
                        <div className="absolute inset-0 flex">
                          {images.map((imgUrl, i) => (
                            <div key={i} className="flex-1 h-full relative overflow-hidden border-r border-black last:border-r-0">
                              <img
                                src={imgUrl}
                                alt={`Mini ${i + 1}`}
                                className="w-full h-full object-cover object-top"
                                style={{
                                  filter: `brightness(${currentThumbnail.filterSettings?.brightness ?? 105}%) contrast(${
                                    currentThumbnail.filterSettings?.contrast ?? 125
                                  }%)`,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Gradient */}
                    <div 
                      className="absolute inset-x-0 bottom-0 h-[48%] pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)' }}
                    />

                    {/* Pill */}
                    <div className="absolute top-1.5 left-1.5 z-20">
                      <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded">
                        {currentThumbnail.badge || '1-9'}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="absolute inset-x-0 bottom-1 z-20 px-1 text-center">
                      <h4
                        className="font-black uppercase text-[12px] truncate"
                        style={{
                          WebkitTextStroke: '1.5px black',
                          color: currentThumbnail.titleStyle === 'fiery_orange' ? '#fbbf24' : '#ffffff',
                        }}
                      >
                        {currentThumbnail.mainTitle}
                      </h4>
                    </div>
                  </div>

                  {/* YouTube Video Info */}
                  <div className="p-2.5 flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center font-black text-[10px] text-white flex-shrink-0">
                      TR
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                        {currentThumbnail.mainTitle} - {currentThumbnail.subtitle} | Review Truyện Bá Đạo
                      </h5>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        TunaRecap Studio • 1.4M lượt xem • 2 ngày trước
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Comprehensive Multi-Tab Controls */}
        <div className="lg:col-span-4 space-y-3">
          {/* Navigation Control Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => setActiveControlTab('character')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeControlTab === 'character'
                  ? 'bg-slate-800 text-pink-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Khung</span>
            </button>
            <button
              onClick={() => setActiveControlTab('theme')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeControlTab === 'theme'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3 h-3" />
              <span>Chủ Đề</span>
            </button>
            <button
              onClick={() => setActiveControlTab('typography')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeControlTab === 'typography'
                  ? 'bg-slate-800 text-amber-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3 h-3" />
              <span>Chữ 3D</span>
            </button>
            <button
              onClick={() => setActiveControlTab('viral_research')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeControlTab === 'viral_research'
                  ? 'bg-slate-800 text-orange-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Trend YT</span>
            </button>
            <button
              onClick={() => setActiveControlTab('ai_prompt')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeControlTab === 'ai_prompt'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>Prompt</span>
            </button>
          </div>

          {/* TAB 1: CHARACTER & COLLAGE SLOTS */}
          {activeControlTab === 'character' && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-4">
              {/* Preset Layout Styles (1 to 4 Panels) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Bố Cục Ghép Khung (1 - 4 Nhân Vật)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">1-Click đổi kiểu</span>
                </label>

                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                  {[
                    { count: 1, label: '1 Khung Solo', desc: 'Ảnh chính bao trọn' },
                    { count: 2, label: '2 Khung Đối Đầu', desc: 'MC vs Đối Thủ' },
                    { count: 3, label: '3 Khung Triệu View', desc: 'Chuẩn YouTube recap' },
                    { count: 4, label: '4 Khung Dàn Nhân Vật', desc: 'Harem / Bang Hội' },
                  ].map((preset) => {
                    const currentCount = (currentThumbnail.characterImages || []).length || 1;
                    const isSelected = currentCount === preset.count;
                    return (
                      <button
                        key={preset.count}
                        onClick={() => handleSetLayoutPreset(preset.count)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-950/40 text-pink-300 ring-1 ring-pink-500'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span>{preset.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-pink-400" />}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">{preset.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Collage Slots Manager with Focal Point & Zoom */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>Chỉnh Tiêu Cự & Vị Trí Khung:</span>
                  <button
                    onClick={() => externalPanelInputRef.current?.click()}
                    className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm Ảnh Ngoài</span>
                  </button>
                </div>

                {/* Slots List */}
                {(() => {
                  const slots = currentThumbnail.characterImages || (currentThumbnail.characterImage ? [currentThumbnail.characterImage] : []);
                  if (slots.length === 0) {
                    return (
                      <div className="p-3 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                        Chưa chọn ảnh nào. Bấm vào ảnh bên dưới hoặc nút "Thêm Ảnh Ngoài" để ghép vào thumbnail.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {slots.map((slotUrl, sIdx) => {
                        const focus = currentThumbnail.slotFocus?.[sIdx] || 'top';
                        const zoom = currentThumbnail.slotZooms?.[sIdx] || 1.0;
                        const isEditingThis = selectedSlotForEdit === sIdx;

                        return (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-pink-950 text-pink-300 border border-pink-800/60 font-mono font-black text-[10px] flex items-center justify-center flex-shrink-0">
                                  #{sIdx + 1}
                                </span>
                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                                  <img src={slotUrl} alt={`Khung ${sIdx + 1}`} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] text-slate-300 font-bold truncate">
                                  {customImages.includes(slotUrl) ? 'Ảnh Tải Ngoài' : `Trang Truyện`}
                                </span>
                              </div>

                              {/* Action Buttons: Move Left, Move Right, Remove */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleReorderSlot(sIdx, 'left')}
                                  disabled={sIdx === 0}
                                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                                  title="Đổi sang trái"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleReorderSlot(sIdx, 'right')}
                                  disabled={sIdx === slots.length - 1}
                                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                                  title="Đổi sang phải"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveSlot(sIdx)}
                                  className="p-1 rounded bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/40 ml-1"
                                  title="Xóa khung này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Slot Focal Point Alignment & Zoom Bar */}
                            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[10px]">
                              {/* Focus Buttons */}
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 font-bold mr-1">Căn:</span>
                                {[
                                  { id: 'top', label: 'Đầu' },
                                  { id: 'center', label: 'Mặt' },
                                  { id: 'bottom', label: 'Thân' },
                                ].map((f) => (
                                  <button
                                    key={f.id}
                                    onClick={() => handleSetSlotFocus(sIdx, f.id as any)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                      focus === f.id
                                        ? 'border-pink-500 bg-pink-950 text-pink-300'
                                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {f.label}
                                  </button>
                                ))}
                              </div>

                              {/* Zoom Slider */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-bold">Zoom:</span>
                                <input
                                  type="range"
                                  min="1.0"
                                  max="1.8"
                                  step="0.05"
                                  value={zoom}
                                  onChange={(e) => handleSetSlotZoom(sIdx, parseFloat(e.target.value))}
                                  className="w-16 accent-pink-500 h-1 bg-slate-800 rounded cursor-pointer"
                                />
                                <span className="font-mono text-pink-400 font-bold w-7 text-right">
                                  {zoom.toFixed(1)}x
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Progression Badge Selector (Level & Power Evolution) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Huy Hiệu Tiến Hóa Sức Mạnh (Rank Evolution)</span>
                  </span>
                  {currentThumbnail.progressionBadge && (
                    <button
                      onClick={() => setThumbnailConfig({ progressionBadge: '' })}
                      className="text-[9px] text-red-400 hover:underline font-bold"
                    >
                      Tắt Huy Hiệu
                    </button>
                  )}
                </label>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                  {PROGRESSION_BADGES.map((badgeText) => {
                    const isSelected = currentThumbnail.progressionBadge === badgeText;
                    return (
                      <button
                        key={badgeText}
                        onClick={() => setThumbnailConfig({ progressionBadge: isSelected ? '' : badgeText })}
                        className={`p-1.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/50 text-amber-300 ring-1 ring-amber-500'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {badgeText}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Built-in AI Vector Element Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Layer AI Giật Gân (Clickbait Icons & Auras)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Click để chèn</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {AI_PRESET_ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => handleAddAIElement(asset.id)}
                      className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-cyan-500/60 text-left transition-all group"
                    >
                      <div className="w-full h-10 bg-slate-950/80 rounded-lg flex items-center justify-center overflow-hidden mb-1 border border-slate-800/60">
                        <img src={asset.thumbnailUrl} alt={asset.name} className="h-7 object-contain" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Layer Elements Manager with Scale Controls */}
                {currentThumbnail.aiElements && currentThumbnail.aiElements.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-400">Layer Đang Chèn Trên Thumbnail:</span>
                    {currentThumbnail.aiElements.map((elem) => (
                      <div
                        key={elem.id}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white font-bold">{elem.name}</span>
                          <button
                            onClick={() => handleRemoveAIElement(elem.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Xóa layer này"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Layer Position X & Y sliders */}
                        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <span>Vị trí X:</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={elem.x}
                              onChange={(e) => {
                                const newElems = currentThumbnail.aiElements?.map(el =>
                                  el.id === elem.id ? { ...el, x: Number(e.target.value) } : el
                                );
                                setThumbnailConfig({ aiElements: newElems });
                              }}
                              className="w-14 accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
                            />
                            <span className="font-mono text-cyan-400">{elem.x}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Vị trí Y:</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={elem.y}
                              onChange={(e) => {
                                const newElems = currentThumbnail.aiElements?.map(el =>
                                  el.id === elem.id ? { ...el, y: Number(e.target.value) } : el
                                );
                                setThumbnailConfig({ aiElements: newElems });
                              }}
                              className="w-14 accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
                            />
                            <span className="font-mono text-cyan-400">{elem.y}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THEMES & VISUAL EFFECTS */}
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

          {/* TAB 3: TYPOGRAPHY & CTR STICKERS */}
          {activeControlTab === 'typography' && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3.5">
              {/* 1-Click Viral Title Generator Button */}
              <button
                onClick={() => setShowViralModal(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-white transition-all group shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 fill-current animate-bounce" />
                  <div className="text-left">
                    <span className="text-[11px] font-black block text-amber-300 group-hover:text-white">
                      🔥 Kho Tiêu Đề Triệu View (1-Click)
                    </span>
                    <span className="text-[9px] text-slate-400">
                      Áp dụng tức thì concept giật gân YouTube Recap
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  Mở Kho ➔
                </span>
              </button>

              {/* Title Style Selector */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
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

          {/* TAB 4: VIRAL YOUTUBE BENCHMARK & TEMPLATES */}
          {activeControlTab === 'viral_research' && (
            <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Xu Hướng YouTube Recap Triệu View</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">vidIQ Verified</span>
              </div>

              {/* Sub Tab Toggle */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                <button
                  onClick={() => setActiveViralSubTab('templates')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    activeViralSubTab === 'templates'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  25+ Mẫu Video Triệu View
                </button>
                <button
                  onClick={() => setActiveViralSubTab('channels')}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    activeViralSubTab === 'channels'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top Kênh YouTube
                </button>
              </div>

              {/* Templates Sub-Tab */}
              {activeViralSubTab === 'templates' && (
                <div className="space-y-2.5">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] scrollbar-none">
                    {[
                      { id: 'all', label: 'Tất Cả' },
                      { id: 'fulldai', label: '🏆 Full 10h+' },
                      { id: 'tutien', label: '🐉 Tu Tiên' },
                      { id: 'thosan', label: '⚡ Thợ Săn' },
                      { id: 'harem', label: '🌸 Sư Muội' },
                      { id: 'dothi', label: '💼 Đô Thị' },
                      { id: 'baothu', label: '🩸 Báo Thù' },
                      { id: 'shorts', label: '🦗 Shorts' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedViralCategory(c.id)}
                        className={`px-2 py-0.5 rounded-lg flex-shrink-0 font-bold border transition-all ${
                          selectedViralCategory === c.id
                            ? 'bg-amber-500/30 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* List of Templates */}
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {VIRAL_TITLE_TEMPLATES.filter(
                      (t) => selectedViralCategory === 'all' || t.category === selectedViralCategory
                    ).map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/60 transition-all space-y-1.5 text-[10px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400 uppercase text-[9px] bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
                            {t.categoryLabel}
                          </span>
                          <span className="text-emerald-400 font-mono font-bold text-[9px]">
                            {t.viewsEstimate}
                          </span>
                        </div>
                        <h4 className="font-black text-white text-[11px] leading-snug">
                          {t.title}
                        </h4>
                        <p className="text-slate-300 line-clamp-1">
                          {t.subtitle}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="bg-red-950 text-red-300 font-bold px-1.5 py-0.2 rounded border border-red-900/40 text-[9px]">
                            {t.badge}
                          </span>
                          <button
                            onClick={() => handleApplyViralTemplate(t)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[9px] transition-all active:scale-95 flex items-center gap-1"
                          >
                            <span>Áp Dụng</span>
                            <span>➔</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channels Sub-Tab */}
              {activeViralSubTab === 'channels' && (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {YOUTUBE_CHANNELS_BENCHMARK.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-[10px]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-white text-[11px] flex items-center gap-1">
                            <span>{ch.name}</span>
                            <span className="text-[9px] text-slate-400 font-normal">{ch.handle}</span>
                          </h4>
                          <span className="text-[9px] text-cyan-400 font-bold">{ch.genreFocus}</span>
                        </div>
                        <div className="text-right text-[9px] font-mono">
                          <span className="text-emerald-400 font-bold block">{ch.subs}</span>
                          <span className="text-slate-400">{ch.totalViews}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 space-y-1 text-[9px]">
                        <div className="text-slate-300 font-bold">
                          🔥 <span className="text-amber-400">Hit:</span> {ch.hitVideoTitle}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-mono">
                          <span className="text-emerald-400 font-bold">{ch.hitViews}</span>
                          <span>•</span>
                          <span>{ch.hitDuration}</span>
                        </div>
                        <div className="text-slate-400 pt-1 border-t border-slate-800">
                          🎨 {ch.thumbnailStyle}
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyTheme(ch.recommendedTheme)}
                        className="w-full py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold text-[9px] transition-all flex items-center justify-center gap-1"
                      >
                        <span>Áp Dụng Phong Cách Kênh Này</span>
                        <span>➔</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI PROMPT GENERATOR */}
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
