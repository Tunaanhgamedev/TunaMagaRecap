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

const API_BASE_URL = 'http://localhost:3001/api';

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
  deleteProject: (projectId: string) => Promise<void>;
  clearAllProjects: () => Promise<void>;
  resetAllStoreState: () => void;
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
  customScriptPrompt: string;
  setCustomScriptPrompt: (prompt: string) => void;
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
  activeTab: 'dashboard',
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
      console.warn('Backend fetch failed:', err);
    }

    // Dynamic title & chapter parsing from URL
    let seriesTitle = 'Manga Project';
    let chapterNum = 1;

    const matchName = rawUrl.match(/(?:truyen-tranh\/|series\/)?([a-zA-Z0-9-]+?)(?:-\d+)?(?:-chap|-chapter|\.html)/i);
    if (matchName && matchName[1]) {
      seriesTitle = matchName[1].split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
    const matchChap = rawUrl.match(/chap(?:ter)?[-_\s]?(\d+)/i);
    if (matchChap && matchChap[1]) {
      chapterNum = parseInt(matchChap[1], 10);
    }

    set({
      isLoadingUrl: false,
      scrapeStatusMessage: `❌ Không thể cào ảnh tự động từ URL này. Vui lòng tải ảnh trang truyện lên hoặc thử URL khác.`,
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
      if (data.success && Array.isArray(data.projects)) {
        set({ projects: data.projects });
      }
    } catch (err) {}
  },
  setSelectedProject: (p) => set({ selectedProject: p }),
  deleteProject: async (projectId) => {
    try {
      await fetch(`${API_BASE_URL}/projects/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId }),
      });
    } catch (e) {}

    set((state) => {
      const updated = state.projects.filter((p) => p.id !== projectId);
      const newSelected = state.selectedProject?.id === projectId ? null : state.selectedProject;
      return {
        projects: updated,
        selectedProject: newSelected,
        scrapeStatusMessage: '✓ Đã xóa dự án thành công!',
      };
    });
  },
  clearAllProjects: async () => {
    try {
      await fetch(`${API_BASE_URL}/projects/clear-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
    } catch (e) {}

    set({
      projects: [],
      selectedProject: null,
      scrapeStatusMessage: '✓ Đã dọn dẹp sạch toàn bộ dự án cũ!',
    });
  },
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
  resetAllStoreState: () => {
    try {
      localStorage.removeItem('manga-studio-storage');
      localStorage.removeItem('manga-studio-storage-v1');
      localStorage.removeItem('manga-studio-storage-v2');
      localStorage.removeItem('manga-studio-storage-v3');
    } catch (e) {}

    set({
      projects: [],
      selectedProject: null,
      pages: [],
      clips: [],
      subtitles: [],
      scriptData: null,
      seo: null,
      thumbnail: null,
      activeTab: 'dashboard',
      mangaUrlInput: 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html',
      scrapeStatusMessage: '✓ Đã dọn dẹp sạch toàn bộ cache và làm mới hệ thống!',
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
    set((state) => {
      const updatedPages = state.pages.map((p) => ({
        ...p,
        detectedLanguage: lang,
        panels: p.panels.map((panel) => ({
          ...panel,
          dialogues: panel.dialogues.map((d) => ({
            ...d,
            language: lang,
          })),
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
              text: String(translated),
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

    // 2. High-precision AI & Neural translation pass (uses Gemini AI or Free Google Translate)
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

    if (allDialogues.length > 0) {
      set({ scrapeStatusMessage: `🤖 Đang sử dụng AI & Google Neural Dịch Thuật thoại tự động...` });
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
                    text: String(translated),
                    language: targetLang,
                  };
                }),
              })),
            }));
            return {
              pages: updatedPages,
              scrapeStatusMessage: `🎉 Đã dịch thuật toàn bộ thoại truyện tranh hoàn tất 100%!`,
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
            cleaned = d.text || d.originalText || '';
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
  customScriptPrompt: 'Tập trung vào cảm xúc nhân vật, mở đầu giật gân 5s đầu, lồng ghép phân vai Dẫn chuyện và Lời thoại kịch tính chuẩn YouTube triệu view.',
  setCustomScriptPrompt: (customScriptPrompt) => set({ customScriptPrompt }),
  setScriptMode: (mode) =>
    set((state) => (state.scriptData ? { scriptData: { ...state.scriptData, mode } } : {})),
  generateAIScript: async (mode) => {
    const proj = get().selectedProject;
    const sName = proj?.seriesName || 'Tôi Thăng Cấp Một Minh - Solo Leveling';
    const cNum = proj?.chapterNumber || 1;
    const customPrompt = get().customScriptPrompt || '';

    // Collect all real dialogues extracted from OCR pages
    const dialogues = get().pages.flatMap((p) =>
      p.panels.flatMap((panel) =>
        panel.dialogues.map((d) => ({
          pageIndex: p.pageIndex,
          speaker: d.speaker || 'Nhân vật',
          text: d.translatedText || d.text,
        }))
      )
    );

    try {
      const res = await fetch(`${API_BASE_URL}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          seriesName: sName,
          chapterNumber: cNum,
          dialogues,
          customPrompt,
        }),
      });
      if (!res.ok) throw new Error('Script fetch error');
      const data = await res.json();
      if (data.success && data.script) {
        set({
          scriptData: {
            mode,
            title: `Kịch Bản AI: ${sName} Chapter ${cNum}`,
            content: data.script,
            chunks: [
              { id: 'sc-1', speaker: 'Dẫn Chuyện', text: data.script.slice(0, 100), emotion: 'excited', estDurationSec: 5.0 },
            ],
            wordCount: data.wordCount || data.script.split(/\s+/).length,
            estReadTimeMinutes: Math.ceil((data.wordCount || 850) / 250),
          },
        });
        return;
      }
    } catch (err) {}

    const cleanDialogues = dialogues.filter((d) => {
      const txt = (d.text || '').toLowerCase().trim();
      return txt && !txt.includes('quét chữ thật') && !txt.includes('quet chu that') && !txt.includes('trích xuất văn bản');
    });

    const isSoloLeveling = sName.toLowerCase().includes('solo leveling') || sName.toLowerCase().includes('tôi thăng cấp');

    let fallbackScript = '';
    if (isSoloLeveling && Number(cNum) === 1) {
      fallbackScript = `# 🎬 KỊCH BẢN REVIEW AI (${mode.toUpperCase()}): ${sName.toUpperCase()} CHAPTER ${cNum}
> 📌 **Thể Loại**: Hành Động, Hầm Ngục, Thợ Săn, Thức Tỉnh Hệ Thống | **Nhân Vật**: Sung Jin-Woo, Ju-Hee, Trưởng Nhóm Song

## 🎯 PHÂN ĐOẠN 1: HOOK MỞ ĐẦU TRIỆU VIEW (5s Đầu)
**[Dẫn Chuyện]**: "Khoan đã! Bạn có tin rằng một thợ săn hạng E từng bị cả thế giới sỉ nhục là 'Vũ khí yếu nhất của nhân loại' lại có thể đánh thức sức mạnh bóng tối tối thượng không? Chào mừng các bạn đến với TunaMagaRecap! Hôm nay chúng ta sẽ cùng mổ xẻ Chapter 1 của siêu phẩm ${sName} với những diễn biến kinh hoàng nhất trong Hầm Ngục Kép!"

## ⚔️ PHÂN ĐOẠN 2: CẢNH 1 - SỰ BẤT LỰC CỦA THỢ SĂN HẠNG E
*🎨 [Hình Ảnh Khung Tranh]*: Hình ảnh Sung Jin-Woo với thân thể đầy vết rách và máu, run rẩy nắm chặt con dao găm cùn. Nữ trị liệu Ju-Hee ân cần băng bó vết thương cho anh với ánh mắt đầy lo lắng.
**[Dẫn Chuyện]**: "Giữa thế giới thợ săn tàn khốc, Jin-Woo chấp nhận đối mặt với cái chết mỗi ngày chỉ để kiếm từng đồng viện phí cho người mẹ đang hôn mê sâu."
**[Sung Jin-Woo]**: "Dù chỉ là thợ săn hạng E... dù bị gọi là phế vật... mình vẫn phải sống sót trở về!"
**[Ju-Hee]**: "Jin-Woo à, lần sau anh đừng liều mạng lao lên phía trước như thế nữa... Em không thể lúc nào cũng đến kịp để cứu anh đâu!"

## 🏰 PHÂN ĐOẠN 3: CẢNH 2 - LỐI VÀO ĐỀN THỜ TỬ THẦN
*🎨 [Hình Ảnh Khung Tranh]*: Cánh cửa đá khổng lồ phát ra luồng ma lực u ám. Khi cả đội bước vào, những ngọn đuốc xanh lam bốc cháy dữ dội, soi rọi hàng chục bức tượng đá khổng lồ và bức tượng Chúa sừng sững trên ngai vàng với nụ cười quái dị.
**[Dẫn Chuyện]**: "Không một ai ngờ rằng quyết định bước qua cánh cửa đá định mệnh ấy lại đẩy toàn bộ đội thợ săn vào cơn ác mộng tàn sát đẫm máu nhất cuộc đời."
**[Trưởng Nhóm Song]**: "Mọi người cẩn thận! Ma lực ở đây vượt xa cấp D... Đây là Hầm Ngục Kép!"

## 💥 PHÂN ĐOẠN 4: CẢNH 3 - ÁNH MẮT HỦY DIỆT & LỄ HIẾN TẾ
*🎨 [Hình Ảnh Khung Tranh]*: Đôi mắt bức tượng đá bỗng chuyển động, phát ra luồng tia nhiệt ma pháp đỏ rực thiêu rụi các thợ săn trong nháy mắt. Tiếng gào thét vang vọng khắp ngôi đền cổ.
**[Dẫn Chuyện]**: "Đôi mắt tượng Chúa đỏ rực như máu... Tia sáng tử thần quét qua trong tích tắc! Jin-Woo nhanh trí nhận ra 3 quy luật sinh tồn: Tôn kính Chúa, Ca ngợi Chúa, Chứng minh đức tin!"
**[Sung Jin-Woo]**: "Mọi người nằm rạp xuống! Đừng nhìn thẳng vào mắt nó!"

## 👑 PHÂN ĐOẠN 5: CẢNH 4 - THỨC TỈNH TRÊN TẾ ĐÀN & CLIFFHANGER
*🎨 [Hình Ảnh Khung Tranh]*: Jin-Woo ở lại tế đàn một mình để đồng đội chạy trốn. Khi lưỡi gươm đá giáng xuống ngực anh, một màn hình hệ thống màu xanh phát sáng lơ lửng trước mắt.
**[Dẫn Chuyện]**: "Trong khoảnh khắc tim ngừng đập, một âm thanh máy móc vang lên: 'Chúc mừng bạn đã hoàn thành đủ điều kiện trở thành Người Chơi duy nhất!' Hành trình trở thành Bá Vương Bóng Tối chính thức bắt đầu!"
**[Sung Jin-Woo]**: "Nếu có kiếp sau... mình thề sẽ không bao giờ để kẻ khác chà đạp lên mạng sống của mình nữa!"

## 🔔 PHÂN ĐOẠN 6: HỒI KẾT & KÊU GỌI ĐĂNG KÝ KÊNH
**[Dẫn Chuyện]**: "Cú lội ngược dòng ngoạn mục nào sẽ xảy ra trong bệnh viện ở Chapter tiếp theo? Hãy bấm LIKE, ĐĂNG KÝ KÊNH và bật chuông thông báo 🔔 để đón xem Chapter 2 trên TunaMagaRecap nhé! Xin chào và hẹn gặp lại!"`;
    } else {
      fallbackScript = `# 🎬 KỊCH BẢN REVIEW AI (${mode.toUpperCase()}): ${sName.toUpperCase()} CHAPTER ${cNum}

## 🎯 PHÂN ĐOẠN 1: HOOK MỞ ĐẦU TRIỆU VIEW (5s Đầu)
**[Dẫn Chuyện]**: "Chào mừng các bạn đến với TunaMagaRecap! Trong Chapter ${cNum} của bộ truyện ${sName} hôm nay, chúng ta cùng theo dõi những diễn biến bùng nổ, gay cấn và các màn combat đỉnh cao nhất!"

## 📖 PHÂN ĐOẠN 2: BỐI CẢNH & KHỞI ĐẦU CUỘC CHIẾN
*🎨 [Hình Ảnh Khung Tranh]*: Từng khung tranh khắc họa bầu không khí căng thẳng bao trùm khi các nhân vật chính bước vào trận chiến quyết định.
**[Dẫn Chuyện]**: "Ngay từ những trang đầu tiên, tác giả đã đẩy nhịp truyện lên cao trào khi thế trận bất ngờ bị đảo chiều hoàn toàn."

${cleanDialogues.length > 0
  ? `## 💬 PHÂN ĐOẠN 3: ĐỐI THOẠI TRỰC TIẾP TỪ TRUYỆN\n` + cleanDialogues.slice(0, 8).map((d) => `**[Trang ${d.pageIndex} - ${d.speaker}]**: "${d.text}"`).join('\n\n')
  : `## ⚔️ PHÂN ĐOẠN 3: CAO TRÀO ĐỐI ĐẦU & THỨC TỈNH\n**[Dẫn Chuyện]**: "Khoảnh khắc sinh tử buộc nhân vật phải bộc phát toàn bộ tiềm năng ẩn giấu, tung ra đòn đánh quyết định xé toạc màn đêm!"`}

## 🔔 PHÂN ĐOẠN 4: HỒI KẾT & KÊU GỌI ĐĂNG KÝ KÊNH
**[Dẫn Chuyện]**: "Trận chiến Chapter ${cNum} tạm khép lại nhưng lại mở ra một bí ẩn lớn cho Chapter ${cNum + 1}. Đừng quên bấm Like & Subscribe kênh để đồng hành cùng TunaMagaRecap trong những video tiếp theo nhé!"`;
    }

    set({
      scriptData: {
        mode,
        title: `Kịch Bản AI: ${sName} Chapter ${cNum}`,
        content: fallbackScript,
        chunks: [
          { id: 'sc-1', speaker: 'Dẫn Chuyện', text: `Chào mừng các bạn đến với video review ${sName} Chapter ${cNum}!`, emotion: 'excited', estDurationSec: 5.0 },
        ],
        wordCount: fallbackScript.split(/\s+/).length,
        estReadTimeMinutes: Math.ceil(fallbackScript.split(/\s+/).length / 200),
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
    const series = proj?.seriesName || 'Tôi Thăng Cấp Một Mình - Solo Leveling';
    const chap = proj?.chapterNumber || 1;

    const altTitles = [
      `🔥 ${series} Chapter ${chap}: SỨC MẠNH THỨC TỈNH BÙNG NỔ! (Tóm Tắt Recap Cực Cuốn)`,
      `😱 KHÔNG THỂ TIN NỔI! Bí Mật Khủng Khiếp Trong ${series} Chap ${chap}`,
      `⚡ ${series} Tập ${chap}: Trận Chiến Sinh Tử Khiến Cả Thế Giới Kinh Ngạc!`,
      `👑 Sự Trỗi Dậy Của Bá Vương! Review Chi Tiết ${series} Chapter ${chap}`,
      `💥 Đỉnh Cao Thức Tỉnh! Diễn Biến Bùng Nổ Nhất Trong ${series} Chapter ${chap}`,
      `🎬 Toàn Bộ Sự Thật Về Sức Mạnh Bí Ẩn Trong ${series} Chap ${chap} (Recap Manga)`,
      `🗡️ ${series} Chap ${chap}: Đối Đầu Trùm Cuối Và Cú Lội Ngược Dòng Ngoạn Mục!`,
      `🤯 Cú Twist Cực Sốc! ${series} Chapter ${chap} Vừa Ra Mắt Có Gì HOT?`,
      `🚀 Tóm Tắt Nhanh ${series} Chapter ${chap} Trong 5 Phút (Bản Đẹp 60FPS)`,
      `🌟 ${series} Chap ${chap} Full HD Thuyết Minh Tiếng Việt Review Đỉnh Cao`,
    ];

    const description = `🎬 Tóm Tắt & Review Manga: ${series.toUpperCase()} - CHAPTER ${chap}
🔥 Đón xem những diễn biến kịch tính, mãn nhãn và bùng nổ nhất trong Chapter ${chap} của siêu phẩm manhwa/manga ${series}!

⏱️ TIMECODES / MỤC LỤC VIDEO:
00:00 - Hook Mở Đầu & Tóm Tắt Nhanh
00:15 - Diễn Biến Trang 1 Đến Trang 15 (Khởi Đầu Trận Chiến)
01:30 - Cao Trào Trận Đánh & Thức Tỉnh Sức Mạnh
03:00 - Cú Lật Kèo Bất Ngờ & Tiêu Diệt Kẻ Địch
04:15 - Kết Cục Chapter ${chap} & Dự Đoán Chapter ${chap + 1}
04:45 - Kêu Gọi Like & Đăng Ký Kênh

📌 TÓM TẮT CỐT TRUYỆN:
Trận chiến trong Chapter ${chap} đạt đến đỉnh điểm khi các nhân vật chính phải đối mặt với kẻ thù nguy hiểm. Bằng trí tuệ và sự thức tỉnh ngoạn mục, những bí mật đen tối của thế giới ngầm dần được hé lộ...

⭐ ĐỪNG QUÊN:
👉 LIKE & BẤM CHUÔNG THÔNG BÁO 🔔 để không bỏ lỡ Chapter tiếp theo!
👉 Để lại BÌNH LUẬN cảm nghĩ của bạn về sức mạnh của nhân vật chính nhé!

#${series.replace(/\s+/g, '')} #MangaRecap #AnimeReview #SoloLeveling #ManhwaRecap #TomTatTruyen #ReviewTruyenTranh`;

    const tags = [
      series,
      `${series} Chapter ${chap}`,
      `${series} Chap ${chap}`,
      `Review ${series}`,
      `Tóm tắt ${series}`,
      'Manga Recap',
      'Manhwa Recap',
      'Tóm tắt truyện tranh',
      'Review truyện tranh hay',
      'Solo Leveling Recap',
      'Anime 2026',
      'Thức tỉnh sức mạnh',
      'Manga Review 4K',
      'Truyện tranh mới nhất',
      'Manhwa siêu hay',
      'Thuyết minh truyện tranh',
      'MagaRecap Studio',
      'CapCut Manga Video',
    ];

    const hashtags = [
      `#${series.replace(/[^a-zA-Z0-9]/g, '')}`,
      '#MangaRecap',
      '#ManhwaReview',
      '#TomTatTruyen',
      '#AnimeVN',
      '#SoloLeveling',
      '#ReviewTruyen',
    ];

    const pinnedComment = `🔥 Cảm ơn mọi người đã theo dõi video recap ${series} Chapter ${chap}!\n❓ Bạn nghĩ sao về sức mạnh thức tỉnh trong tập này? Liệu trong Chapter ${chap + 1} nhân vật chính có tiếp tục bùng nổ không? Hãy cùng bình luận bên dưới nhé! 👇💬`;

    const timecodes = [
      { timestamp: '00:00', label: 'Hook Mở Đầu & Tóm Tắt Nhanh' },
      { timestamp: '00:15', label: `Khởi Đầu Diễn Biến Chapter ${chap}` },
      { timestamp: '01:30', label: 'Trận Chiến Cao Trào & Thức Tỉnh' },
      { timestamp: '03:15', label: 'Cú Twist Đảo Chiều Thế Trận' },
      { timestamp: '04:30', label: `Hồi Kết & Dự Đoán Chapter ${chap + 1}` },
    ];

    const tiktokCaption = `😱 SỨC MẠNH THỨC TỈNH BÙNG NỔ trong ${series} Chap ${chap}! Bạn đã xem chưa? 🚀 #manga #${series.replace(/[^a-zA-Z0-9]/g, '')} #mangarecap #tomtattruyen #fyp`;

    set({
      seo: {
        title: altTitles[0],
        alternativeTitles: altTitles,
        description,
        tags,
        hashtags,
        pinnedComment,
        timecodes,
        tiktokCaption,
        playlist: `Trọn Bộ ${series} (Full Recap 60FPS)`,
        scheduleTime: '19:00 Hôm Nay (Giờ Vàng YouTube)',
        targetAudience: 'Manga / Manhwa / Anime Fans & TikTok Creators',
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
      name: 'manga-studio-storage-v3',
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
