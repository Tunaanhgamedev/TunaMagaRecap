export type ActiveTab =
  | 'dashboard'
  | 'library'
  | 'ocr'
  | 'grid_editor' // MagaRecap Excel-style Grid Editor
  | 'script'
  | 'translation' // MagaRecap Translation Engine
  | 'voice'
  | 'subtitle'
  | 'timeline'
  | 'thumbnail'
  | 'seo'
  | 'workflow'
  | 'queue'
  | 'sync_center' // Dual Cloud & Local Database Sync Center
  | 'settings';

export type TextType = 'DIALOGUE' | 'NARRATION' | 'SOUND_EFFECT' | 'CAPTION' | 'SCENE_DESC';

export type DetectedLanguage = 'ko' | 'ja' | 'en' | 'zh' | 'vi' | 'fr' | 'de' | 'es' | 'id' | 'th';
export type TargetLanguage = 'vi' | 'en' | 'ja' | 'ko' | 'zh' | 'fr' | 'de' | 'es' | 'id' | 'th';

export type MangaFontFamily =
  | 'Anime Ace'
  | 'CC Wild Words'
  | 'Komika Axis'
  | 'Bangers'
  | 'Roboto'
  | 'Inter'
  | 'Montserrat'
  | 'Patrick Hand'
  | 'Kalam'
  | 'Merriweather';

export type TextCaseType = 'upper' | 'lower' | 'sentence' | 'title' | 'none';

export interface TextBlock {
  id: string;
  panelId: string;
  type: TextType;
  language: DetectedLanguage;
  confidence: number;
  originalText: string;
  translatedText: string;
  editedText?: string;
  fontFamily: MangaFontFamily;
  fontSize: number;
  isBold?: boolean;
  isItalic?: boolean;
  textCase?: TextCaseType;
  bbox?: { x: number; y: number; w: number; h: number };
  useForScript: boolean;
}

export interface Dialogue {
  id: string;
  panelId?: string;
  speaker: string;
  text: string;
  originalText?: string;
  translatedText?: string;
  editedText?: string;
  language?: DetectedLanguage;
  textType?: TextType;
  fontFamily?: MangaFontFamily;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  textCase?: TextCaseType;
  confidence?: number;
  useForScript?: boolean;
  emotion: 'neutral' | 'shouting' | 'whispering' | 'scared' | 'excited' | 'sad';
  bbox?: { x: number; y: number; w: number; h: number };
}

export type AnimationEffectType =
  | 'zoom_in'
  | 'zoom_out'
  | 'pan_left'
  | 'pan_right'
  | 'pan_up'
  | 'pan_down'
  | 'shake'
  | 'flash'
  | 'blur'
  | 'dramatic_zoom';

export interface Panel {
  id: string;
  pageIndex: number;
  panelIndex: number;
  bbox: { x: number; y: number; w: number; h: number };
  dialogues: Dialogue[];
  aiDescription?: string;
  suggestedCameraEffect?: AnimationEffectType;
}

export interface MangaPage {
  id: string;
  pageIndex: number;
  imageUrl: string;
  rawImageUrl?: string;
  ocrProcessed?: boolean;
  panels: Panel[];
}

export interface Chapter {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  pages: MangaPage[];
  totalPanels: number;
  status: 'draft' | 'ocr_done' | 'scripted' | 'voiced' | 'rendered';
  createdAt: string;
}

export interface Series {
  id: string;
  title: string;
  coverUrl: string;
  genre: string[];
  totalChapters: number;
  author: string;
}

export interface Project {
  id: string;
  seriesName: string;
  chapterNumber: number;
  episodeTitle: string;
  status: 'idle' | 'processing' | 'ready' | 'published';
  durationEst: number; // in seconds
  coverUrl: string;
  updatedAt: string;
  sourceUrl?: string;
  sourceName?: string;
  pages?: MangaPage[];
  scriptData?: ScriptData | null;
  clips?: TimelineClip[];
  subtitles?: SubtitleItem[];
  renderedVideoUrl?: string; // blob:// URL of rendered chapter video
}

export type CompilationTransition = 'fade' | 'slide' | 'none';

export interface CompilationChapterEntry {
  projectId: string;
  project: Project;
  order: number;
}

export interface ChapterVideoEntry {
  projectId: string;
  project: Project;
  videoUrl: string; // blob:// URL of the rendered video
}

export interface CompilationConfig {
  id: string;
  title: string;
  chapters: CompilationChapterEntry[];
  chapterVideos: ChapterVideoEntry[]; // actual video blobs for concatenation
  includeBumpers: boolean;
  bumperDurationSec: number;
  transition: CompilationTransition;
  totalPages: number;
  totalDurationEst: number;
}

export type MangaGenre =
  | 'hunter_system' // Thợ Săn / Hệ Thống / Thức Tỉnh
  | 'cultivation_wuxia' // Tu Tiên / Huyền Huyễn / Kiếm Hiệp
  | 'isekai_fantasy' // Isekai / Chuyển Sinh / Ma Pháp
  | 'regression_revenge' // Trùng Sinh / Báo Thù / Vả Mặt
  | 'school_urban' // Bạo Lực Học Đường / Đô Thị / Hành Động
  | 'horror_survival' // Kinh Dị / Sinh Tồn / Thần Bí
  | 'romance_drama' // Ngôn Tình / Cung Đấu / Drama
  | 'mystery_mindgame' // Trinh Thám / Đấu Trí
  | 'general_shonen'; // Shonen / Phiêu Lưu Tổng Hợp

export type ScriptMode =
  | 'summary'
  | 'review'
  | 'funny'
  | 'horror'
  | 'emotional'
  | 'storytelling'
  | 'rewrite'
  | 'yt_friendly';

export interface ScriptChunk {
  id: string;
  speaker: string;
  text: string;
  translatedText?: string;
  emotion: string;
  estDurationSec: number;
  voiceId?: string;
  keyframeEffect?: AnimationEffectType;
}

export interface ScriptData {
  mode: ScriptMode;
  title: string;
  content: string;
  chunks: ScriptChunk[];
  wordCount: number;
  estReadTimeMinutes: number;
}

export interface VoiceActor {
  id: string;
  name: string;
  gender: 'male' | 'female';
  provider: 'elevenlabs' | 'azure' | 'openai' | 'browser' | 'capcut_edge';
  voiceKey: string;
  avatarUrl: string;
  sampleAudioUrl?: string;
  description: string;
}

export interface SubtitleItem {
  id: string;
  startTime: number; // in seconds
  endTime: number;
  text: string;
  speaker: string;
  stylePreset: 'standard' | 'tiktok_yellow' | 'anime_glowing' | 'bold_impact';
}

export type TrackType = 'image' | 'voice' | 'subtitle' | 'music' | 'effect';

export interface TimelineClip {
  id: string;
  trackId: TrackType;
  startTime: number; // in seconds
  duration: number; // in seconds
  title: string;
  color: string;
  imageUrl?: string;
  audioUrl?: string;
  text?: string;
  animationEffect?: AnimationEffectType;
}

export interface WorkflowNode {
  id: string;
  type: 'import' | 'ocr' | 'ai_script' | 'tts_voice' | 'subtitles' | 'animation' | 'render' | 'upload' | 'capcut_export';
  label: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  position: { x: number; y: number };
  config: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface QueueTask {
  id: string;
  seriesName: string;
  chapterTitle: string;
  progress: number;
  currentStep: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  startedAt: string;
  logs: string[];
}

export interface SEOMetadata {
  title: string;
  alternativeTitles?: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  pinnedComment?: string;
  timecodes?: { timestamp: string; label: string }[];
  tiktokCaption?: string;
  playlist: string;
  scheduleTime: string;
  targetAudience: string;
}

export interface AIVisualElement {
  id: string;
  name: string;
  url: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  scale: number; // 0.2 - 3.0
  opacity: number; // 0.1 - 1.0
  rotation?: number; // -180 to 180 deg
  blendMode?: 'normal' | 'screen' | 'overlay' | 'lighten' | 'color-dodge';
  type: 'aura' | 'flame' | 'lightning' | 'badge' | 'monster' | 'slash' | 'magic_circle' | 'sticker' | 'custom';
}

export type ThumbnailTheme =
  | 'solo_awakening' // Hunter dark blue + neon electric
  | 'dark_monarch' // Crimson red + shadow void
  | 'golden_immortal' // Tu Tien golden dragon + ancient flames
  | 'magic_overlord' // Isekai purple rift + rune circles
  | 'cyber_system' // Holographic cyan + matrix HUD
  | 'blood_fury' // Blood moon + berserk battle
  | 'speed_action' // Yellow lightning + comic blast
  | 'custom';

export type ThumbnailBadgeStyle =
  | 'gold_metallic'
  | 'neon_cyan'
  | 'blood_red'
  | 'flaming_orange'
  | 'sss_danger'
  | 'purple_void'
  | 'emerald_god';

export type ThumbnailTitleStyle =
  | 'gold_3d'
  | 'fiery_orange'
  | 'electric_blue'
  | 'crimson_blood'
  | 'neon_cyan'
  | 'toxic_green'
  | 'pure_white';

export type ThumbnailOverlayEffect =
  | 'speed_lines'
  | 'lightning_storm'
  | 'flaming_embers'
  | 'shattered_glass'
  | 'magic_runes'
  | 'system_hud'
  | 'vignette_dark'
  | 'none';

export interface ThumbnailConfig {
  mainTitle: string;
  subtitle: string;
  badge: string;
  characterImage: string;
  bgGradient: string;
  glowColor: string;
  // Extended Epic & AI Features
  theme?: ThumbnailTheme;
  badgeStyle?: ThumbnailBadgeStyle;
  titleStyle?: ThumbnailTitleStyle;
  overlayEffect?: ThumbnailOverlayEffect;
  characterSecondaryImage?: string;
  characterImages?: string[];
  aiArtworkUrl?: string;
  characterPosition?: 'right' | 'left' | 'center' | 'split';
  characterScale?: number; // 50 to 150
  characterGlow?: boolean;
  characterBlend?: 'normal' | 'screen' | 'overlay' | 'lighten';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  stickers?: string[];
  activeStickers?: string[];
  aiElements?: AIVisualElement[];
  slotFocus?: ('top' | 'center' | 'bottom')[];
  slotZooms?: number[];
  progressionBadge?: string;
  filterSettings?: {
    brightness: number; // 80 - 150
    contrast: number; // 80 - 180
    saturation: number; // 80 - 200
    vignette: number; // 0 - 100
  };
}

export interface AIPluginConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'deepseek';
  apiKey: string;
  modelName: string;
  status: 'connected' | 'unconfigured' | 'error';
}
