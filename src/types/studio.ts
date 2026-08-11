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

export interface ThumbnailConfig {
  mainTitle: string;
  subtitle: string;
  badge: string;
  characterImage: string;
  bgGradient: string;
  glowColor: string;
}

export interface AIPluginConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'deepseek';
  apiKey: string;
  modelName: string;
  status: 'connected' | 'unconfigured' | 'error';
}
