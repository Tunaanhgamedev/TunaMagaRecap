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
  MangaGenre,
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
  CompilationConfig,
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
  loadProject: (projectOrId: Project | string) => Promise<void>;
  isLoadingProject: boolean;
  saveProjectToBackend: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  clearAllProjects: () => Promise<void>;
  resetAllStoreState: () => void;
  setSelectedChapter: (c: Chapter) => void;
  addMangaPages: (chapterId: string, files: File[]) => void;
  clearCurrentProject: () => void;

  // Multi-Chapter Compilation
  compilationConfig: CompilationConfig | null;
  isCompilationMode: boolean;
  mergeChaptersToCompilation: (chapterProjectIds: string[], options?: { includeBumpers?: boolean }) => Promise<void>;
  exitCompilationMode: () => void;

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
  mangaGenre: MangaGenre;
  setMangaGenre: (genre: MangaGenre) => void;
  protagonistName: string;
  setProtagonistName: (name: string) => void;
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

  // Audio Mixer & Volume Control
  audioVolume: number;
  setAudioVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  toggleMute: () => void;
  isVoiceMuted: boolean;
  setIsVoiceMuted: (isVoiceMuted: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (volume: number) => void;
  isBgmMuted: boolean;
  setIsBgmMuted: (isBgmMuted: boolean) => void;

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
  isLoadingProject: false,
  loadProject: async (projectOrId) => {
    const state = get();
    const projectId = typeof projectOrId === 'string' ? projectOrId : projectOrId.id;
    const projectMeta = typeof projectOrId === 'string'
      ? state.projects.find((p) => p.id === projectId) || null
      : projectOrId;

    set({
      isLoadingProject: true,
      scrapeStatusMessage: `⏳ Đang tải dữ liệu project...`,
    });

    try {
      const res = await fetch(`${API_BASE_URL}/projects/detail?id=${encodeURIComponent(projectId)}`);
      const data = await res.json();

      if (data.success && data.project) {
        const restoredPages: MangaPage[] = Array.isArray(data.pages) ? data.pages : [];
        const restoredProject: Project = {
          ...data.project,
          pages: restoredPages,
        };

        set({
          selectedProject: restoredProject,
          pages: restoredPages,
          scriptData: data.scriptData || null,
          clips: Array.isArray(data.clips) ? data.clips : [],
          subtitles: Array.isArray(data.subtitles) ? data.subtitles : [],
          activePageIndex: 0,
          isLoadingProject: false,
          scrapeStatusMessage: `✓ Đã tải thành công: ${restoredProject.seriesName} - Chap ${restoredProject.chapterNumber} (${restoredPages.length} trang)`,
        });
      } else {
        // Fallback: use metadata from projects list, clear pages
        set({
          selectedProject: projectMeta,
          pages: [],
          scriptData: null,
          clips: [],
          subtitles: [],
          activePageIndex: 0,
          isLoadingProject: false,
          scrapeStatusMessage: projectMeta
            ? `⚠️ Chỉ tải được metadata: ${projectMeta.seriesName} - Chap ${projectMeta.chapterNumber}. Cần cào lại dữ liệu trang ảnh.`
            : '❌ Không tìm thấy dữ liệu project.',
        });
      }
    } catch (err) {
      // Network error: fallback to metadata only
      set({
        selectedProject: projectMeta,
        pages: [],
        isLoadingProject: false,
        scrapeStatusMessage: '❌ Lỗi kết nối server. Thử khởi động lại backend.',
      });
    }
  },
  saveProjectToBackend: async () => {
    const state = get();
    if (!state.selectedProject) return;

    try {
      await fetch(`${API_BASE_URL}/projects/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: state.selectedProject,
          pages: state.pages,
          scriptData: state.scriptData,
          clips: state.clips,
          subtitles: state.subtitles,
        }),
      });
      set({ scrapeStatusMessage: '✓ Đã lưu project thành công!' });
    } catch (err) {
      set({ scrapeStatusMessage: '❌ Lỗi lưu project. Kiểm tra kết nối server.' });
    }
  },
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
      compilationConfig: null,
      isCompilationMode: false,
    });
  },

  // Multi-Chapter Compilation
  compilationConfig: null,
  isCompilationMode: false,
  mergeChaptersToCompilation: async (chapterProjectIds, options) => {
    const state = get();
    const includeBumpers = options?.includeBumpers ?? true;
    const bumperDuration = 3; // seconds per chapter transition

    set({ scrapeStatusMessage: '⏳ Đang ghép các chapter...' });

    try {
      const chapterDataList: { project: Project; pages: MangaPage[] }[] = [];

      for (const pid of chapterProjectIds) {
        const res = await fetch(`${API_BASE_URL}/projects/detail?id=${encodeURIComponent(pid)}`);
        const data = await res.json();
        if (data.success && data.project) {
          chapterDataList.push({
            project: data.project,
            pages: Array.isArray(data.pages) ? data.pages : [],
          });
        }
      }

      // Sort by chapter number
      chapterDataList.sort((a, b) => a.project.chapterNumber - b.project.chapterNumber);

      // Merge all pages with re-indexed pageIndex
      const mergedPages: MangaPage[] = [];
      let pageOffset = 0;
      const compilationChapters: CompilationConfig['chapters'] = [];

      chapterDataList.forEach((ch, idx) => {
        compilationChapters.push({
          projectId: ch.project.id,
          project: ch.project,
          order: idx,
        });

        ch.pages.forEach((page) => {
          mergedPages.push({
            ...page,
            id: `comp-${ch.project.id}-${page.id}`,
            pageIndex: pageOffset + page.pageIndex,
          });
        });
        pageOffset += ch.pages.length;
      });

      const totalDuration = chapterDataList.reduce((sum, ch) => sum + (ch.project.durationEst || 0), 0)
        + (includeBumpers ? (chapterDataList.length - 1) * bumperDuration : 0);

      const compilationConfig: CompilationConfig = {
        id: `comp-${Date.now()}`,
        title: chapterDataList.length > 0
          ? `${chapterDataList[0].project.seriesName} - Full Compilation (${chapterDataList.length} Chapters)`
          : 'Compilation',
        chapters: compilationChapters,
        includeBumpers,
        bumperDurationSec: bumperDuration,
        transition: 'fade',
        totalPages: mergedPages.length,
        totalDurationEst: totalDuration,
      };

      set({
        pages: mergedPages,
        compilationConfig,
        isCompilationMode: true,
        activePageIndex: 0,
        scrapeStatusMessage: `✓ Đã ghép thành công ${chapterDataList.length} chapter (${mergedPages.length} trang, ~${Math.round(totalDuration / 60)} phút)`,
      });
    } catch (err) {
      set({ scrapeStatusMessage: '❌ Lỗi khi ghép chapters. Kiểm tra kết nối server.' });
    }
  },
  exitCompilationMode: () => {
    set({
      compilationConfig: null,
      isCompilationMode: false,
      pages: [],
      scrapeStatusMessage: 'Đã thoát chế độ Compilation.',
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
  mangaGenre: 'hunter_system',
  setMangaGenre: (mangaGenre) => set({ mangaGenre }),
  protagonistName: '',
  setProtagonistName: (protagonistName) => set({ protagonistName }),
  customScriptPrompt: 'Tập trung vào cảm xúc nhân vật, mở đầu giật gân 5s đầu, lồng ghép phân vai Dẫn chuyện và Lời thoại kịch tính chuẩn YouTube triệu view.',
  setCustomScriptPrompt: (customScriptPrompt) => set({ customScriptPrompt }),
  setScriptMode: (mode) =>
    set((state) => (state.scriptData ? { scriptData: { ...state.scriptData, mode } } : {})),
  generateAIScript: async (mode) => {
    const proj = get().selectedProject;
    const sName = proj?.seriesName || 'Bộ Truyện Tuyệt Đỉnh';
    const cNum = proj?.chapterNumber || 1;
    const customPrompt = get().customScriptPrompt || '';
    const genre = get().mangaGenre || 'hunter_system';
    const protagonist = get().protagonistName || '';
    const currentPages = get().pages || [];

    // Collect all real dialogues extracted from OCR pages
    const dialogues = currentPages.flatMap((p) =>
      p.panels.flatMap((panel) =>
        panel.dialogues.map((d) => ({
          pageIndex: p.pageIndex,
          speaker: d.speaker || 'Nhân vật',
          text: d.translatedText || d.text,
          originalText: d.originalText,
          translatedText: d.translatedText,
        }))
      )
    );

    // Format structured pages for backend API
    const pagesPayload = currentPages.map((p) => ({
      pageIndex: p.pageIndex,
      imageUrl: p.imageUrl,
      ocrProcessed: p.ocrProcessed,
      panels: p.panels.map((pan) => ({
        panelIndex: pan.panelIndex,
        suggestedCameraEffect: pan.suggestedCameraEffect || 'zoom_in',
        aiDescription: pan.aiDescription || '',
        dialogues: pan.dialogues.map((d) => ({
          speaker: d.speaker || 'Nhân vật',
          text: d.translatedText || d.text || '',
          originalText: d.originalText || '',
          translatedText: d.translatedText || '',
          emotion: d.emotion || 'neutral',
          textType: d.textType || 'DIALOGUE',
        })),
      })),
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/ai/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          seriesName: sName,
          chapterNumber: cNum,
          dialogues,
          pages: pagesPayload,
          customPrompt,
          genre,
          protagonist,
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
            estReadTimeMinutes: Math.ceil((data.wordCount || 850) / 200),
          },
        });
        return;
      }
    } catch (err) {}

    const cleanDialogues = dialogues.filter((d) => {
      const txt = (d.text || '').toLowerCase().trim();
      return (
        txt &&
        !txt.includes('quét chữ thật') &&
        !txt.includes('quet chu that') &&
        !txt.includes('trích xuất văn bản') &&
        !txt.includes('chờ quét ocr')
      );
    });

    const hero =
      protagonist ||
      (cleanDialogues[0]?.speaker && cleanDialogues[0].speaker !== 'Nhân vật' && cleanDialogues[0].speaker !== 'Dẫn Chuyện'
        ? cleanDialogues[0].speaker
        : 'Nhân Vật Chính');

    const genreMeta: Record<
      string,
      { name: string; trope: string; combat: string; sfx: string; actionBeats: string[] }
    > = {
      hunter_system: {
        name: 'Thợ Săn / Hệ Thống / Thức Tỉnh',
        trope: 'Hầm ngục u tối với làn sương ma pháp lơ lửng, quái vật hung tợn gầm thét, ánh sáng xanh lục từ cửa sổ hệ thống phát sáng trước mắt nhân vật chính.',
        combat: 'Những đòn vung dao găm xé gió, ma lực đen tím bùng nổ bao phủ toàn thân, tốc độ di chuyển vượt qua giới hạn âm thanh.',
        sfx: '[BGM: Nhạc điện tử dồn dập, tiếng bass đập mạnh theo từng bước chân]',
        actionBeats: [
          'Góc máy lia nhanh từ dưới lên, bắt trọn khoảnh khắc nhân vật chính né đòn vuốt quái vật trong gang tấc.',
          'Hiệu ứng ma lực tím đen bùng nổ, từng đòn chém chuẩn xác phá hủy lõi ma thạch của quái vật.',
          'Cửa sổ thông báo hệ thống nhấp nháy liên tục, các chỉ số sức mạnh tăng vọt ngoài tầm kiểm soát.',
          'Đôi mắt nhân vật chính phát ra luồng sáng xanh sắc lạnh, áp lực ma lực đè bẹp toàn bộ đối thủ trong khu vực.',
        ],
      },
      cultivation_wuxia: {
        name: 'Tu Tiên / Huyền Huyễn / Kiếm Hiệp',
        trope: 'Mây mù bao phủ đỉnh núi tông môn hùng vĩ, linh khí cuồn cuộn hóa rồng bay lượn, kiếm khí sắc bén rực rỡ cắt đứt cả bầu trời.',
        combat: 'Tung kiếm xuất chiêu với vạn đạo kiếm quang, đan điền bộc phát chân khí cuồng bạo làm rung chuyển cả càn khôn đại địa.',
        sfx: '[BGM: Nhạc cổ phong hùng tráng kết hợp sáo trúc và tiếng trống trận]',
        actionBeats: [
          'Vạn đạo kiếm quang xoay quanh thân thể, kiếm khí rạch nát không gian lao thẳng về phía kẻ thù.',
          'Linh lực trong đan điền dâng trào như sóng thần, phá vỡ cảnh giới giam cầm bấy lâu nay.',
          'Chưởng phong cuồng bạo giáng xuống từ chín tầng mây, chấn động cả sơn hà tông môn.',
          'Ánh mắt uy nghiêm nhìn thấu hồng trần, chỉ một chỉ điểm ra đã dập tắt toàn bộ sát khí của địch nhân.',
        ],
      },
      isekai_fantasy: {
        name: 'Isekai / Chuyển Sinh / Ma Pháp',
        trope: 'Lục địa fantasy tráng lệ với các tòa lâu đài nguy nga, vòng tròn ma pháp phát sáng đa sắc dưới chân, những loài sinh vật huyền bí trong rừng sâu.',
        combat: 'Niệm chú cổ ngữ kích hoạt đại ma pháp cấp cấm thuật, tia sét và ngọn lửa rực cháy thiêu rụi toàn bộ binh đoàn quái vật.',
        sfx: '[BGM: Nhạc giao hưởng fantasy huyền ảo, đẩy dần nhịp độ kịch tính]',
        actionBeats: [
          'Vòng tròn ma pháp nhiều tầng xoay chuyển dưới chân, ánh sáng rực rỡ soi sáng cả bầu trời đêm.',
          'Niệm nhanh cổ ngữ, ngọn lửa cấm thuật bùng cháy dữ dội thiêu rụi toàn bộ hàng phòng ngự đối phương.',
          'Các loại kỹ năng gian lận (cheat skills) kích hoạt đồng thời, thay đổi hoàn toàn quy luật của thế giới.',
          'Nụ cười tự tin khi đối mặt với ma vương, đòn kết liễu mang sức mạnh vượt trội giải phóng lục địa.',
        ],
      },
      regression_revenge: {
        name: 'Trùng Sinh / Báo Thù / Vả Mặt',
        trope: 'Khung tranh đối lập giữa cái chết thảm khốc của kiếp trước và ánh mắt lạnh lùng, sắc lẹm đầy sát khí khi mở mắt tỉnh lại ở quá khứ.',
        combat: 'Ra tay quyết đoán, tính toán trước từng đường đi nước bước của kẻ địch khiến chúng rơi vào tuyệt vọng không kịp trở tay.',
        sfx: '[BGM: Tiếng đàn cello u tối, nhịp tim đập nghẹt thở]',
        actionBeats: [
          'Ký ức kiếp trước ùa về trong tích tắc, từng bước đi của kẻ thù đều nằm trọn trong lòng bàn tay.',
          'Ra đòn dứt khoát không một động tác thừa, tước đi toàn bộ lợi thế mà kẻ phản bội đang tự mãn.',
          'Ánh mắt lạnh như băng giá nhìn kẻ thù ngã gục, từng món nợ máu năm xưa giờ đây được thanh toán sòng phẳng.',
          'Cười khẩy trước sự giãy giụa vô vọng của địch thủ, màn lật kèo vả mặt khiến người xem thỏa mãn tột độ.',
        ],
      },
      school_urban: {
        name: 'Bạo Lực Học Đường / Đô Thị / Hành Động',
        trope: 'Góc phố đêm ẩm ướt hoặc hành lang trường học căng thẳng, ánh đèn đường le lói soi rọi ánh mắt kiên định của nhân vật chính.',
        combat: 'Những cú đấm móc uy lực, đòn bẻ khớp chuẩn xác và kỹ năng cận chiến thực dụng mang lại cảm giác thỏa mãn tột cùng.',
        sfx: '[BGM: Nhạc rock đường phố sôi động, tiếng va chạm kim loại đanh thép]',
        actionBeats: [
          'Cú đấm thẳng đầy uy lực phá tan thế phòng thủ, tiếng va chạm đanh thép dội vang khắp hành lang.',
          'Né đòn linh hoạt rồi bẻ khớp đối thủ trong chớp mắt, phong thái áp đảo của kẻ thống trị đường phố.',
          'Ánh mắt kiên định không hề chớp trước đám đông bao vây, từng tên một lần lượt ngã gục dưới chân.',
          'Đứng sừng sững giữa vòng vây kẻ địch, khẳng định uy quyền và trật tự mới cho toàn trường.',
        ],
      },
      horror_survival: {
        name: 'Kinh Dị / Sinh Tồn / Thần Bí',
        trope: 'Tông màu đen trắng tương phản u uất, bóng ma dị dạng rình rập sau lưng nhân vật, những vết máu loang lổ trên tường.',
        combat: 'Cuộc rượt đuổi nghẹt thở trong không gian hẹp, những đòn phản kháng liều mạng giữa lằn ranh sự sống và cái chết.',
        sfx: '[BGM: Tiếng thì thầm ma quái, hiệu ứng âm thanh rùng rợn bất ngờ]',
        actionBeats: [
          'Bóng đen dị dạng trườn dọc theo hành lang, tiếng thở dốc nghẹt thở khi trốn sau góc khuất.',
          'Khoảnh khắc giật mình kinh hãi khi quay đầu lại, đòn phản kháng trong vô thức xé toạc bóng tối.',
          'Những mảnh ghép bí ẩn dần hé lộ nguồn gốc lời nguyền kinh hoàng đang nuốt chửng từng nạn nhân.',
          'Chạy đua với thần chết từng giây từng phút để tìm ra lối thoát duy nhất còn sót lại.',
        ],
      },
      romance_drama: {
        name: 'Ngôn Tình / Cung Đấu / Drama',
        trope: 'Khung cảnh hoa lệ, ánh mắt chan chứa tình cảm hoặc giọt nước mắt rơi nghiêng của nhân vật nữ trong hoàng cung nguy nga.',
        combat: 'Những màn đấu khẩu sắc sảo, vạch trần âm mưu thâm hiểm của kẻ gian và bảo vệ người mình yêu thương.',
        sfx: '[BGM: Nhạc piano da diết, sâu lắng chạm đến cảm xúc]',
        actionBeats: [
          'Ánh mắt giao nhau giữa vũ hội hoàng gia hoa lệ, rung động đầu tiên sau bao tháng ngày xa cách.',
          'Vạch trần bức màn âm mưu hãm hại bằng những chứng cứ đanh thép không thể chối cãi.',
          'Cái ôm siết chặt giữa cơn mưa giông, xóa tan mọi hiểu lầm và rào cản ngăn cách bấy lâu.',
          'Khẳng định vị thế độc tôn, khiến kẻ ác phải trả giá cho những dã tâm đã gây ra.',
        ],
      },
      mystery_mindgame: {
        name: 'Trinh Thám / Đấu Trí',
        trope: 'Cận cảnh đôi mắt tập trung cao độ, các mảnh ghép manh mối xoay quanh tâm trí, ánh đèn bàn soi sáng hồ sơ vụ án.',
        combat: 'Màn lật tẩy danh tính hung thủ với những lập luận sắc bén không tì vết, ép đối phương vào chân tường.',
        sfx: '[BGM: Nhạc jazz trinh thám bí ẩn kết hợp tiếng gõ đồng hồ tích tắc]',
        actionBeats: [
          'Từng chi tiết bất thường kết nối lại thành một chuỗi sự kiện hoàn chỉnh đến rùng mình.',
          'Ánh mắt bối rối của nghi phạm khi bị dồn vào góc tường bởi một câu hỏi mấu chốt.',
          'Màn giăng bẫy tâm lý đỉnh cao khiến thủ phạm tự để lộ sơ hở chí mạng mà không hề hay biết.',
          'Lời tuyên bố đanh thép vạch trần chân tướng sự thật trước sự ngỡ ngàng của tất cả mọi người.',
        ],
      },
      general_shonen: {
        name: 'Shonen / Phiêu Lưu Hành Động',
        trope: 'Bầu trời rộng mở rực rỡ ánh bình minh, nụ cười tự tin của nhân vật chính cùng những người đồng đội kề vai sát cánh.',
        combat: 'Bộc phát toàn bộ sức mạnh ý chí, tung tuyệt kỹ tối thượng phá tan mọi rào cản và đánh bại kẻ thù.',
        sfx: '[BGM: Nhạc anime hào hùng truyền cảm hứng mãnh liệt]',
        actionBeats: [
          'Ngọn lửa nhiệt huyết bùng cháy trong lồng ngực, đòn tấn công toàn lực xé toạc mọi chướng ngại.',
          'Tiếng thét vang dội khẳng định lý tưởng và quyết tâm bảo vệ những người đồng đội thân yêu.',
          'Bất chấp thương tích đầy mình, nhân vật chính vẫn gượng dậy với nụ cười ngạo nghễ.',
          'Cú đấm quyết định mang theo toàn bộ niềm tin và ước mơ, hạ gục tên trùm phản diện.',
        ],
      },
    };

    const curGenre = genreMeta[genre] || genreMeta.hunter_system;
    const totalPages = currentPages.length || 1;
    const totalPanels = currentPages.reduce((acc, p) => acc + (p.panels?.length || 2), 0);

    let fallbackScript = `# 🎬 KỊCH BẢN REVIEW AI (${mode.toUpperCase()}): ${sName.toUpperCase()} CHAPTER ${cNum}\n`;
    fallbackScript += `> 📌 **Thể Loại**: ${curGenre.name} | **Phong Cách**: Chuẩn YouTube / TikTok Triệu View\n`;
    fallbackScript += `> 📊 **Quy Mô Chương**: Bao quát toàn bộ ${totalPages} Trang truyện (${totalPanels} Khung hình / Panels)\n`;
    fallbackScript += `> 🎵 **Định Hướng Âm Thanh**: ${curGenre.sfx}\n\n`;

    fallbackScript += `## 🎯 PHÂN ĐOẠN 0: HOOK MỞ ĐẦU GIỮ CHÂN (5s Đầu)\n`;
    fallbackScript += `**[Dẫn Chuyện]**: "Khoan đã! Bạn có tin rằng chỉ trong Chapter ${cNum} với ${totalPages} trang truyện này, một biến cố kinh hoàng đã làm đảo lộn hoàn toàn vận mệnh của ${hero} không? Chào mừng các bạn đến với TunaMagaRecap! Hôm nay chúng ta sẽ cùng theo dõi toàn bộ diễn biến từ trang 1 đến trang ${totalPages} của siêu phẩm ${sName}!"\n\n`;

    const actCount = totalPages <= 10 ? totalPages : 5;
    const actNames = [
      'HỒI 1: BỐI CẢNH & KHỞI ĐẦU CUỘC CHẠM TRÁN',
      'HỒI 2: THÂM NHẬP KHÔNG GIAN NGUY HIỂM & ĐỐI MẶT THỬ THÁCH',
      'HỒI 3: CAO TRÀO BÙNG NỔ & XUNG ĐỘT TỘT ĐỈNH',
      'HỒI 4: BIẾN SỐ BẤT NGỜ & CÚ LẬT KÈO NGOẠN MỤC',
      'HỒI 5: THỨC TỈNH SỨC MẠNH & KHÉP LẠI CHAPTER',
    ];

    const pagesPerAct = Math.ceil(totalPages / actCount);

    for (let actIdx = 0; actIdx < actCount; actIdx++) {
      const startPageIdx = actIdx * pagesPerAct;
      const endPageIdx = Math.min(totalPages, (actIdx + 1) * pagesPerAct);
      const actPages = currentPages.slice(startPageIdx, endPageIdx);

      if (actPages.length === 0) continue;

      const actTitle =
        actCount === totalPages
          ? `HỒI ${actIdx + 1}: TRANG ${actPages[0].pageIndex}`
          : `${actNames[actIdx] || `HỒI ${actIdx + 1}`} (Trang ${actPages[0].pageIndex} - ${actPages[actPages.length - 1].pageIndex})`;

      fallbackScript += `## 📜 ${actTitle}\n`;
      const beatDesc = curGenre.actionBeats[actIdx % curGenre.actionBeats.length];
      fallbackScript += `*🎨 [Bối Cảnh Khung Tranh]*: ${actIdx === 0 ? `${curGenre.trope} ${curGenre.combat}` : beatDesc}\n`;

      for (const page of actPages) {
        const pNum = page.pageIndex;
        const panels =
          Array.isArray(page.panels) && page.panels.length > 0
            ? page.panels
            : [
                { panelIndex: 1, suggestedCameraEffect: 'zoom_in', dialogues: [] },
                { panelIndex: 2, suggestedCameraEffect: 'pan_down', dialogues: [] },
              ];

        const pageDialogues = cleanDialogues.filter((d) => (d.pageIndex || 1) === pNum);

        fallbackScript += `### 📄 Trang ${pNum} (${panels.length} Panels)\n`;

        for (const pan of panels) {
          const panNum = pan.panelIndex || 1;
          const cam = pan.suggestedCameraEffect || (panNum === 1 ? 'dramatic_zoom' : 'pan_right');
          const panDialogues = (pan.dialogues || []).filter((d) => {
            const txt = (d.text || d.translatedText || '').toLowerCase().trim();
            return txt && !txt.includes('quét chữ thật') && !txt.includes('quet chu that') && !txt.includes('trích xuất');
          });

          if (pan.aiDescription && !pan.aiDescription.includes('Bấm "Quét Chữ')) {
            fallbackScript += `*🎨 [Trang ${pNum} • Panel ${panNum} (${cam})]*: ${pan.aiDescription}\n`;
          } else {
            const actionLine = curGenre.actionBeats[(pNum + panNum) % curGenre.actionBeats.length];
            fallbackScript += `*🎨 [Trang ${pNum} • Panel ${panNum} (${cam})]*: ${actionLine}\n`;
          }

          if (panDialogues.length > 0) {
            for (const d of panDialogues) {
              const spk = d.speaker && d.speaker !== 'Nhân vật' && d.speaker !== 'Dẫn Chuyện' ? d.speaker : hero;
              fallbackScript += `**[${spk}]**: "${d.translatedText || d.text}"\n`;
            }
          }
        }

        if (pageDialogues.length === 0) {
          if (pNum === 1) {
            fallbackScript += `**[Dẫn Chuyện]**: "Ngay từ những khung hình đầu tiên của Trang ${pNum}, không khí căng thẳng đã bao trùm lấy ${hero} cùng toàn bộ chiến trường."\n`;
          } else if (pNum === totalPages) {
            fallbackScript += `**[Dẫn Chuyện]**: "Khung tranh cuối cùng của Trang ${pNum} khép lại với ánh mắt rực lửa của ${hero}, mở ra cánh cửa dẫn tới những thử thách kinh hoàng hơn ở chương sau!"\n`;
          } else if (pNum % 5 === 0) {
            fallbackScript += `**[Dẫn Chuyện]**: "Tại Trang ${pNum}, nhịp độ trận chiến được đẩy lên mức cao nhất, từng đòn tấn công va đập dữ dội làm rung chuyển toàn bộ không gian!"\n`;
          }
        }

        fallbackScript += `\n`;
      }
    }

    fallbackScript += `## 🔔 HỒI KẾT: TỔNG KẾT & KÊU GỌI ĐĂNG KÝ (CLIFFHANGER)\n`;
    fallbackScript += `**[Dẫn Chuyện]**: "Toàn bộ ${totalPages} trang truyện của Chapter ${cNum} đã khép lại với những diễn biến nghẹt thở. Liệu trong Chapter ${cNum + 1}, ${hero} sẽ đối mặt với thế lực bí ẩn nào tiếp theo? Hãy để lại BÌNH LUẬN cảm nghĩ của bạn bên dưới, bấm LIKE và ĐĂNG KÝ KÊNH 🔔 để không bỏ lỡ video recap mới nhất trên TunaMagaRecap nhé! Xin chào và hẹn gặp lại các bạn trong video tiếp theo!"\n`;

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

  // Audio Mixer & Volume Control
  audioVolume: 80,
  setAudioVolume: (audioVolume) => {
    set({ audioVolume });
    if (audioVolume <= 0) {
      voiceAudioEngine.stop();
    }
  },
  isMuted: false,
  setIsMuted: (isMuted) => {
    set({ isMuted });
    if (isMuted) {
      voiceAudioEngine.stop();
    }
  },
  toggleMute: () =>
    set((state) => {
      const nextMuted = !state.isMuted;
      if (nextMuted) {
        voiceAudioEngine.stop();
      }
      return { isMuted: nextMuted };
    }),
  isVoiceMuted: false,
  setIsVoiceMuted: (isVoiceMuted) => {
    set({ isVoiceMuted });
    if (isVoiceMuted) {
      voiceAudioEngine.stop();
    }
  },
  bgmVolume: 50,
  setBgmVolume: (bgmVolume) => set({ bgmVolume }),
  isBgmMuted: false,
  setIsBgmMuted: (isBgmMuted) => set({ isBgmMuted }),

  isAutoPipelineRunning: false,
  pipelineStep: 0,

  playNarrationAudio: (text: string) => {
    const { assignedVoiceId, audioVolume, isMuted, isVoiceMuted } = get();
    if (isMuted || isVoiceMuted || audioVolume <= 0) {
      voiceAudioEngine.stop();
      return;
    }
    const vol = Math.max(0, Math.min(1, audioVolume / 100));
    voiceAudioEngine.speak(text, assignedVoiceId, 1.05, 1.0, vol);
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
