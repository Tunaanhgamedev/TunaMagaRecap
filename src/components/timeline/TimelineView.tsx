import React, { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { API_BASE_URL, getProxyImageUrl } from '../../utils/constants';
import { cinematicSoundEngine } from '../../utils/sfxEngine';
import { motionComicVFXEngine } from '../../utils/vfxEngine';
import { MoodBgmType, SoundEffectType, VFXType } from '../../types/studio';
import {
  Play,
  Pause,
  RotateCcw,
  Film,
  Download,
  Layers,
  Music,
  Mic,
  MicOff,
  Subtitles,
  Share2,
  FolderOpen,
  Smartphone,
  Tv,
  Sparkles,
  Volume2,
  Volume1,
  VolumeX,
  Sliders,
  GitMerge,
  X,
  Zap,
  Radio,
  PlaySquare,
  Flame,
} from 'lucide-react';
import { YouTubePublisherModal } from '../youtube/YouTubePublisherModal';

export const TimelineView: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    currentTime,
    setCurrentTime,
    duration,
    pages,
    selectedProject,
    aspectRatio,
    setAspectRatio,
    voiceActors,
    assignedVoiceId,
    setAssignedVoiceId,
    setActiveTab,
    playNarrationAudio,
    stopNarrationAudio,
    audioVolume,
    setAudioVolume,
    isMuted,
    toggleMute,
    setIsMuted,
    isVoiceMuted,
    setIsVoiceMuted,
    bgmVolume,
    setBgmVolume,
    isBgmMuted,
    setIsBgmMuted,
    bgmMood,
    setBgmMood,
    triggerSFX,
    vfxOverlay,
    setVFXOverlay,
    projects,
    compilationConfig,
    isCompilationMode,
    mergeChaptersToCompilation,
    exitCompilationMode,
    chapterVideoBlobs,
    compilationVideoUrl,
    isConcattingVideos,
    concatProgress,
    saveChapterVideoBlob,
    renderAndConcatVideos,
  } = useStudioStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastSpokenPanelIdRef = useRef<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [blurredBackground, setBlurredBackground] = useState(true);
  const [activePanelInfo, setActivePanelInfo] = useState<{
    pageIndex: number;
    panelIndex: number;
    effect: string;
    speaker: string;
    text: string;
  } | null>(null);

  // Multi-chapter merge modal state
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [mergeBumpers, setMergeBumpers] = useState(true);

  // Flatten all panels from all pages into a continuous sequence of video timeline blocks
  const panelTimeline = React.useMemo(() => {
    const timelineItems: Array<{
      id: string;
      pageIndex: number;
      panelIndex: number;
      imageUrl: string;
      rawImageUrl?: string;
      bbox: { x: number; y: number; w: number; h: number };
      cameraEffect: string;
      startTime: number;
      duration: number;
      speaker: string;
      dialogueText: string;
      emotion: string;
    }> = [];

    let cursor = 0;
    const defaultDurationPerPanel = 3.5;

    pages.forEach((page, pIdx) => {
      const pagePanels =
        page.panels && page.panels.length > 0
          ? page.panels
          : [
              {
                id: `p-full-${pIdx}`,
                pageIndex: page.pageIndex,
                panelIndex: 1,
                bbox: { x: 5, y: 5, w: 90, h: 90 },
                suggestedCameraEffect: 'dramatic_zoom',
                aiDescription: `Trang ${page.pageIndex}`,
                dialogues: [
                  {
                    id: `d-${pIdx}`,
                    speaker: 'Dẫn Chuyện',
                    text: `Phân cảnh Trang ${page.pageIndex} của bộ truyện.`,
                    emotion: 'neutral',
                  },
                ],
              },
            ];

      pagePanels.forEach((panel, panIdx) => {
        const d =
          panel.dialogues && panel.dialogues[0]
            ? panel.dialogues[0]
            : {
                speaker: 'Dẫn Chuyện',
                text: `Diễn biến gay cấn tại Trang ${page.pageIndex} Panel ${panIdx + 1}.`,
                emotion: 'neutral',
              };

        timelineItems.push({
          id: `t-${page.pageIndex}-${panIdx + 1}`,
          pageIndex: page.pageIndex,
          panelIndex: panIdx + 1,
          imageUrl: page.cleanedImageUrl || page.imageUrl,
          rawImageUrl: page.cleanedImageUrl || (page as any).rawImageUrl || page.imageUrl,
          bbox: panel.bbox || { x: 5, y: 5, w: 90, h: 90 },
          cameraEffect: (panel.suggestedCameraEffect as string) || 'dramatic_zoom',
          startTime: cursor,
          duration: defaultDurationPerPanel,
          speaker: d.speaker,
          dialogueText: d.text,
          emotion: d.emotion,
        });
        cursor += defaultDurationPerPanel;
      });
    });

    return timelineItems;
  }, [pages]);

  const totalVideoDuration = Math.max(
    12,
    panelTimeline.length > 0
      ? panelTimeline[panelTimeline.length - 1].startTime +
          panelTimeline[panelTimeline.length - 1].duration
      : duration
  );

  // Helper to reliably resolve image URLs without double proxying
  const resolveMangaImgSrc = (url: string, raw?: string) => {
    const target = raw || url || '';
    if (!target) return '';
    if (target.startsWith('/api/proxy-image') || target.startsWith(`${API_BASE_URL}/proxy-image`)) {
      return target.startsWith('http') ? target : `http://localhost:3001${target}`;
    }
    if (target.startsWith('blob:') || target.startsWith('data:')) {
      return target;
    }
    if (target.startsWith('http://') || target.startsWith('https://')) {
      return getProxyImageUrl(target, 'https://thuviensach.vn/');
    }
    return target;
  };

  // Pre-fetch and cache all page images into imageCacheRef
  useEffect(() => {
    pages.forEach((page) => {
      const raw = (page as any).rawImageUrl || page.imageUrl;
      const imgSrc = resolveMangaImgSrc(page.imageUrl, raw);

      if (!imageCacheRef.current.has(page.imageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imgSrc;
        img.onload = () => {
          imageCacheRef.current.set(page.imageUrl, img);
        };
        img.onerror = () => {
          const directImg = new Image();
          directImg.src = page.imageUrl;
          directImg.onload = () => {
            imageCacheRef.current.set(page.imageUrl, directImg);
          };
        };
      }
    });
  }, [pages]);

  // Empty State
  if (pages.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu Timeline Video</h2>
          <p className="text-xs text-slate-400">
            Vui lòng dán link chapter truyện tại tab Thư Viện để tải ảnh thật và khớp từng Panel Bounding Box vào Video Timeline.
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

  // Start / Stop Mood BGM when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      if (!isBgmMuted && bgmVolume > 0) {
        cinematicSoundEngine.startMoodBgm(bgmMood);
      }
    } else {
      cinematicSoundEngine.stopBgm();
      stopNarrationAudio();
    }
  }, [isPlaying, isBgmMuted, bgmVolume, bgmMood]);

  // HTML5 Canvas High-Fidelity Video Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on Aspect Ratio
    if (aspectRatio === '9:16') {
      canvas.width = 720;
      canvas.height = 1280;
    } else {
      canvas.width = 1280;
      canvas.height = 720;
    }

    // Clear canvas
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Find current active panel block
    const activeItem =
      panelTimeline.find(
        (item) => currentTime >= item.startTime && currentTime < item.startTime + item.duration
      ) || panelTimeline[0];

    if (activeItem) {
      setActivePanelInfo({
        pageIndex: activeItem.pageIndex,
        panelIndex: activeItem.panelIndex,
        effect: activeItem.cameraEffect,
        speaker: activeItem.speaker,
        text: activeItem.dialogueText,
      });

      // Retrieve cached image or create on-the-fly
      let img = imageCacheRef.current.get(activeItem.imageUrl);
      if (!img) {
        img = new Image();
        img.crossOrigin = 'anonymous';
        const raw = activeItem.rawImageUrl || activeItem.imageUrl;
        img.src = resolveMangaImgSrc(activeItem.imageUrl, raw);
        img.onload = () => {
          if (img) imageCacheRef.current.set(activeItem.imageUrl, img);
        };
      }

      const elapsed = currentTime - activeItem.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / activeItem.duration));

      const renderFrame = () => {
        if (!img || !img.naturalWidth || !img.naturalHeight) {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#22d3ee';
          ctx.font = 'bold 24px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(`🎬 Đang Tải Khung Hình Trang ${activeItem.pageIndex}...`, canvas.width / 2, canvas.height / 2);
          return;
        }

        const natW = img.naturalWidth;
        const natH = img.naturalHeight;

        const cropX = Math.max(0, (activeItem.bbox.x / 100) * natW);
        const cropY = Math.max(0, (activeItem.bbox.y / 100) * natH);
        const cropW = Math.min(natW - cropX, Math.max(50, (activeItem.bbox.w / 100) * natW));
        const cropH = Math.min(natH - cropY, Math.max(50, (activeItem.bbox.h / 100) * natH));

        // Apply smooth camera effect on the Bounding Box
        let scale = 1.0;
        let shiftX = 0;
        let shiftY = 0;

        if (activeItem.cameraEffect === 'dramatic_zoom' || activeItem.cameraEffect === 'zoom_in') {
          scale = 1.0 + progress * 0.18;
        } else if (
          activeItem.cameraEffect === 'slow_zoom_out' ||
          activeItem.cameraEffect === 'zoom_out'
        ) {
          scale = 1.18 - progress * 0.18;
        } else if (activeItem.cameraEffect === 'pan_right') {
          shiftX = (progress - 0.5) * (canvas.width * 0.08);
        } else if (activeItem.cameraEffect === 'pan_left') {
          shiftX = -(progress - 0.5) * (canvas.width * 0.08);
        } else if (activeItem.cameraEffect === 'pan_down') {
          shiftY = (progress - 0.5) * (canvas.height * 0.12);
        } else if (activeItem.cameraEffect === 'pan_up') {
          shiftY = -(progress - 0.5) * (canvas.height * 0.12);
        } else if (
          activeItem.cameraEffect === 'camera_shake' ||
          activeItem.cameraEffect === 'shake'
        ) {
          shiftX = (Math.random() - 0.5) * 8;
          shiftY = (Math.random() - 0.5) * 6;
        }

        // Compute canvas aspect ratio (used by both backdrop and main panel draw)
        const aspectCanvas = canvas.width / canvas.height;
        const aspectCrop = cropW / cropH;

        // 1. Draw Blurred Backdrop filling left & right (Eliminate black pillarbox)
        if (blurredBackground) {
          ctx.save();
          // Heavy Gaussian blur + subtle cinematic contrast
          ctx.filter = 'blur(30px) brightness(0.65) saturate(1.25)';

          const bgAspect = cropW / cropH;
          let bgDrawW = canvas.width;
          let bgDrawH = canvas.height;

          if (bgAspect > aspectCanvas) {
            bgDrawH = canvas.height;
            bgDrawW = canvas.height * bgAspect;
          } else {
            bgDrawW = canvas.width;
            bgDrawH = canvas.width / bgAspect;
          }

          // Overscale by 14% to prevent blur fringes at viewport boundaries
          const overscale = 1.14;
          ctx.drawImage(
            img,
            cropX,
            cropY,
            cropW,
            cropH,
            (canvas.width - bgDrawW * overscale) / 2,
            (canvas.height - bgDrawH * overscale) / 2,
            bgDrawW * overscale,
            bgDrawH * overscale
          );
          ctx.restore();

          // 2. Soft Dark Side Vignette for Depth & Focus
          ctx.save();
          const sideVignette = ctx.createLinearGradient(0, 0, canvas.width, 0);
          sideVignette.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
          sideVignette.addColorStop(0.2, 'rgba(0, 0, 0, 0.05)');
          sideVignette.addColorStop(0.8, 'rgba(0, 0, 0, 0.05)');
          sideVignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
          ctx.fillStyle = sideVignette;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          ctx.fillStyle = '#080a0f';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 3. Draw Main Animated Panel in Center with Camera Motion Effects
        ctx.save();
        ctx.filter = 'none';
        ctx.translate(canvas.width / 2 + shiftX, canvas.height / 2 + shiftY);
        ctx.scale(scale, scale);

        // Aspect fit / cover within canvas viewport
        let drawW = canvas.width;
        let drawH = canvas.height;

        if (aspectCrop > aspectCanvas) {
          drawW = canvas.width;
          drawH = canvas.width / aspectCrop;
        } else {
          drawH = canvas.height;
          drawW = canvas.height * aspectCrop;
        }

        // Deep drop shadow on the central panel for maximum pop and depth
        if (blurredBackground) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 6;
        }

        ctx.drawImage(img, cropX, cropY, cropW, cropH, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // 4. Render 2.5D Motion Comic VFX Particle Overlay (Embers, Aura Smoke, Speed Lines, Eye Flare, Rain)
        motionComicVFXEngine.renderVFX(ctx, canvas.width, canvas.height, vfxOverlay, Date.now());

        // 5. Render TikTok / Shorts High-Retention Viral Captions
        if (activeItem.dialogueText) {
          ctx.save();
          const isPortrait = aspectRatio === '9:16';
          const fontSize = isPortrait ? 36 : 28;
          ctx.font = `900 ${fontSize}px "Montserrat", "Arial Black", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textY = isPortrait ? canvas.height * 0.78 : canvas.height * 0.88;
          const textX = canvas.width / 2;

          // Thick solid black outline (TikTok Viral Punch Style)
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = isPortrait ? 10 : 7;
          ctx.strokeText(activeItem.dialogueText, textX, textY, canvas.width * 0.9);

          // Glowing Solid Neon Yellow Fill
          ctx.fillStyle = '#fde047';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 10;
          ctx.fillText(activeItem.dialogueText, textX, textY, canvas.width * 0.9);
          ctx.restore();
        }
      };

      renderFrame();

      // Trigger voice narration and AI auto-detected Sound FX
      const canSpeak = !isMuted && !isVoiceMuted && audioVolume > 0;
      if (isPlaying && lastSpokenPanelIdRef.current !== activeItem.id) {
        lastSpokenPanelIdRef.current = activeItem.id;

        // Auto-detect and play Sound FX based on dialogue keywords
        const autoSfx = cinematicSoundEngine.detectSfxFromText(activeItem.dialogueText);
        if (autoSfx) {
          cinematicSoundEngine.playSFX(autoSfx);
        } else if (activeItem.cameraEffect === 'dramatic_zoom') {
          cinematicSoundEngine.playSFX('whoosh');
        }

        if (canSpeak && activeItem.dialogueText) {
          playNarrationAudio(activeItem.dialogueText);
        } else {
          stopNarrationAudio();
        }
      } else if (!canSpeak) {
        stopNarrationAudio();
      }
    }

    // Playback loop
    if (isPlaying) {
      const interval = setInterval(() => {
        useStudioStore.setState((s) => {
          const next = s.currentTime + 0.1;
          if (next >= totalVideoDuration) {
            lastSpokenPanelIdRef.current = '';
            stopNarrationAudio();
            return { currentTime: 0, isPlaying: false };
          }
          return { currentTime: next };
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      lastSpokenPanelIdRef.current = '';
      stopNarrationAudio();
    }
  }, [currentTime, isPlaying, panelTimeline, aspectRatio, blurredBackground, totalVideoDuration, isMuted, isVoiceMuted, audioVolume]);

  // CapCut 1-Click Export Function
  const handleExportCapCutDraft = () => {
    const capcutProjectData = {
      app_version: '3.5.0',
      canvas_config: {
        width: aspectRatio === '9:16' ? 1080 : 1920,
        height: aspectRatio === '9:16' ? 1920 : 1080,
        fps: 60,
      },
      tracks: panelTimeline.map((item) => ({
        id: item.id,
        page: item.pageIndex,
        panel: item.panelIndex,
        start_ms: item.startTime * 1000,
        end_ms: (item.startTime + item.duration) * 1000,
        effect: item.cameraEffect,
        dialogue: item.dialogueText,
      })),
      subtitles: panelTimeline.map((item) => ({
        start_ms: item.startTime * 1000,
        end_ms: (item.startTime + item.duration) * 1000,
        speaker: item.speaker,
        text: item.dialogueText,
      })),
    };

    const blob = new Blob([JSON.stringify(capcutProjectData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject?.seriesName || 'Manga'}_CapCut_${aspectRatio.replace(
      ':',
      'x'
    )}_Draft.json`;
    a.click();
    alert(`🎉 Đã xuất thành công dự án CapCut (${aspectRatio}) với đầy đủ keyframe của từng Bounding Box!`);
  };

  const handleExportWebM = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('❌ Canvas chưa sẵn sàng để xuất video.');
      return;
    }

    setIsExporting(true);
    try {
      useStudioStore.setState({ currentTime: 0, isPlaying: true });

      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(60) : null;
      if (!stream) {
        throw new Error('Trình duyệt không hỗ trợ HTML5 Canvas captureStream.');
      }

      let mimeType = 'video/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType.startsWith('video/') ? mimeType : undefined,
        videoBitsPerSecond: 6000000,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: mimeType.includes('mp4') ? 'video/mp4' : 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);

        // Save video blob for future compilation/merging
        if (selectedProject?.id && !isCompilationMode) {
          const videoBlobUrl = URL.createObjectURL(blob);
          saveChapterVideoBlob(selectedProject.id, videoBlobUrl);
        }

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${selectedProject?.seriesName || 'Manga'}_Recap_Chapter_${aspectRatio.replace(':', 'x')}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

        setIsExporting(false);
        useStudioStore.setState({ isPlaying: false });
      };

      mediaRecorder.start();

      const durationMs = Math.max(3000, Math.ceil(totalVideoDuration * 1000) + 500);
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, durationMs);
    } catch (err: any) {
      console.error('[Export Video Error]', err);
      alert(`❌ Lỗi xuất video: ${err.message}`);
      setIsExporting(false);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || audioVolume === 0) return <VolumeX className="w-4 h-4 text-rose-400" />;
    if (audioVolume < 50) return <Volume1 className="w-4 h-4 text-cyan-300" />;
    return <Volume2 className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <span>
              NLE Video Timeline & CapCut ({selectedProject?.seriesName || 'Manga'} -{' '}
              {panelTimeline.length} Panels)
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Video tự động khớp và phóng to/pan đúng vào từng khung hình Panel BBox đã định hình tại OCR View.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live In-Flight Voice Switcher (Vbee / Azure / ElevenLabs) */}
          <div className="flex items-center space-x-1.5 bg-slate-900/95 px-2 py-1 rounded-lg border border-slate-800">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={assignedVoiceId}
              onChange={(e) => {
                const newV = e.target.value;
                setAssignedVoiceId(newV);
                if (!isVoiceMuted && !isMuted) {
                  playNarrationAudio(activePanelInfo?.text || 'Đã chuyển sang giọng đọc Vbee mới!');
                }
              }}
              className="bg-slate-950 border border-slate-700 text-cyan-300 text-[11px] font-bold rounded px-2 py-1 focus:outline-none focus:border-cyan-400"
            >
              {voiceActors.map((v) => (
                <option key={v.id} value={v.id}>
                  🎙️ {v.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                if (isVoiceMuted || isMuted) {
                  setIsVoiceMuted(false);
                  setIsMuted(false);
                }
                playNarrationAudio(
                  activePanelInfo?.text || 'Xin chào! Đây là giọng lồng tiếng AI Vbee chất lượng cao.'
                );
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow cursor-pointer flex items-center space-x-1 transition-all active:scale-95"
            >
              <span>🔊 Nghe Thử Voice</span>
            </button>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>16:9 YouTube</span>
            </button>

            <button
              onClick={() => setAspectRatio('9:16')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-gradient-to-r from-pink-600 to-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>9:16 Shorts/TikTok</span>
            </button>
          </div>

          {/* Blurred Background Toggle Button */}
          <button
            onClick={() => setBlurredBackground((prev) => !prev)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer shadow-sm active:scale-95 ${
              blurredBackground
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 border-purple-400 text-white shadow-purple-900/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Bật/Tắt hiệu ứng nền mờ 2 bên (Tránh viền đen)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${blurredBackground ? 'text-amber-300' : 'text-slate-500'}`} />
            <span>{blurredBackground ? 'Nền Mờ 2 Bên (BẬT)' : 'Nền Đen Cũ'}</span>
          </button>

          {/* Viral Lab Jump Button */}
          <button
            onClick={() => setActiveTab('viral_lab')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Mở phòng thí nghiệm phân tích độ Viral và tối ưu nhịp độ giữ chân người xem"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>🔥 Phân Tích Viral</span>
          </button>

          {/* Export CapCut */}
          <button
            onClick={handleExportCapCutDraft}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Xuất CapCut (.json)</span>
          </button>

          {/* Export MP4/WebM */}
          <button
            onClick={handleExportWebM}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất Video MP4'}</span>
          </button>

          {/* YouTube Direct Publisher Button */}
          <button
            onClick={() => setIsYouTubeModalOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>🚀 Đăng YouTube</span>
          </button>

          {/* Merge Chapters Button */}
          {projects.length >= 2 && (
            <button
              onClick={() => {
                setSelectedChapterIds(projects.map((p) => p.id));
                setIsMergeModalOpen(true);
              }}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>🎞️ Ghép Nhiều Chapter</span>
            </button>
          )}
        </div>

        {/* Compilation Mode Badge */}
        {isCompilationMode && compilationConfig && (
          <div className="flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2 mt-2">
            <div className="flex items-center space-x-2">
              <GitMerge className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                🎞️ Compilation Mode: {compilationConfig.chapters.length} Chapter • {compilationConfig.totalPages} Trang • ~{Math.round(compilationConfig.totalDurationEst / 60)} Phút
              </span>
            </div>
            <button
              onClick={exitCompilationMode}
              className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 rounded border border-red-500/30 hover:border-red-400/50 transition-all cursor-pointer"
            >
              Thoát Compilation
            </button>
          </div>
        )}
      </div>

      {/* Main Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Canvas Player */}
        <div className="lg:col-span-8 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Realtime Canvas ({aspectRatio})</span>
              </span>
              <span className="font-mono text-cyan-400 text-[10px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                60 FPS • {activePanelInfo?.effect || 'Ken Burns Animation'}
              </span>
            </div>

            {/* Video Canvas Element */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[460px] p-1">
              <canvas
                ref={canvasRef}
                className={`rounded shadow-2xl ${
                  aspectRatio === '9:16'
                    ? 'h-[440px] w-auto max-w-[250px]'
                    : 'w-full h-auto max-h-[440px]'
                }`}
              />
            </div>

            {/* Playback Controls & Scrubber with Volume Bar */}
            <div className="space-y-2 pt-1">
              {/* Row 1: Play, Reset, Time, Scrubber Bar */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={() => {
                    setCurrentTime(0);
                    stopNarrationAudio();
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                  title="Về đầu video"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="text-[11px] font-mono text-slate-300 font-bold shrink-0">
                  {currentTime.toFixed(1)}s / {totalVideoDuration.toFixed(1)}s
                </div>

                {/* Scrubber Bar */}
                <input
                  type="range"
                  min={0}
                  max={totalVideoDuration}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    const t = parseFloat(e.target.value);
                    setCurrentTime(t);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              {/* Row 2: 2.5D Motion Comic VFX Particles & Aspect Ratio Selector */}
              <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-violet-900/40 text-xs">
                {/* VFX Selector */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10.5px] font-bold text-violet-300 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>✨ VFX Particles (60 FPS):</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    {[
                      { id: 'none', label: 'Tắt VFX' },
                      { id: 'ember_sparks', label: '🔥 Tàn Lửa' },
                      { id: 'aura_smoke', label: '🔮 Hào Quang' },
                      { id: 'speed_lines', label: '⚡ Tốc Độ' },
                      { id: 'eye_flare', label: '👁️ Mắt Lóe' },
                      { id: 'rain_storm', label: '🌧️ Mưa Sấm' },
                    ].map((item) => {
                      const isSel = vfxOverlay === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setVFXOverlay(item.id as VFXType)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-400 text-white shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick 16:9 / 9:16 Ratio Selector */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-slate-400">Khung Hình:</span>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                      aspectRatio === '16:9'
                        ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Tv className="w-3 h-3" />
                    <span>16:9 (YouTube)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                      aspectRatio === '9:16'
                        ? 'bg-pink-950 border-pink-600 text-pink-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>9:16 (TikTok/Shorts)</span>
                  </button>
                </div>
              </div>

              {/* Row 3: Comprehensive Audio & Volume Control Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-950/90 px-3 py-2 rounded-lg border border-slate-800 text-xs">
                {/* Master Volume Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`p-1.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
                      isMuted || audioVolume === 0
                        ? 'bg-rose-950/80 border border-rose-700/60 text-rose-300'
                        : 'bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                    title={isMuted ? 'Bật lại âm thanh' : 'Tắt tiếng (Mute)'}
                  >
                    {getVolumeIcon()}
                    <span className="text-[10.5px] font-bold">
                      {isMuted || audioVolume === 0 ? 'Đã Tắt Tiếng' : 'Âm Lượng'}
                    </span>
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={isMuted ? 0 : audioVolume}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setAudioVolume(v);
                        if (isMuted && v > 0) setIsMuted(false);
                      }}
                      className="w-24 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                    />
                    <span className="text-[10px] font-mono text-cyan-300 font-bold w-9 text-right">
                      {isMuted ? '0%' : `${audioVolume}%`}
                    </span>
                  </div>
                </div>

                {/* Individual Track Toggles (Voice AI & BGM) */}
                <div className="flex items-center space-x-2">
                  {/* Voice AI Mute Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isVoiceMuted;
                      setIsVoiceMuted(next);
                      if (next) stopNarrationAudio();
                    }}
                    className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isVoiceMuted
                        ? 'bg-amber-950/70 border-amber-700/60 text-amber-300 shadow-inner'
                        : 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60'
                    }`}
                    title={isVoiceMuted ? 'Bật lại giọng đọc AI' : 'Tắt riêng giọng đọc AI (nếu voice bị lỗi hoặc chỉ muốn xem hình)'}
                  >
                    {isVoiceMuted ? <MicOff className="w-3 h-3 text-amber-400" /> : <Mic className="w-3 h-3 text-cyan-400" />}
                    <span>{isVoiceMuted ? 'Voice AI: ĐÃ TẮT' : 'Voice AI: ĐANG BẬT'}</span>
                  </button>

                  {/* BGM Mute Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsBgmMuted(!isBgmMuted)}
                    className={`px-2.5 py-1 rounded text-[10.5px] font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isBgmMuted
                        ? 'bg-slate-900/80 border-slate-800 text-slate-500'
                        : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60'
                    }`}
                  >
                    <Music className="w-3 h-3" />
                    <span>{isBgmMuted ? 'Nhạc Nền: Tắt' : 'Nhạc Nền: Bật'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Active Panel & Audio Mixer Inspector */}
        <div className="lg:col-span-4 space-y-3">
          {/* Active Panel Details */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white">Khung Hình & Hiệu Ứng Đang Chiếu</h3>
              <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                Active Panel
              </span>
            </div>

            {activePanelInfo && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-cyan-300">
                    Trang {activePanelInfo.pageIndex} • Panel {activePanelInfo.panelIndex}
                  </span>
                  <span className="text-[9px] font-mono text-violet-300 bg-violet-950 px-1.5 py-0.5 rounded border border-violet-800">
                    {activePanelInfo.effect}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    👤 {activePanelInfo.speaker}:
                  </span>
                  <p className="text-[11px] text-amber-200 bg-slate-900 p-2 rounded border border-slate-800/80 font-mono">
                    "{activePanelInfo.text}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Audio Mixer & Sound Settings */}
          <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-950/90 via-slate-900/60 to-cyan-950/20 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-300">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>🎚️ Bảng Điều Khiển Âm Lượng & Voice AI</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {isMuted ? 'Mute' : `${audioVolume}% Vol`}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* 1. Master Volume Control */}
              <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1">
                    {getVolumeIcon()}
                    <span>Âm Lượng Tổng (Master)</span>
                  </span>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-[10px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    {isMuted ? 'Bật Tiếng' : 'Tắt Tiếng'}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={isMuted ? 0 : audioVolume}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setAudioVolume(v);
                      if (isMuted && v > 0) setIsMuted(false);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
                  />
                  <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
                    {isMuted ? '0%' : `${audioVolume}%`}
                  </span>
                </div>
              </div>

              {/* 2. Voice AI Specific Control */}
              <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-cyan-300 flex items-center space-x-1">
                    <Mic className="w-3 h-3 text-cyan-400" />
                    <span>Giọng Đọc AI (Voice TTS)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isVoiceMuted;
                      setIsVoiceMuted(next);
                      if (next) stopNarrationAudio();
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      isVoiceMuted
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {isVoiceMuted ? 'Đang Tắt' : 'Đang Bật'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isVoiceMuted
                    ? '⚠️ Đã tắt giọng đọc AI (Video chạy im lặng hoặc chỉ phát nhạc).'
                    : '✓ Đang lồng tiếng tự động đồng bộ theo từng khung hình.'}
                </p>
              </div>

              {/* 3. BGM Music Specific Control with Mood Selector */}
              <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-300 flex items-center space-x-1">
                    <Music className="w-3 h-3 text-emerald-400" />
                    <span>Nhạc Nền Manga (BGM)</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300 font-bold">
                      ⚡ Ducking -18dB
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBgmMuted(!isBgmMuted)}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      {isBgmMuted ? 'Bật Nhạc' : 'Tắt Nhạc'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={isBgmMuted ? 0 : bgmVolume}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setBgmVolume(v);
                      if (isBgmMuted && v > 0) setIsBgmMuted(false);
                    }}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
                  />
                  <span className="text-[10px] font-mono text-slate-300 w-8 text-right">
                    {isBgmMuted ? '0%' : `${bgmVolume}%`}
                  </span>
                </div>

                {/* Mood BGM Selector */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <span className="text-[9.5px] font-bold text-slate-400 block">
                    🎭 Mood Nhạc Nền:
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'epic_battle', label: '⚔️ Chiến Đấu', desc: 'Epic Battle' },
                      { id: 'mysterious_lore', label: '🔮 Bí Ẩn', desc: 'Mysterious' },
                      { id: 'tension_suspense', label: '⚡ Kịch Tính', desc: 'Tension' },
                      { id: 'emotional_sad', label: '🥀 Cảm Động', desc: 'Sad Piano' },
                      { id: 'phonk_hype', label: '🔥 Phonk Hype', desc: 'TikTok Bass' },
                      { id: 'chill_recap', label: '☕ Chill Lofi', desc: 'Relax Lore' },
                    ].map((mood) => {
                      const isSel = bgmMood === mood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setBgmMood(mood.id as MoodBgmType)}
                          className={`p-1 rounded text-center text-[9.5px] font-bold border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {mood.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Instant Anime Sound FX Launchpad */}
              <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-amber-300 flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>🔊 Anime Sound FX (Tự động kích hoạt theo thoại)</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Click để test</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { type: 'slash', label: '⚔️ Chém Kiếm' },
                    { type: 'heavy_impact', label: '💥 Đấm Bốc' },
                    { type: 'thunder', label: '⚡ Sấm Chớp' },
                    { type: 'system_ding', label: '🔔 Level Up' },
                    { type: 'magic_cast', label: '✨ Ma Pháp' },
                    { type: 'whoosh', label: '💨 Tốc Biến' },
                    { type: 'power_up', label: '🔥 Tụ Lực' },
                    { type: 'heartbeat', label: '💓 Tim Đập' },
                  ].map((sfx) => (
                    <button
                      key={sfx.type}
                      type="button"
                      onClick={() => triggerSFX(sfx.type as SoundEffectType)}
                      className="p-1 bg-slate-900 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-700/60 rounded text-[9.5px] font-bold text-slate-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer text-center truncate"
                      title={`Kích hoạt âm thanh ${sfx.label}`}
                    >
                      {sfx.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Tracks NLE Timeline Bar with Clickable Panel Blocks */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-200">
            <Layers className="w-4 h-4 text-violet-400" />
            <span>NLE 5-Tracks Timeline (Nhấp vào từng Panel để chuyển ngay tới khung hình & giọng đọc đó)</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Thời lượng: {totalVideoDuration.toFixed(0)}s
          </span>
        </div>

        {/* Timeline Tracks Grid */}
        <div className="space-y-2 overflow-x-auto pb-2">
          {/* Track 1: IMAGE PANELS */}
          <div className="flex items-center space-x-2 min-w-[720px]">
            <span className="w-16 text-[9.5px] font-mono font-bold text-slate-400 shrink-0">
              PANELS
            </span>
            <div className="flex-1 flex space-x-1">
              {panelTimeline.map((item) => {
                const isActive =
                  currentTime >= item.startTime && currentTime < item.startTime + item.duration;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTime(item.startTime);
                      if (!isMuted && !isVoiceMuted && audioVolume > 0) {
                        playNarrationAudio(item.dialogueText);
                      }
                    }}
                    className={`flex-1 py-1.5 px-1 rounded text-[10px] font-mono font-bold transition-all text-center truncate cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-black ring-2 ring-cyan-300 shadow-md'
                        : 'bg-violet-900/60 hover:bg-violet-800 text-violet-200'
                    }`}
                  >
                    T{item.pageIndex}-P{item.panelIndex}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track 2: VOICE TTS */}
          <div className="flex items-center space-x-2 min-w-[720px]">
            <span className="w-16 text-[9.5px] font-mono font-bold text-slate-400 shrink-0">
              VOICE
            </span>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded py-1.5 px-2 flex items-center space-x-2">
              <div className="h-2 flex-1 bg-gradient-to-r from-cyan-500/40 via-violet-500/40 to-cyan-500/40 rounded animate-pulse" />
              <span className="text-[9px] font-mono text-cyan-300 shrink-0">
                {isVoiceMuted ? '🔇 Voice AI Đã Tắt' : '🎙️ Giọng Vbee Lồng Tiếng Đồng Bộ'}
              </span>
            </div>
          </div>

          {/* Track 3: SUBTITLE */}
          <div className="flex items-center space-x-2 min-w-[720px]">
            <span className="w-16 text-[9.5px] font-mono font-bold text-slate-400 shrink-0">
              SUBTITLE
            </span>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded py-1.5 px-2 flex items-center space-x-2">
              <div className="h-2 flex-1 bg-amber-500/30 rounded" />
              <span className="text-[9px] font-mono text-yellow-300 shrink-0">
                Phụ Đề Màu Vàng CapCut
              </span>
            </div>
          </div>

          {/* Track 4: MUSIC */}
          <div className="flex items-center space-x-2 min-w-[720px]">
            <span className="w-16 text-[9.5px] font-mono font-bold text-slate-400 shrink-0">
              MUSIC
            </span>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded py-1.5 px-2 flex items-center space-x-2">
              <div className="h-2 flex-1 bg-emerald-500/20 rounded" />
              <span className="text-[9px] font-mono text-emerald-400 shrink-0">
                {isBgmMuted ? '🔇 BGM Đã Tắt' : '🎵 BGM Nhạc Nền Anime'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compilation Video Preview & Download */}
      {compilationVideoUrl && isCompilationMode && (
        <div className="glass-panel border border-emerald-500/30 rounded-xl p-4 space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-300 flex items-center space-x-2">
              <Film className="w-4 h-4 text-emerald-400" />
              <span>✅ Video Compilation Hoàn Tất</span>
            </h3>
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = compilationVideoUrl;
                a.download = `${selectedProject?.seriesName || 'Manga'}_Full_Compilation.webm`;
                a.click();
              }}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Video Compilation</span>
            </button>
          </div>
          <video
            src={compilationVideoUrl}
            controls
            className="w-full rounded-lg border border-slate-700 max-h-[320px]"
          />
        </div>
      )}

      {/* Concat Progress Indicator */}
      {isConcattingVideos && (
        <div className="glass-panel border border-amber-500/30 rounded-xl p-4 space-y-2 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-amber-300">
              Đang ghép video... Chapter {concatProgress.current}/{concatProgress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${concatProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Merge Chapters Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-panel border border-violet-500/30 rounded-2xl p-5 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <GitMerge className="w-4 h-4 text-amber-400" />
                <span>🎞️ Ghép Nhiều Chapter Thành Video Dài</span>
              </h3>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Chọn các chapter muốn ghép. Các chapter <span className="text-emerald-400 font-bold">đã render video</span> sẽ được ghép thành 1 file video dài.
              Chapter <span className="text-red-400 font-bold">chưa render</span> cần xuất video trước khi ghép.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {projects.map((p) => {
                const isChecked = selectedChapterIds.includes(p.id);
                const hasVideo = !!chapterVideoBlobs[p.id];
                return (
                  <label
                    key={p.id}
                    className={`flex items-center space-x-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-amber-500/50 bg-amber-950/20'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChapterIds([...selectedChapterIds, p.id]);
                        } else {
                          setSelectedChapterIds(selectedChapterIds.filter((id) => id !== p.id));
                        }
                      }}
                      className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                    />
                    <img
                      src={p.coverUrl}
                      alt={p.seriesName}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{p.seriesName}</div>
                      <div className="text-[10px] text-slate-400">
                        Chapter {p.chapterNumber} • ~{Math.round((p.durationEst || 0) / 60)} phút
                      </div>
                    </div>
                    {/* Render status badge */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        hasVideo
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {hasVideo ? '✅ Đã render' : '❌ Chưa render'}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeBumpers}
                  onChange={(e) => setMergeBumpers(e.target.checked)}
                  className="w-3.5 h-3.5 accent-violet-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-300">Chèn Title Card giữa các chapter</span>
              </label>

              <span className="text-[10px] text-cyan-400 font-mono">
                {selectedChapterIds.length} chapter đã chọn •{' '}
                {selectedChapterIds.filter((id) => !!chapterVideoBlobs[id]).length} đã render
              </span>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="flex-1 text-xs font-bold text-slate-400 hover:text-white py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              >
                Hủy
              </button>

              {/* Primary: Concat real video files */}
              <button
                onClick={async () => {
                  if (selectedChapterIds.length < 2) return;
                  setIsMergeModalOpen(false);
                  await renderAndConcatVideos(selectedChapterIds, { includeBumpers: mergeBumpers });
                }}
                disabled={
                  selectedChapterIds.length < 2 ||
                  selectedChapterIds.filter((id) => !!chapterVideoBlobs[id]).length < 2 ||
                  isConcattingVideos
                }
                className="flex-1 text-xs font-bold text-white py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🎬 Ghép Video Thật ({selectedChapterIds.filter((id) => !!chapterVideoBlobs[id]).length} video)
              </button>
            </div>

            {/* Helper: Merge page-level fallback */}
            <button
              onClick={async () => {
                if (selectedChapterIds.length < 2) return;
                await mergeChaptersToCompilation(selectedChapterIds, { includeBumpers: mergeBumpers });
                setIsMergeModalOpen(false);
              }}
              disabled={selectedChapterIds.length < 2}
              className="w-full text-[10px] text-slate-500 hover:text-slate-300 py-1.5 rounded border border-slate-800 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-40"
            >
              Hoặc: Ghép mức trang ảnh (preview timeline, chưa cần render video)
            </button>
          </div>
        </div>
      )}

      {/* YouTube Direct Video Publisher & Premiere Scheduler Modal */}
      <YouTubePublisherModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
      />
    </div>
  );
};
