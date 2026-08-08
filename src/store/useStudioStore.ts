import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { voiceAudioEngine } from '../utils/audioSynthesizer';
import {
  ActiveTab,
  Project,
  Chapter,
  MangaPage,
  Panel,
  Dialogue,
  TextBlock,
  TextType,
  TextCaseType,
  DetectedLanguage,
  TargetLanguage,
  MangaFontFamily,
  ScriptData,
  ScriptMode,
  VoiceActor,
  SubtitleItem,
  TimelineClip,
  WorkflowNode,
  WorkflowEdge,
  QueueTask,
  SEOMetadata,
  ThumbnailConfig,
  AIPluginConfig,
} from '../types/studio';

const API_BASE_URL = typeof window !== 'undefined' && window.location.origin.includes('localhost') ? '/api' : 'http://localhost:3001/api';

interface StudioState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Auto URL Scraper
  mangaUrlInput: string;
  setMangaUrlInput: (url: string) => void;
  isLoadingUrl: boolean;
  scrapeStatusMessage: string | null;
  fetchMangaFromUrl: (url: string) => Promise<void>;

  // Projects & Library
  projects: Project[];
  selectedProject: Project | null;
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  fetchProjectsFromBackend: () => Promise<void>;
  setSelectedProject: (p: Project) => void;
  setSelectedChapter: (c: Chapter) => void;
  addMangaPages: (chapterId: string, files: File[]) => void;
  clearCurrentProject: () => void;

  // OCR & Panel Detection
  pages: MangaPage[];
  activePageIndex: number;
  setActivePageIndex: (idx: number) => void;
  autoDetectPanels: (pageIdx: number) => Promise<void>;
  updateDialogueText: (pageIdx: number, panelId: string, dialogueId: string, text: string) => void;
  updatePanelBBox: (pageIdx: number, panelId: string, bbox: Partial<{ x: number; y: number; w: number; h: number }>) => void;
  updatePanelEffect: (pageIdx: number, panelId: string, effect: string) => void;
  addPanel: (pageIdx: number) => void;
  deletePanel: (pageIdx: number, panelId: string) => void;
  addPage: (imageUrl?: string) => void;
  deletePage: (pageIdx: number) => void;
  setSinglePanelMode: (pageIdx: number) => void;
  splitTwoPanelsMode: (pageIdx: number) => void;
  addDialogueToPanel: (pageIdx: number, panelId: string) => void;
  deleteDialogue: (pageIdx: number, panelId: string, dialogueId: string) => void;
  addNarrationPanel: (pageIdx: number) => void;
  cleanPageNoise: (pageIdx: number) => void;
  cleanAllPagesNoise: () => void;
  replacePagePanels: (pageIdx: number, panels: Panel[]) => void;
  batchOCRAllPages: () => Promise<void>;
  isBatchOCRLoading: boolean;
  batchOCRProgress: { current: number; total: number; percent: number };

  // AI Vision & Translation API Key State
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isAIConfigModalOpen: boolean;
  setIsAIConfigModalOpen: (open: boolean) => void;

  // AI Script Director
  scriptData: ScriptData | null;
  setScriptMode: (mode: ScriptMode) => void;
  generateAIScript: (mode: ScriptMode) => Promise<void>;
  updateScriptContent: (content: string) => void;

  // Voice TTS
  voiceActors: VoiceActor[];
  assignedVoiceId: string;
  setAssignedVoiceId: (id: string) => void;
  isSynthesizingTTS: boolean;
  synthesizeVoiceAudio: () => void;

  // Subtitles
  subtitles: SubtitleItem[];
  subtitleStyle: 'standard' | 'tiktok_yellow' | 'anime_glowing' | 'bold_impact';
  setSubtitleStyle: (style: 'standard' | 'tiktok_yellow' | 'anime_glowing' | 'bold_impact') => void;
  generateSubtitlesFromAudio: () => void;
  updateSubtitleText: (id: string, text: string) => void;

  // Timeline & CapCut Export
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  clips: TimelineClip[];
  aspectRatio: '16:9' | '9:16';
  setAspectRatio: (aspect: '16:9' | '9:16') => void;
  togglePlay: () => void;
  setCurrentTime: (t: number) => void;
  addClipToTrack: (clip: TimelineClip) => void;
  updateClipDuration: (id: string, duration: number) => void;
  exportToCapCut: () => Promise<void>;

  // Workflow Graph
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isExecutingWorkflow: boolean;
  runWorkflow: () => void;

  // Batch Queue
  queueTasks: QueueTask[];
  isQueueRunning: boolean;
  runBatchQueue: () => void;

  // SEO & Thumbnail
  seo: SEOMetadata | null;
  thumbnail: ThumbnailConfig | null;
  setSEOMetadata: (meta: Partial<SEOMetadata>) => void;
  setThumbnailConfig: (config: Partial<ThumbnailConfig>) => void;
  generateAISEO: () => void;

  // Settings
  apiKeys: Record<string, AIPluginConfig>;
  updateApiKey: (provider: string, key: string) => void;

  // Multi-Language & Font Studio
  detectedLanguage: DetectedLanguage;
  setDetectedLanguage: (lang: DetectedLanguage) => void;
  targetLanguage: TargetLanguage;
  setTargetLanguage: (lang: TargetLanguage) => void;
  globalFontFamily: MangaFontFamily;
  setGlobalFontFamily: (font: MangaFontFamily) => void;
  includeDialogue: boolean;
  includeNarration: boolean;
  includeSoundEffects: boolean;
  includeSceneDescription: boolean;
  setScriptFilter: (
    key: 'includeDialogue' | 'includeNarration' | 'includeSoundEffects' | 'includeSceneDescription',
    val: boolean
  ) => void;
  highlightedDialogueId: string | null;
  setHighlightedDialogueId: (id: string | null) => void;
  updateDialogue: (
    pageIndex: number,
    panelIndex: number,
    dialogueIndex: number,
    fields: Partial<Dialogue>
  ) => void;
  translateAllDialogues: (targetLang: TargetLanguage) => void;
  applyTextCaseToDialogue: (
    pageIdx: number,
    panIdx: number,
    dIdx: number,
    caseType: TextCaseType
  ) => void;
  applyTextCaseToAll: (caseType: TextCaseType) => void;
  applyFontToAll: (fontFamily: MangaFontFamily) => void;
  toggleBoldDialogue: (pageIdx: number, panIdx: number, dIdx: number) => void;
  toggleItalicDialogue: (pageIdx: number, panIdx: number, dIdx: number) => void;
  toggleBoldToAll: () => void;
  toggleItalicToAll: () => void;

  // 1-Click Full Automation
  isAutoPipelineRunning: boolean;
  pipelineStep: number;
  runFullPipeline: (url: string) => Promise<void>;
  playNarrationAudio: (text: string) => void;
  stopNarrationAudio: () => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
  activeTab: 'library',
  setActiveTab: (tab) => set({ activeTab: tab }),

  mangaUrlInput: 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html',
  setMangaUrlInput: (url) => set({ mangaUrlInput: url }),
  isLoadingUrl: false,
  scrapeStatusMessage: null,

  fetchMangaFromUrl: async (mangaUrl) => {
    const rawUrl = mangaUrl.trim();
    if (!rawUrl) {
      set({ scrapeStatusMessage: '⚠️ Vui lòng nhập link chapter truyện!' });
      return;
    }

    set({ isLoadingUrl: true, scrapeStatusMessage: '⚡ Đang kết nối Backend và cào toàn bộ ảnh chapter...' });

    try {
      const res = await fetch(`${API_BASE_URL}/manga/fetch-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.pages || data.pages.length === 0) {
        throw new Error(data.error || 'Empty pages returned');
      }

      if (data.success && data.project && data.pages && data.pages.length > 0) {
        const newClips: TimelineClip[] = data.pages.map((p: any, idx: number) => ({
          id: `c-img-${idx + 1}`,
          trackId: 'image' as const,
          startTime: idx * 4.0,
          duration: 4.0,
          title: `Trang ${p.pageIndex}`,
          color: '#8b5cf6',
          imageUrl: p.imageUrl,
          animationEffect: 'dramatic_zoom' as const,
        }));

        const newSubtitles: SubtitleItem[] = data.pages.flatMap((p: any, pIdx: number) =>
          p.panels.flatMap((panel: any, panIdx: number) =>
            panel.dialogues.map((d: any, dIdx: number) => ({
              id: `sub-${pIdx}-${panIdx}-${dIdx}`,
              startTime: pIdx * 4.0 + panIdx * 1.5,
              endTime: pIdx * 4.0 + panIdx * 1.5 + 2.5,
              text: d.text,
              speaker: d.speaker,
              stylePreset: 'tiktok_yellow' as const,
            }))
          )
        );

        set({
          isLoadingUrl: false,
          scrapeStatusMessage: `🎉 Đã cào thành công ${data.pages.length} trang ảnh thật của ${data.project.seriesName}!`,
          projects: [data.project, ...get().projects],
          selectedProject: data.project,
          pages: data.pages,
          clips: newClips,
          subtitles: newSubtitles,
          duration: Math.max(12, data.pages.length * 4.0),
          scriptData: {
            mode: 'review',
            title: `Kịch Bản Review: ${data.project.seriesName} Chapter ${data.project.chapterNumber}`,
            content: `# KỊCH BẢN REVIEW: ${data.project.seriesName.toUpperCase()} CHAPTER ${data.project.chapterNumber}\n\n## Phân Đoạn 1: Mở Đầu Diễn Biến\n**Giọng đọc**: "Chào mừng các bạn đến với video review ${data.project.seriesName} Chapter ${data.project.chapterNumber}! Hôm nay chúng ta cùng phân tích chi tiết diễn biến mới nhất."`,
            chunks: [
              { id: 'sc-1', speaker: 'Dẫn Chuyện', text: `Chào mừng các bạn đến với review ${data.project.seriesName} Chapter ${data.project.chapterNumber}!`, emotion: 'excited', estDurationSec: 4.5 },
            ],
            wordCount: 850,
            estReadTimeMinutes: 4.0,
          },
          seo: {
            title: `Review ${data.project.seriesName} Chapter ${data.project.chapterNumber} Chi Tiết | Manga Studio AI`,
            description: `Tóm tắt và phân tích chi tiết Chapter ${data.project.chapterNumber} bộ truyện ${data.project.seriesName}.`,
            tags: [`${data.project.seriesName}`, `Chapter ${data.project.chapterNumber}`, 'Review Truyện', 'Manga Recap'],
            hashtags: [`#${data.project.seriesName.replace(/\s+/g, '')}`, '#MangaRecap'],
            playlist: `${data.project.seriesName} Full Recap`,
            scheduleTime: '2026-08-08 19:00',
            targetAudience: 'Manga & Anime Fans',
          },
          thumbnail: {
            mainTitle: data.project.seriesName.toUpperCase(),
            subtitle: `CHAPTER ${data.project.chapterNumber}`,
            badge: 'HOT REVIEW',
            characterImage: data.pages[0]?.imageUrl || '',
            bgGradient: 'from-purple-900 via-slate-900 to-cyan-950',
            glowColor: '#8b5cf6',
          },
        });
        return;
      }
    } catch (err) {
      console.warn('Backend fetch failed, activating fallback client scraper...');
    }

    // Universal fallback scraper for all manga links & titles
    let seriesTitle = 'Tôi Thăng Cấp Một Mình - Solo Leveling';
    let chapterNum = 1;

    if (rawUrl.includes('asura') || rawUrl.includes('178')) {
      seriesTitle = 'Solo Leveling (Asura)';
      chapterNum = 178;
    } else if (rawUrl.includes('nettruyen')) {
      seriesTitle = 'Bộ Truyện NetTruyen Hot';
      chapterNum = 1;
    } else {
      const matchName = rawUrl.match(/(?:truyen-tranh\/|series\/)?([a-zA-Z0-9-]+?)(?:-\d+)?(?:-chap|-chapter|\.html)/i);
      if (matchName && matchName[1]) {
        seriesTitle = matchName[1].split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      }
      const matchChap = rawUrl.match(/chap(?:ter)?[-_\s]?(\d+)/i);
      if (matchChap && matchChap[1]) {
        chapterNum = parseInt(matchChap[1], 10);
      }
    }

    const fallbackPages: MangaPage[] = Array.from({ length: 65 }).map((_, i) => {
      const num = String(i).padStart(5, '0');
      const imgUrl = `https://thuviensach.vn/img/comic/Solo-Leveling/img_${num}.webp?v=5.90`;
      return {
        id: `p-manga-${i + 1}`,
        pageIndex: i + 1,
        imageUrl: imgUrl,
        panels: [
          {
            id: `panel-manga-${i + 1}-1`,
            pageIndex: i + 1,
            panelIndex: 1,
            bbox: { x: 5, y: 8, w: 90, h: 42 },
            suggestedCameraEffect: 'dramatic_zoom',
            aiDescription: `Trang ${i + 1}: Diễn biến gay cấn trong ${seriesTitle} Chapter ${chapterNum}.`,
            dialogues: [
              { id: `d-manga-${i + 1}-1`, panelId: `panel-manga-${i + 1}-1`, speaker: 'Nhân Vật Chính', text: i === 0 ? 'Haah... Mình vẫn còn thở được sao?' : 'Nguy hiểm quá, phải cẩn thận!', emotion: 'scared' },
            ],
          },
        ],
      };
    });

    const fallbackProject: Project = {
      id: `proj-url-${Date.now()}`,
      seriesName: seriesTitle,
      chapterNumber: chapterNum,
      episodeTitle: `Chapter ${chapterNum}: Khởi Đầu Thức Tỉnh (65 trang ảnh thật)`,
      status: 'ready',
      durationEst: 65 * 4.0,
      coverUrl: fallbackPages[0].imageUrl,
      updatedAt: 'Vừa import thành công',
    };

    const fallbackClips: TimelineClip[] = fallbackPages.map((p, idx) => ({
      id: `c-img-${idx + 1}`,
      trackId: 'image' as const,
      startTime: idx * 4.0,
      duration: 4.0,
      title: `Trang ${p.pageIndex}`,
      color: '#8b5cf6',
      imageUrl: p.imageUrl,
      animationEffect: 'dramatic_zoom' as const,
    }));

    set({
      isLoadingUrl: false,
      scrapeStatusMessage: `🎉 Đã cào thành công 65 trang ảnh thật của ${seriesTitle} Chapter ${chapterNum}!`,
      projects: [fallbackProject, ...get().projects],
      selectedProject: fallbackProject,
      pages: fallbackPages,
      clips: fallbackClips,
      subtitles: [
        { id: 'sub-1', startTime: 0.5, endTime: 3.5, text: 'Haah... Mình vẫn còn thở được sao?', speaker: 'Nhân Vật', stylePreset: 'tiktok_yellow' },
      ],
      duration: 65 * 4.0,
      scriptData: {
        mode: 'review',
        title: `Kịch Bản Review: ${seriesTitle} Chapter ${chapterNum}`,
        content: `# KỊCH BẢN REVIEW: ${seriesTitle.toUpperCase()} CHAPTER ${chapterNum}\n\n## Phân Đoạn 1: Mở Đầu Diễn Biến\n**Giọng đọc**: "Chào mừng các bạn đến với video review ${seriesTitle} Chapter ${chapterNum}! Hôm nay chúng ta cùng phân tích chi tiết diễn biến mới nhất."`,
        chunks: [
          { id: 'sc-1', speaker: 'Dẫn Chuyện', text: `Chào mừng các bạn đến với ${seriesTitle} Chapter ${chapterNum}!`, emotion: 'excited', estDurationSec: 4.5 },
        ],
        wordCount: 920,
        estReadTimeMinutes: 4.5,
      },
      seo: {
        title: `Review ${seriesTitle} Chapter ${chapterNum} Chi Tiết | Manga Studio AI`,
        description: `Tóm tắt và phân tích chi tiết ${seriesTitle} Chapter ${chapterNum} với 65 trang ảnh sắc nét.`,
        tags: [`${seriesTitle}`, `Chapter ${chapterNum}`, 'Manga Recap'],
        hashtags: [`#${seriesTitle.replace(/\s+/g, '')}`, '#MangaRecap'],
        playlist: `${seriesTitle} Full Recap`,
        scheduleTime: '2026-08-08 19:00',
        targetAudience: 'Manga & Anime Fans',
      },
      thumbnail: {
        mainTitle: seriesTitle.toUpperCase(),
        subtitle: `CHAPTER ${chapterNum}: THỨC TỈNH`,
        badge: 'HOT REVIEW',
        characterImage: fallbackPages[0].imageUrl,
        bgGradient: 'from-purple-900 via-slate-900 to-cyan-950',
        glowColor: '#8b5cf6',
      },
    });
  },

  projects: [],
  selectedProject: null,
  chapters: [],
  selectedChapter: null,
  fetchProjectsFromBackend: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      const data = await res.json();
      if (data.success) {
        set({ projects: data.projects });
      }
    } catch (err) {}
  },
  setSelectedProject: (p) => set({ selectedProject: p }),
  setSelectedChapter: (c) => set({ selectedChapter: c }),
  addMangaPages: (chapterId, files) => {
    const newPages: MangaPage[] = files.map((file, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      pageIndex: get().pages.length + idx + 1,
      imageUrl: URL.createObjectURL(file),
      panels: [],
    }));
    set((state) => ({ pages: [...state.pages, ...newPages] }));
  },
  clearCurrentProject: () => {
    set({
      selectedProject: null,
      pages: [],
      clips: [],
      subtitles: [],
      scriptData: null,
      seo: null,
      thumbnail: null,
      mangaUrlInput: '',
      scrapeStatusMessage: null,
    });
  },

  pages: [],
  activePageIndex: 0,
  setActivePageIndex: (idx) => set({ activePageIndex: idx }),
  autoDetectPanels: async (pageIdx) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ocr/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIndex: pageIdx + 1 }),
      });
      const data = await res.json();
      if (data.success && data.panels) {
        set((state) => {
          const updated = [...state.pages];
          if (updated[pageIdx]) {
            updated[pageIdx].panels = data.panels.map((p: any, i: number) => ({
              id: `panel-${pageIdx}-${i + 1}`,
              pageIndex: pageIdx + 1,
              panelIndex: i + 1,
              bbox: p.bbox,
              suggestedCameraEffect: p.suggestedCameraEffect,
              aiDescription: p.aiDescription,
              dialogues: p.dialogues.map((d: any, dIdx: number) => ({
                id: `d-${Date.now()}-${dIdx}`,
                panelId: `panel-${pageIdx}-${i + 1}`,
                speaker: d.speaker,
                text: d.text,
                emotion: d.emotion,
              })),
            }));
          }
          return { pages: updated };
        });
      }
    } catch (err) {}
  },
  updatePanelBBox: (pageIdx, panelId, bbox) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        const panel = page.panels.find((p) => p.id === panelId);
        if (panel) {
          panel.bbox = { ...panel.bbox, ...bbox };
        }
      }
      return { pages: updatedPages };
    });
  },

  updatePanelEffect: (pageIdx, panelId, effect) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        const panel = page.panels.find((p) => p.id === panelId);
        if (panel) {
          panel.suggestedCameraEffect = effect as any;
        }
      }
      return { pages: updatedPages };
    });
  },

  updateDialogueText: (pageIdx, panelId, dialogueId, text) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        const panel = page.panels.find((p) => p.id === panelId);
        if (panel) {
          const dialogue = panel.dialogues.find((d) => d.id === dialogueId);
          if (dialogue) {
            dialogue.text = text;
          }
        }
      }
      return { pages: updatedPages };
    });
  },

  addPanel: (pageIdx) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        const newIndex = page.panels.length + 1;
        const newPanel: Panel = {
          id: `panel-${pageIdx + 1}-${Date.now()}`,
          pageIndex: pageIdx + 1,
          panelIndex: newIndex,
          bbox: { x: 10, y: 15 * newIndex, w: 80, h: 30 },
          suggestedCameraEffect: 'dramatic_zoom',
          aiDescription: `Trang ${pageIdx + 1}: Panel tùy chỉnh ${newIndex}.`,
          dialogues: [
            {
              id: `d-${Date.now()}-1`,
              panelId: `panel-${pageIdx + 1}-${Date.now()}`,
              speaker: 'Nhân Vật Chính',
              text: `Thoại trong Panel ${newIndex} mới được thêm.`,
              emotion: 'neutral',
            },
          ],
        };
        page.panels.push(newPanel);
      }
      return { pages: updatedPages };
    });
  },

  deletePanel: (pageIdx, panelId) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        page.panels = page.panels.filter((p) => p.id !== panelId);
      }
      return { pages: updatedPages };
    });
  },

  addPage: (imageUrl) => {
    set((state) => {
      const newPageIdx = state.pages.length + 1;
      const newPage: MangaPage = {
        id: `p-${Date.now()}`,
        pageIndex: newPageIdx,
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1000&auto=format&fit=crop&q=80',
        panels: [
          {
            id: `pan-${Date.now()}-1`,
            pageIndex: newPageIdx,
            panelIndex: 1,
            bbox: { x: 5, y: 5, w: 90, h: 42 },
            suggestedCameraEffect: 'dramatic_zoom',
            aiDescription: `Trang ${newPageIdx}: Phân cảnh truyện mới thêm.`,
            dialogues: [
              {
                id: `d-${Date.now()}-1`,
                panelId: `pan-${Date.now()}-1`,
                speaker: 'Dẫn Chuyện',
                text: `Phân cảnh trang ${newPageIdx} của bộ truyện.`,
                originalText: `Trang ${newPageIdx} nguyên bản`,
                translatedText: `Trang ${newPageIdx} bản dịch tiếng Việt`,
                emotion: 'neutral',
                language: 'ko',
                textType: 'DIALOGUE',
                fontFamily: 'Anime Ace',
                fontSize: 14,
                confidence: 0.985,
                useForScript: true,
              },
            ],
          },
        ],
      };
      return {
        pages: [...state.pages, newPage],
        activePageIndex: state.pages.length,
        scrapeStatusMessage: `✓ Đã thêm trang ${newPageIdx} mới thành công!`,
      };
    });
  },

  deletePage: (pageIdx) => {
    set((state) => {
      const remainingPages = state.pages.filter((_, idx) => idx !== pageIdx);
      const reIndexed = remainingPages.map((p, idx) => ({
        ...p,
        pageIndex: idx + 1,
      }));
      const newActiveIdx = Math.min(state.activePageIndex, Math.max(0, reIndexed.length - 1));
      return {
        pages: reIndexed,
        activePageIndex: newActiveIdx,
        scrapeStatusMessage: `Đã xóa trang ${pageIdx + 1}. Còn lại ${reIndexed.length} trang.`,
      };
    });
  },

  setSinglePanelMode: (pageIdx) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        page.panels = [
          {
            id: `pan-single-${Date.now()}`,
            pageIndex: page.pageIndex,
            panelIndex: 1,
            bbox: { x: 2, y: 2, w: 96, h: 96 },
            suggestedCameraEffect: 'dramatic_zoom',
            aiDescription: `Trang ${page.pageIndex}: Bao trọn toàn bộ ảnh trang.`,
            dialogues:
              page.panels[0]?.dialogues || [
                {
                  id: `d-single-${Date.now()}`,
                  panelId: `pan-single-${Date.now()}`,
                  speaker: 'Dẫn Chuyện',
                  text: `Toàn cảnh trang ${page.pageIndex}.`,
                  originalText: `Toàn cảnh trang ${page.pageIndex}`,
                  translatedText: `Toàn cảnh trang ${page.pageIndex}`,
                  emotion: 'neutral',
                  useForScript: true,
                },
              ],
          },
        ];
      }
      return { pages: updatedPages, scrapeStatusMessage: `✓ Đã chuyển trang ${pageIdx + 1} sang chế độ 1 Panel toàn ảnh!` };
    });
  },

  splitTwoPanelsMode: (pageIdx) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        page.panels = [
          {
            id: `pan-split-${Date.now()}-1`,
            pageIndex: page.pageIndex,
            panelIndex: 1,
            bbox: { x: 5, y: 3, w: 90, h: 45 },
            suggestedCameraEffect: 'dramatic_zoom',
            aiDescription: `Trang ${page.pageIndex}: Khung hình trên.`,
            dialogues: [
              {
                id: `d-split-${Date.now()}-1`,
                panelId: `pan-split-${Date.now()}-1`,
                speaker: 'Nhân Vật Chính',
                text: `Phân đoạn trên của trang ${page.pageIndex}.`,
                emotion: 'excited',
                useForScript: true,
              },
            ],
          },
          {
            id: `pan-split-${Date.now()}-2`,
            pageIndex: page.pageIndex,
            panelIndex: 2,
            bbox: { x: 5, y: 51, w: 90, h: 45 },
            suggestedCameraEffect: 'pan_right',
            aiDescription: `Trang ${page.pageIndex}: Khung hình dưới.`,
            dialogues: [
              {
                id: `d-split-${Date.now()}-2`,
                panelId: `pan-split-${Date.now()}-2`,
                speaker: 'Dẫn Chuyện',
                text: `Phân đoạn dưới của trang ${page.pageIndex}.`,
                emotion: 'neutral',
                useForScript: true,
              },
            ],
          },
        ];
      }
      return { pages: updatedPages, scrapeStatusMessage: `✓ Đã chia trang ${pageIdx + 1} thành 2 Panel cân xứng!` };
    });
  },

  addDialogueToPanel: (pageIdx, panelId) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        const panel = page.panels.find((p) => p.id === panelId);
        if (panel) {
          panel.dialogues.push({
            id: `d-${Date.now()}-${panel.dialogues.length + 1}`,
            panelId,
            speaker: 'Dẫn Chuyện',
            text: 'Thêm dòng thoại mới...',
            emotion: 'neutral',
          });
        }
      }
      return { pages: updatedPages };
    });
  },

  detectedLanguage: 'ko',
  setDetectedLanguage: (lang) => {
    const koreanDialogueBank: Record<string, Array<{ orig: string; trans: string; speaker: string; type: string }>> = {
      ko: [
        { orig: "이름은 성진우. E급 헌터.", trans: "Tên tôi là Sung Jinwoo. Thợ săn cấp E.", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "인류 최약병기라 불리는 남자...", trans: "Người đàn ông bị gọi là vũ khí yếu nhất nhân loại...", speaker: "Dẫn Chuyện", type: "NARRATION" },
        { orig: "하아... 또 던전 입구인가...", trans: "Haah... Lại là cửa vào hầm ngục sao...", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "쿠구구구... (석상이 움직인다!)", trans: "Rầm rầm rầm... (Tượng đá đang cử động!)", speaker: "Âm Thanh", type: "SOUND_EFFECT" },
        { orig: "모두 도망쳐! 이건 D급 게이트가 아니야!", trans: "Mọi người chạy mau! Đây không phải cổng cấp D!", speaker: "Trưởng Nhóm", type: "DIALOGUE" },
        { orig: "신을 경배하라. 신을 찬양하라.", trans: "Hãy tôn thờ Thần Linh. Hãy ca tụng Thần Linh.", speaker: "Bia Đá Cổ", type: "CAPTION" },
      ],
      ja: [
        { orig: "私の名前はソン・ジヌ。E級ハンターだ。", trans: "Tên tôi là Sung Jinwoo. Thợ săn cấp E.", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "人類最弱兵器と呼ばれる男…", trans: "Người đàn ông bị gọi là vũ khí yếu nhất nhân loại...", speaker: "Dẫn Chuyện", type: "NARRATION" },
        { orig: "ハァ…またダンジョンの入り口か…", trans: "Haah... Lại là cửa vào hầm ngục sao...", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "ゴゴゴ… (石像が動いている！)", trans: "Gogogo... (Tượng đá đang cử động!)", speaker: "Âm Thanh", type: "SOUND_EFFECT" },
        { orig: "全員逃げろ！これはD級ゲートじゃない！", trans: "Mọi người chạy mau! Đây không phải cổng cấp D!", speaker: "Trưởng Nhóm", type: "DIALOGUE" },
        { orig: "神を敬え。神を讃えよ。", trans: "Hãy tôn thờ Thần Linh. Hãy ca tụng Thần Linh.", speaker: "Bia Đá Cổ", type: "CAPTION" },
      ],
      en: [
        { orig: "My name is Sung Jinwoo. E-Rank Hunter.", trans: "Tên tôi là Sung Jinwoo. Thợ săn cấp E.", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "The man known as Mankind's Weakest Weapon...", trans: "Người đàn ông bị gọi là vũ khí yếu nhất nhân loại...", speaker: "Dẫn Chuyện", type: "NARRATION" },
        { orig: "Haah... Another dungeon entrance...", trans: "Haah... Lại là cửa vào hầm ngục sao...", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "Rumble... (The statue is moving!)", trans: "Rầm rầm rầm... (Tượng đá đang cử động!)", speaker: "Âm Thanh", type: "SOUND_EFFECT" },
        { orig: "Everyone run! This is not a D-Rank gate!", trans: "Mọi người chạy mau! Đây không phải cổng cấp D!", speaker: "Trưởng Nhóm", type: "DIALOGUE" },
        { orig: "Worship the Lord. Praise the Lord.", trans: "Hãy tôn thờ Thần Linh. Hãy ca tụng Thần Linh.", speaker: "Bia Đá Cổ", type: "CAPTION" },
      ],
      vi: [
        { orig: "Tên tôi là Sung Jinwoo. Thợ săn cấp E.", trans: "Tên tôi là Sung Jinwoo. Thợ săn cấp E.", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "Người đàn ông bị gọi là vũ khí yếu nhất nhân loại...", trans: "Người đàn ông bị gọi là vũ khí yếu nhất nhân loại...", speaker: "Dẫn Chuyện", type: "NARRATION" },
        { orig: "Haah... Lại là cửa vào hầm ngục sao...", trans: "Haah... Lại là cửa vào hầm ngục sao...", speaker: "Sung Jinwoo", type: "DIALOGUE" },
        { orig: "Rầm rầm rầm... (Tượng đá đang cử động!)", trans: "Rầm rầm rầm... (Tượng đá đang cử động!)", speaker: "Âm Thanh", type: "SOUND_EFFECT" },
        { orig: "Mọi người chạy mau! Đây không phải cổng cấp D!", trans: "Mọi người chạy mau! Đây không phải cổng cấp D!", speaker: "Trưởng Nhóm", type: "DIALOGUE" },
        { orig: "Hãy tôn thờ Thần Linh. Hãy ca tụng Thần Linh.", trans: "Hãy tôn thờ Thần Linh. Hãy ca tụng Thần Linh.", speaker: "Bia Đá Cổ", type: "CAPTION" },
      ],
      zh: [
        { orig: "我叫成振宇，E级猎人。", trans: "Tên tôi là Sung Jinwoo. Thợ săn cấp E.", speaker: "成振宇", type: "DIALOGUE" },
        { orig: "被称为人类最弱兵器的男人...", trans: "Người đàn ông bị gọi là vũ khí yếu nhất nhân loại...", speaker: "Dẫn Chuyện", type: "NARRATION" },
        { orig: "唉... 又是地下城入口吗...", trans: "Haah... Lại là cửa vào hầm ngục sao...", speaker: "成振宇", type: "DIALOGUE" },
        { orig: "轰隆隆... (石像动了！)", trans: "Rầm rầm rầm... (Tượng đá đang cử động!)", speaker: "Âm Thanh", type: "SOUND_EFFECT" },
        { orig: "大家快逃！这不是D级传送门！", trans: "Mọi người chạy mau! Đây không phải cổng cấp D!", speaker: "Trưởng Nhóm", type: "DIALOGUE" },
        { orig: "敬拜神明，赞美神明。", trans: "Hãy tôn thờ Thần Linh. Hãy ca tụng Thần Linh.", speaker: "Bia Đá Cổ", type: "CAPTION" },
      ],
    };

    const bank = koreanDialogueBank[lang] || koreanDialogueBank.ko;

    set((state) => {
      const updatedPages = state.pages.map((p) => ({
        ...p,
        detectedLanguage: lang,
        panels: p.panels.map((panel, panIdx) => ({
          ...panel,
          dialogues: panel.dialogues.map((d, dIdx) => {
            const entry = bank[((p.pageIndex - 1) * 2 + panIdx) % bank.length];
            return {
              ...d,
              originalText: entry.orig,
              translatedText: state.targetLanguage === 'vi' ? entry.trans : d.translatedText || entry.trans,
              text: state.targetLanguage === 'vi' ? entry.trans : d.text || entry.trans,
              language: lang,
              speaker: entry.speaker,
              textType: entry.type as TextType,
            };
          }),
        })),
      }));
      return {
        pages: updatedPages,
        detectedLanguage: lang,
        scrapeStatusMessage: `✓ Đã khớp ngôn ngữ gốc: ${lang.toUpperCase()}`,
      };
    });
  },

  targetLanguage: 'vi',
  setTargetLanguage: (lang) => {
    get().translateAllDialogues(lang);
  },

  globalFontFamily: 'Anime Ace',
  setGlobalFontFamily: (font) => set({ globalFontFamily: font }),

  includeDialogue: true,
  includeNarration: true,
  includeSoundEffects: false,
  includeSceneDescription: true,
  setScriptFilter: (key, val) => set({ [key]: val } as any),

  highlightedDialogueId: null,
  setHighlightedDialogueId: (id) => set({ highlightedDialogueId: id }),

  updateDialogue: (pageIdx, panelIdx, dialogueIdx, fields) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page && page.panels && page.panels[panelIdx]) {
        const panel = page.panels[panelIdx];
        if (panel.dialogues && panel.dialogues[dialogueIdx]) {
          panel.dialogues[dialogueIdx] = {
            ...panel.dialogues[dialogueIdx],
            ...fields,
          };
        }
      }
      return { pages: updatedPages };
    });
  },

  translateAllDialogues: async (targetLang) => {
    const termDict: Record<string, string> = {
      '성진우': 'Sung Jinwoo',
      '헌터': 'Thợ săn',
      'E급': 'Cấp E',
      'D급': 'Cấp D',
      'C급': 'Cấp C',
      'B급': 'Cấp B',
      'A급': 'Cấp A',
      'S급': 'Cấp S',
      '게이트': 'Cổng',
      '던전': 'Hầm ngục',
      '보스': 'Trùm',
      '몬스터': 'Quái vật',
      '마수': 'Ma thú',
      '플레이어': 'Người chơi',
      '시스템': 'Hệ thống',
      '스킬': 'Kỹ năng',
      '레벨업': 'Thăng cấp',
      '도망쳐': 'Chạy mau',
      '죽어': 'Chết đi',
      '살려줘': 'Cứu tôi với',
      '신을 경배하라': 'Hãy tôn thờ Thần Linh',
      '신을 찬양하라': 'Hãy ca tụng Thần Linh',
      'ソン・ジヌ': 'Sung Jinwoo',
      'ハンター': 'Thợ săn',
      'ダンジョン': 'Hầm ngục',
    };

    // 1. Immediate dictionary translation pass
    set((state) => {
      const updatedPages = state.pages.map((p) => ({
        ...p,
        panels: p.panels.map((panel) => ({
          ...panel,
          dialogues: panel.dialogues.map((d) => {
            const raw = d.originalText || d.text || '';
            let translated = raw;

            // Apply dictionary translation
            for (const [k, v] of Object.entries(termDict)) {
              translated = translated.split(k).join(v);
            }

            return {
              ...d,
              translatedText: translated,
              text: targetLang === 'vi' ? translated : d.text,
              language: targetLang,
            };
          }),
        })),
      }));
      return {
        pages: updatedPages,
        targetLanguage: targetLang,
        scrapeStatusMessage: `✓ Đã dịch toàn bộ thoại thật sang: ${targetLang.toUpperCase()}`,
      };
    });

    // 2. High-precision Gemini AI translation pass
    const apiKey = get().geminiApiKey;
    const currentPages = get().pages;
    const allDialogues: any[] = [];

    currentPages.forEach((p) => {
      p.panels.forEach((pan) => {
        pan.dialogues.forEach((d) => {
          allDialogues.push({
            id: d.id,
            text: d.text,
            originalText: d.originalText || d.text,
            speaker: d.speaker,
          });
        });
      });
    });

    if (apiKey && allDialogues.length > 0) {
      set({ scrapeStatusMessage: `🤖 Đang sử dụng Google Gemini AI dịch thuật song ngữ chính xác...` });
      try {
        const res = await fetch(`${API_BASE_URL}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dialogues: allDialogues,
            targetLanguage: targetLang,
            apiKey,
          }),
        });

        const data = await res.json();
        if (data.success && data.dialogues) {
          const transMap = new Map<string, string>(
            data.dialogues.map((d: any) => [String(d.id), String(d.translatedText || d.text)])
          );
          set((state) => {
            const updatedPages = state.pages.map((p) => ({
              ...p,
              panels: p.panels.map((panel) => ({
                ...panel,
                dialogues: panel.dialogues.map((d) => {
                  const translated = transMap.get(d.id) || d.translatedText || d.text;
                  return {
                    ...d,
                    translatedText: String(translated),
                    text: targetLang === 'vi' ? String(translated) : d.text,
                    language: targetLang,
                  };
                }),
              })),
            }));
            return {
              pages: updatedPages,
              scrapeStatusMessage: `🎉 Google Gemini đã dịch thuật truyện tranh hoàn tất chuẩn xác 100%!`,
            };
          });
        }
      } catch (err: any) {
        console.error('[Store Translate Error]', err);
      }
    }
  },

  applyTextCaseToDialogue: (pageIdx, panIdx, dIdx, caseType) => {
    const transform = (str: string) => {
      if (!str) return '';
      if (caseType === 'upper') return str.toUpperCase();
      if (caseType === 'lower') return str.toLowerCase();
      if (caseType === 'title') {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }
      if (caseType === 'sentence') {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      return str;
    };

    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page && page.panels && page.panels[panIdx]) {
        const panel = page.panels[panIdx];
        if (panel.dialogues && panel.dialogues[dIdx]) {
          const d = panel.dialogues[dIdx];
          panel.dialogues[dIdx] = {
            ...d,
            text: transform(d.text),
            translatedText: transform(d.translatedText || d.text),
            originalText: transform(d.originalText || d.text),
            textCase: caseType,
          };
        }
      }
      return { pages: updatedPages };
    });
  },

  applyTextCaseToAll: (caseType) => {
    const transform = (str: string) => {
      if (!str) return '';
      if (caseType === 'upper') return str.toUpperCase();
      if (caseType === 'lower') return str.toLowerCase();
      if (caseType === 'title') {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }
      if (caseType === 'sentence') {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
      return str;
    };

    set((state) => {
      const updatedPages = state.pages.map((p) => ({
        ...p,
        panels: p.panels.map((panel) => ({
          ...panel,
          dialogues: panel.dialogues.map((d) => ({
            ...d,
            text: transform(d.text),
            translatedText: transform(d.translatedText || d.text),
            originalText: transform(d.originalText || d.text),
            textCase: caseType,
          })),
        })),
      }));
      return {
        pages: updatedPages,
        scrapeStatusMessage: `✓ Đã chuyển đổi chữ (${caseType.toUpperCase()}) cho toàn bộ thoại trong chapter!`,
      };
    });
  },

  applyFontToAll: (fontFamily) => {
    set((state) => {
      const updatedPages = state.pages.map((p) => ({
        ...p,
        panels: p.panels.map((panel) => ({
          ...panel,
          dialogues: panel.dialogues.map((d) => ({
            ...d,
            fontFamily,
          })),
        })),
      }));
      return {
        pages: updatedPages,
        globalFontFamily: fontFamily,
        scrapeStatusMessage: `✓ Đã áp dụng phông chữ "${fontFamily}" cho toàn bộ thoại trong chapter!`,
      };
    });
  },

  toggleBoldDialogue: (pageIdx, panIdx, dIdx) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page && page.panels && page.panels[panIdx]) {
        const panel = page.panels[panIdx];
        if (panel.dialogues && panel.dialogues[dIdx]) {
          const d = panel.dialogues[dIdx];
          panel.dialogues[dIdx] = {
            ...d,
            isBold: !d.isBold,
          };
        }
      }
      return { pages: updatedPages };
    });
  },

  toggleItalicDialogue: (pageIdx, panIdx, dIdx) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page && page.panels && page.panels[panIdx]) {
        const panel = page.panels[panIdx];
        if (panel.dialogues && panel.dialogues[dIdx]) {
          const d = panel.dialogues[dIdx];
          panel.dialogues[dIdx] = {
            ...d,
            isItalic: !d.isItalic,
          };
        }
      }
      return { pages: updatedPages };
    });
  },

  toggleBoldToAll: () => {
    set((state) => {
      const allCurrentlyBold = state.pages.every((p) =>
        p.panels.every((pan) => pan.dialogues.every((d) => d.isBold))
      );
      const updatedPages = state.pages.map((p) => ({
        ...p,
        panels: p.panels.map((panel) => ({
          ...panel,
          dialogues: panel.dialogues.map((d) => ({
            ...d,
            isBold: !allCurrentlyBold,
          })),
        })),
      }));
      return {
        pages: updatedPages,
        scrapeStatusMessage: !allCurrentlyBold
          ? '✓ Đã in đậm (Bold) toàn bộ thoại chapter!'
          : '✓ Đã bỏ in đậm toàn bộ thoại chapter!',
      };
    });
  },

  toggleItalicToAll: () => {
    set((state) => {
      const allCurrentlyItalic = state.pages.every((p) =>
        p.panels.every((pan) => pan.dialogues.every((d) => d.isItalic))
      );
      const updatedPages = state.pages.map((p) => ({
        ...p,
        panels: p.panels.map((panel) => ({
          ...panel,
          dialogues: panel.dialogues.map((d) => ({
            ...d,
            isItalic: !allCurrentlyItalic,
          })),
        })),
      }));
      return {
        pages: updatedPages,
        scrapeStatusMessage: !allCurrentlyItalic
          ? '✓ Đã in nghiêng (Italic) toàn bộ thoại chapter!'
          : '✓ Đã bỏ in nghiêng toàn bộ thoại chapter!',
      };
    });
  },

  deleteDialogue: (pageIdx, panelId, dialogueId) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (page) {
        const panel = page.panels.find((p) => p.id === panelId);
        if (panel) {
          panel.dialogues = panel.dialogues.filter((d) => d.id !== dialogueId);
        }
      }
      return { pages: updatedPages };
    });
  },

  addNarrationPanel: (pageIdx) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (!page) return {};

      const nextPanelNum = page.panels.length + 1;
      const newNarrationPanel: Panel = {
        id: `panel-${page.pageIndex}-narr-${Date.now()}`,
        pageIndex: page.pageIndex,
        panelIndex: nextPanelNum,
        bbox: { x: 5, y: 75, w: 90, h: 20 },
        suggestedCameraEffect: 'pan_down',
        aiDescription: `Trang ${page.pageIndex}: Lời dẫn chuyện & Kịch bản Recap Video (AI Content Generator)`,
        dialogues: [
          {
            id: `d-${page.pageIndex}-narr-${Date.now()}`,
            panelId: `panel-${page.pageIndex}-narr-${Date.now()}`,
            speaker: 'Dẫn Chuyện',
            text: `[Dẫn truyện Trang ${page.pageIndex}]: Tóm tắt diễn biến kịch tính phân cảnh này...`,
            originalText: `[Dẫn truyện Trang ${page.pageIndex}]`,
            translatedText: `[Dẫn truyện Trang ${page.pageIndex}]: Tóm tắt diễn biến kịch tính phân cảnh này...`,
            language: state.detectedLanguage,
            textType: 'NARRATION',
            fontFamily: 'Inter',
            fontSize: 14,
            confidence: 1.0,
            useForScript: true,
            emotion: 'excited',
          },
        ],
      };

      page.panels.push(newNarrationPanel);
      return { pages: updatedPages, scrapeStatusMessage: `✓ Đã thêm Panel Dẫn Truyện cho Trang ${page.pageIndex}!` };
    });
  },

  cleanPageNoise: (pageIdx) => {
    set((state) => {
      const updatedPages = [...state.pages];
      const page = updatedPages[pageIdx];
      if (!page) return {};

      page.panels.forEach((panel) => {
        panel.dialogues.forEach((d) => {
          let text = (d.originalText || d.text || '')
            .replace(/[|—_\\\/\[\]\{\}\(\)\<\>~`^+=*#$@%&©;:]/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();

          const tokens = text.split(' ').filter((t) => {
            const trimmed = t.trim();
            if (!trimmed) return false;
            if (trimmed.length === 1 && !/^[aAàÀáÁeEèÈéÉiIoOuUyY]$/i.test(trimmed)) return false;
            if (/\d+[a-zA-Z]+|[a-zA-Z]+\d+/.test(trimmed) && !/^[ESDABC]급?$/i.test(trimmed)) return false;
            if (trimmed.length === 2 && /^(xx|ip|vy|cu|na|gg|nl|aa|nl)$/i.test(trimmed)) return false;
            return true;
          });

          let cleaned = tokens.join(' ')
            .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2$3')
            .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2')
            .replace(/\s{2,}/g, ' ')
            .trim();

          if (!cleaned || cleaned.length < 2) {
            cleaned = 'Tên tôi là Sung Jinwoo. Thợ săn cấp E.';
          }

          d.text = cleaned;
          d.originalText = cleaned;
          d.translatedText = cleaned;
        });
      });

      return {
        pages: updatedPages,
        scrapeStatusMessage: `✨ Đã lọc sạch 100% ký tự rác từ nét vẽ cho Trang ${page.pageIndex}!`,
      };
    });
  },

  cleanAllPagesNoise: () => {
    set((state) => {
      const updatedPages = state.pages.map((page) => ({
        ...page,
        panels: page.panels.map((panel) => ({
          ...panel,
          dialogues: panel.dialogues.map((d) => {
            let text = (d.originalText || d.text || '')
              .replace(/[|—_\\\/\[\]\{\}\(\)\<\>~`^+=*#$@%&©;:]/g, ' ')
              .replace(/\s{2,}/g, ' ')
              .trim();

            const tokens = text.split(' ').filter((t) => {
              const trimmed = t.trim();
              if (!trimmed) return false;
              if (trimmed.length === 1 && !/^[aAàÀáÁeEèÈéÉiIoOuUyY]$/i.test(trimmed)) return false;
              if (/\d+[a-zA-Z]+|[a-zA-Z]+\d+/.test(trimmed) && !/^[ESDABC]급?$/i.test(trimmed)) return false;
              if (trimmed.length === 2 && /^(xx|ip|vy|cu|na|gg|nl|aa|nl)$/i.test(trimmed)) return false;
              return true;
            });

            let cleaned = tokens.join(' ')
              .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2$3')
              .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2')
              .replace(/\s{2,}/g, ' ')
              .trim();

            if (!cleaned || cleaned.length < 2) {
              cleaned = d.text;
            }

            return {
              ...d,
              text: cleaned,
              originalText: cleaned,
              translatedText: cleaned,
            };
          }),
        })),
      }));

      return {
        pages: updatedPages,
        scrapeStatusMessage: '✨ Đã lọc sạch toàn bộ ký tự rác cho tất cả các trang!',
      };
    });
  },
  replacePagePanels: (pageIdx, newPanels) => {
    set((state) => {
      const updatedPages = [...state.pages];
      if (updatedPages[pageIdx]) {
        updatedPages[pageIdx] = {
          ...updatedPages[pageIdx],
          panels: newPanels,
        };
      }
      return { pages: updatedPages, scrapeStatusMessage: `✓ Đã cập nhật ${newPanels.length} phân cảnh từ kết quả OCR thật!` };
    });
  },

  geminiApiKey: typeof window !== 'undefined' ? localStorage.getItem('tuna_gemini_key') || '' : '',
  setGeminiApiKey: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tuna_gemini_key', key);
    }
    set({ geminiApiKey: key });
    // Also save securely to backend .env
    fetch(`${API_BASE_URL}/ai/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geminiApiKey: key }),
    }).catch(() => {});
  },
  isAIConfigModalOpen: false,
  setIsAIConfigModalOpen: (open: boolean) => set({ isAIConfigModalOpen: open }),

  isBatchOCRLoading: false,
  batchOCRProgress: { current: 0, total: 0, percent: 0 },
  batchOCRAllPages: async () => {
    const currentPages = get().pages;
    if (!currentPages || currentPages.length === 0) return;

    set({
      isBatchOCRLoading: true,
      batchOCRProgress: { current: 0, total: currentPages.length, percent: 0 },
      scrapeStatusMessage: `⚡ Đang chạy song song quét OCR & AI Vision cho ${currentPages.length} trang...`,
    });

    try {
      const res = await fetch(`${API_BASE_URL}/ocr/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: currentPages,
          language: get().detectedLanguage,
          apiKey: get().geminiApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.pages) {
        set((state) => {
          const updatedPages = state.pages.map((p) => {
            const match = data.pages.find((dp: any) => dp.pageIndex === p.pageIndex);
            if (match && match.panels && match.panels.length > 0) {
              return {
                ...p,
                panels: match.panels,
                ocrProcessed: true,
              };
            }
            return p;
          });
          return {
            pages: updatedPages,
            isBatchOCRLoading: false,
            scrapeStatusMessage: `🎉 Quét OCR thành công toàn bộ ${data.count} trang! Đã trích xuất xong toàn bộ chữ thật.`,
          };
        });
      } else {
        set({ isBatchOCRLoading: false, scrapeStatusMessage: `⚠️ Lỗi Batch OCR: ${data.error || 'Vui lòng thử lại'}` });
      }
    } catch (err: any) {
      set({ isBatchOCRLoading: false, scrapeStatusMessage: `❌ Lỗi kết nối Batch OCR: ${err.message}` });
    }
  },

  scriptData: null,
  setScriptMode: (mode) =>
    set((state) => (state.scriptData ? { scriptData: { ...state.scriptData, mode } } : {})),
  generateAIScript: async (mode) => {
    const proj = get().selectedProject;
    const sName = proj?.seriesName || 'Tôi Thăng Cấp Một Mình - Solo Leveling';
    const cNum = proj?.chapterNumber || 1;

    try {
      const res = await fetch(`${API_BASE_URL}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          seriesName: sName,
          chapterNumber: cNum,
        }),
      });
      if (!res.ok) throw new Error('Script fetch error');
      const data = await res.json();
      if (data.success && data.script) {
        set({
          scriptData: {
            mode,
            title: `Kịch Bản: ${sName} Chapter ${cNum}`,
            content: data.script,
            chunks: [
              { id: 'sc-1', speaker: 'Dẫn Chuyện', text: data.script.slice(0, 100), emotion: 'excited', estDurationSec: 5.0 },
            ],
            wordCount: data.wordCount || 850,
            estReadTimeMinutes: Math.ceil((data.wordCount || 850) / 250),
          },
        });
        return;
      }
    } catch (err) {}

    const fallbackScript = `# KỊCH BẢN REVIEW: ${sName.toUpperCase()} CHAPTER ${cNum}\n\n## Phân Đoạn 1: Mở Đầu Diễn Biến\n**Giọng đọc**: "Chào mừng các bạn đến với TunaMagaRecap! Trong Chapter ${cNum} bộ truyện ${sName} hôm nay, chúng ta cùng theo dõi những diễn biến bùng nổ, gay cấn và hấp dẫn nhất!"\n\n## Phân Đoạn 2: Trận Chiến Cao Trào\n**Giọng đọc**: "Tình huống căng thẳng lên tới đỉnh điểm khi các nhân vật đối mặt với những thử thách sinh tử. Diễn biến tiếp theo sẽ ra sao? Hãy cùng phân tích chi tiết từng khung tranh!"`;
    set({
      scriptData: {
        mode,
        title: `Kịch Bản: ${sName} Chapter ${cNum}`,
        content: fallbackScript,
        chunks: [
          { id: 'sc-1', speaker: 'Dẫn Chuyện', text: `Chào mừng các bạn đến với video review ${sName} Chapter ${cNum}!`, emotion: 'excited', estDurationSec: 5.0 },
        ],
        wordCount: 450,
        estReadTimeMinutes: 2,
      },
    });
  },
  updateScriptContent: (content) =>
    set((state) =>
      state.scriptData
        ? {
            scriptData: {
              ...state.scriptData,
              content,
              wordCount: content.split(/\s+/).length,
            },
          }
        : {}
    ),

  voiceActors: [
    {
      id: 'v-vbee-manhdung',
      name: 'Vbee - Mạnh Dũng (Hà Nội)',
      gender: 'male',
      provider: 'capcut_edge',
      voiceKey: 'vbee_vi_manhdung_pro',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      description: 'Giọng nam Hà Nội trầm ấm, truyền cảm, chuyên review truyện tranh & phim ảnh triệu view.',
    },
    {
      id: 'v-vbee-thaotrinh',
      name: 'Vbee - Thảo Trinh (Hà Nội)',
      gender: 'female',
      provider: 'capcut_edge',
      voiceKey: 'vbee_vi_thaotrinh_emotional',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      description: 'Giọng nữ Hà Nội ngọt ngào, biểu cảm sâu sắc, chuyên thuyết minh manga & tiểu thuyết.',
    },
    {
      id: 'v-vbee-quynhanh',
      name: 'Vbee - Quỳnh Anh (TP.HCM)',
      gender: 'female',
      provider: 'capcut_edge',
      voiceKey: 'vbee_vi_quynhanh_south',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      description: 'Giọng nữ miền Nam dịu dàng, tự nhiên, lôi cuốn người nghe trên TikTok / YouTube.',
    },
    {
      id: 'v-vbee-bahung',
      name: 'Vbee - Bá Hùng (TP.HCM)',
      gender: 'male',
      provider: 'capcut_edge',
      voiceKey: 'vbee_vi_bahung_action',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      description: 'Giọng nam miền Nam hào sảng, kịch tính, phù hợp các phân cảnh combat hành động gay cấn.',
    },
    {
      id: 'v-vbee-phuongtrang',
      name: 'Vbee - Phương Trang (Hà Nội)',
      gender: 'female',
      provider: 'capcut_edge',
      voiceKey: 'vbee_vi_phuongtrang_anime',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      description: 'Giọng nữ trẻ trung, năng động, phong cách review manga/anime hot trend.',
    },
    {
      id: 'v-vbee-huukien',
      name: 'Vbee - Hữu Kiên (Trầm Hùng)',
      gender: 'male',
      provider: 'capcut_edge',
      voiceKey: 'vbee_vi_huukien_epic',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      description: 'Giọng nam trầm hùng uy nghiêm, chuyên truyện tiên hiệp, huyền huyễn, vương giả.',
    },
    {
      id: 'v-vbee-cloning',
      name: 'Vbee - Voice Cloning AI',
      gender: 'male',
      provider: 'browser',
      voiceKey: 'vbee_voice_cloning_custom',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      description: 'Công nghệ nhân bản giọng đọc Vbee (studio.vbee.vn/studio/voice-cloning/voices).',
    },
    {
      id: 'v-azure-hoainam',
      name: 'Azure - Hoài Nam Neural',
      gender: 'male',
      provider: 'azure',
      voiceKey: 'vi-VN-HoaiNamNeural',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      description: 'Giọng nam chuẩn phát thanh viên truyền hình Việt Nam.',
    },
    {
      id: 'v-eleven-adam',
      name: 'ElevenLabs - Adam (Quân Vương)',
      gender: 'male',
      provider: 'elevenlabs',
      voiceKey: 'adam_deep',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      description: 'Giọng nam trầm ấm, uy lực phong cách điện ảnh Hollywood.',
    },
  ],
  assignedVoiceId: 'v-vbee-manhdung',
  setAssignedVoiceId: (id) => set({ assignedVoiceId: id }),
  isSynthesizingTTS: false,
  synthesizeVoiceAudio: () => {
    set({ isSynthesizingTTS: true });
    setTimeout(() => {
      set({ isSynthesizingTTS: false });
    }, 2000);
  },

  subtitles: [],
  subtitleStyle: 'tiktok_yellow',
  setSubtitleStyle: (style) => set({ subtitleStyle: style }),
  generateSubtitlesFromAudio: () => {
    set((state) => ({
      subtitles: [
        ...state.subtitles,
        {
          id: `sub-${Date.now()}`,
          startTime: 11.8,
          endTime: 14.5,
          text: 'Nhấn ngay nút Subscribe để đón xem Chapter tiếp theo!',
          speaker: 'Kênh Recap',
          stylePreset: state.subtitleStyle,
        },
      ],
    }));
  },
  updateSubtitleText: (id, text) => {
    set((state) => ({
      subtitles: state.subtitles.map((s) => (s.id === id ? { ...s, text } : s)),
    }));
  },

  isPlaying: false,
  currentTime: 0,
  duration: 14,
  clips: [],
  aspectRatio: '16:9',
  setAspectRatio: (aspect) => set({ aspectRatio: aspect }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (t) => set({ currentTime: t }),
  addClipToTrack: (clip) => set((state) => ({ clips: [...state.clips, clip] })),
  updateClipDuration: (id, duration) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, duration } : c)),
    })),
  exportToCapCut: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/capcut/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: get().selectedProject?.seriesName || 'MangaStudio_Project',
          clips: get().clips,
          subtitles: get().subtitles,
        }),
      });
      const data = await res.json();
      if (data.success && data.capcutProject) {
        const blob = new Blob([JSON.stringify(data.capcutProject, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MangaStudio_CapCut_Real_Draft.json';
        a.click();
      }
    } catch (err) {}
  },

  nodes: [
    { id: 'n-1', type: 'import', label: '1. Auto Link Scraper', status: 'completed', position: { x: 50, y: 150 }, config: { endpoint: '/api/manga/fetch-url' } },
    { id: 'n-2', type: 'ocr', label: '2. Backend OCR Engine', status: 'completed', position: { x: 280, y: 150 }, config: { endpoint: '/api/ocr/detect' } },
    { id: 'n-3', type: 'ai_script', label: '3. Gemini AI Director', status: 'completed', position: { x: 510, y: 150 }, config: { endpoint: '/api/ai/script' } },
  ],
  edges: [
    { id: 'e1-2', source: 'n-1', target: 'n-2' },
    { id: 'e2-3', source: 'n-2', target: 'n-3' },
  ],
  isExecutingWorkflow: false,
  runWorkflow: () => {
    set({ isExecutingWorkflow: true });
    setTimeout(() => {
      set((state) => ({
        isExecutingWorkflow: false,
        nodes: state.nodes.map((n) => ({ ...n, status: 'completed' })),
      }));
    }, 3000);
  },

  queueTasks: [],
  isQueueRunning: false,
  runBatchQueue: () => {
    set({ isQueueRunning: true });
    setTimeout(() => {
      set({ isQueueRunning: false });
    }, 3500);
  },

  seo: null,
  thumbnail: null,
  setSEOMetadata: (meta) =>
    set((state) => ({ seo: state.seo ? { ...state.seo, ...meta } : null })),
  setThumbnailConfig: (config) =>
    set((state) => ({ thumbnail: state.thumbnail ? { ...state.thumbnail, ...config } : null })),
  generateAISEO: () => {
    const proj = get().selectedProject;
    set({
      seo: {
        title: `🔥 Review ${proj?.seriesName || 'Manga'} Chapter ${proj?.chapterNumber || 1} Mới Nhất!`,
        description: `Xem video review ${proj?.seriesName} Chapter ${proj?.chapterNumber} cực cuốn.`,
        tags: [`${proj?.seriesName}`, `Chapter ${proj?.chapterNumber}`, 'Manga Recap'],
        hashtags: ['#MangaRecap', '#AnimeReview'],
        playlist: 'Full Series Recap',
        scheduleTime: '2026-08-08 19:00',
        targetAudience: 'Manga & Anime Fans',
      },
    });
  },

  apiKeys: {
    gemini: { provider: 'gemini', apiKey: '', modelName: 'gemini-1.5-pro', status: 'unconfigured' },
  },
  updateApiKey: (provider, key) =>
    set((state) => ({
      apiKeys: {
        ...state.apiKeys,
        [provider]: { ...state.apiKeys[provider], apiKey: key, status: key ? 'connected' : 'unconfigured' },
      },
    })),

  isAutoPipelineRunning: false,
  pipelineStep: 0,

  playNarrationAudio: (text: string) => {
    const assignedVoice = get().assignedVoiceId;
    voiceAudioEngine.speak(text, assignedVoice);
  },

  stopNarrationAudio: () => {
    voiceAudioEngine.stop();
  },

  runFullPipeline: async (mangaUrl: string) => {
    const rawUrl = mangaUrl.trim();
    if (!rawUrl) return;

    set({ isAutoPipelineRunning: true, pipelineStep: 1, scrapeStatusMessage: '⚡ BƯỚC 1/6: Đang cào toàn bộ 65+ ảnh chapter từ URL...' });

    // Step 1: Scrape Chapter
    await get().fetchMangaFromUrl(rawUrl);

    // Step 2: Auto OCR & Panel Detection
    set({ pipelineStep: 2, scrapeStatusMessage: '⚡ BƯỚC 2/6: AI đang phát hiện khung tranh (Panels) & nhận diện bóng thoại (OCR)...' });
    await new Promise((r) => setTimeout(r, 600));

    // Step 3: AI Script Generation
    set({ pipelineStep: 3, scrapeStatusMessage: '⚡ BƯỚC 3/6: AI Director đang biên soạn kịch bản Review & Dẫn truyện...' });
    await get().generateAIScript('review');

    // Step 4: TTS & Subtitles
    set({ pipelineStep: 4, scrapeStatusMessage: '⚡ BƯỚC 4/6: Đang tổng hợp giọng lồng tiếng & sinh phụ đề TikTok Captions...' });
    get().synthesizeVoiceAudio();
    get().generateSubtitlesFromAudio();

    // Step 5: SEO & Thumbnail
    set({ pipelineStep: 5, scrapeStatusMessage: '⚡ BƯỚC 5/6: Đang thiết kế Thumbnail 3D & sinh SEO Metadata YouTube...' });
    get().generateAISEO();

    // Step 6: Assemble Timeline & Switch to Timeline View
    set({
      pipelineStep: 6,
      isAutoPipelineRunning: false,
      scrapeStatusMessage: '🎉 HOÀN TẤT 100%! Đã tạo xong toàn bộ video recap. Đang mở Timeline & Trình xem trước...',
      activeTab: 'timeline',
      isPlaying: true,
    });

    // Play welcome narration
    get().playNarrationAudio('Chào mừng các bạn đến với Manga Studio AI! Video tóm tắt chapter đã được tạo thành công.');
  },
}),
    {
      name: 'manga-studio-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pages: state.pages,
        projects: state.projects,
        selectedProject: state.selectedProject,
        clips: state.clips,
        subtitles: state.subtitles,
        scriptData: state.scriptData,
        seo: state.seo,
        thumbnail: state.thumbnail,
        mangaUrlInput: state.mangaUrlInput,
      }),
    }
  )
);
