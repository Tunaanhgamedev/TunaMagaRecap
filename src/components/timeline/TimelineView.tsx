import React, { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Play,
  Pause,
  RotateCcw,
  Film,
  Download,
  Layers,
  Camera,
  Music,
  Mic,
  Subtitles,
  Zap,
  Share2,
  FolderOpen,
  Smartphone,
  Tv,
  Maximize2,
  Sparkles,
  Volume2,
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    currentTime,
    setCurrentTime,
    duration,
    clips,
    subtitles,
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
  } = useStudioStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastSpokenPanelIdRef = useRef<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [activePanelInfo, setActivePanelInfo] = useState<{
    pageIndex: number;
    panelIndex: number;
    effect: string;
    speaker: string;
    text: string;
  } | null>(null);

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
          imageUrl: page.imageUrl,
          rawImageUrl: (page as any).rawImageUrl || page.imageUrl,
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

  // Pre-fetch and cache all page images into imageCacheRef
  useEffect(() => {
    pages.forEach((page) => {
      const raw = (page as any).rawImageUrl || page.imageUrl;
      const proxyUrl = `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(
        raw
      )}&referer=${encodeURIComponent('https://truyenqqko.com/')}`;

      if (!imageCacheRef.current.has(page.imageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = proxyUrl;
        img.onload = () => {
          imageCacheRef.current.set(page.imageUrl, img);
        };
        img.onerror = () => {
          // Fallback to direct URL if proxy fails
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
        img.src = `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(
          raw
        )}&referer=${encodeURIComponent('https://truyenqqko.com/')}`;
        img.onload = () => {
          if (img) imageCacheRef.current.set(activeItem.imageUrl, img);
        };
      }

      const elapsed = currentTime - activeItem.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / activeItem.duration));

      const renderFrame = () => {
        if (!img || !img.naturalWidth || !img.naturalHeight) {
          // Illustrated fallback card if image is loading
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#1e1b4b');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#22d3ee';
          ctx.font = 'bold 24px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(
            `Trang ${activeItem.pageIndex} • Panel ${activeItem.panelIndex}`,
            canvas.width / 2,
            canvas.height / 2 - 20
          );
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px system-ui';
          ctx.fillText(`"${activeItem.dialogueText}"`, canvas.width / 2, canvas.height / 2 + 20);
          return;
        }

        // Exact Bounding Box Crop Calculation
        const bbox = activeItem.bbox;
        const cropX = (bbox.x / 100) * img.naturalWidth;
        const cropY = (bbox.y / 100) * img.naturalHeight;
        const cropW = (bbox.w / 100) * img.naturalWidth;
        const cropH = (bbox.h / 100) * img.naturalHeight;

        // Apply smooth camera effect on the Bounding Box
        let scale = 1.0;
        let shiftX = 0;
        let shiftY = 0;

        if (activeItem.cameraEffect === 'dramatic_zoom' || activeItem.cameraEffect === 'zoom_in') {
          scale = 1.0 + progress * 0.18; // Smooth 18% zoom into focal point
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

        // Draw cropped panel onto video canvas
        ctx.save();
        ctx.translate(canvas.width / 2 + shiftX, canvas.height / 2 + shiftY);
        ctx.scale(scale, scale);

        // Aspect fit / cover within canvas viewport
        const aspectCanvas = canvas.width / canvas.height;
        const aspectCrop = cropW / cropH;

        let drawW = canvas.width;
        let drawH = canvas.height;

        if (aspectCrop > aspectCanvas) {
          drawW = canvas.width;
          drawH = canvas.width / aspectCrop;
        } else {
          drawH = canvas.height;
          drawW = canvas.height * aspectCrop;
        }

        ctx.drawImage(img, cropX, cropY, cropW, cropH, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      };

      renderFrame();

      // Trigger voice narration for the active panel dialogue
      if (isPlaying && activeItem.dialogueText && lastSpokenPanelIdRef.current !== activeItem.id) {
        lastSpokenPanelIdRef.current = activeItem.id;
        playNarrationAudio(activeItem.dialogueText);
      }
    }

    // Playback loop
    if (isPlaying) {
      const interval = setInterval(() => {
        useStudioStore.setState((s) => {
          const next = s.currentTime + 0.1;
          if (next >= totalVideoDuration) {
            lastSpokenPanelIdRef.current = '';
            return { currentTime: 0, isPlaying: false };
          }
          return { currentTime: next };
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      lastSpokenPanelIdRef.current = '';
    }
  }, [currentTime, isPlaying, panelTimeline, aspectRatio, totalVideoDuration]);

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
        type: 'image_panel',
        page: item.pageIndex,
        panel: item.panelIndex,
        bbox: item.bbox,
        start_ms: item.startTime * 1000,
        duration_ms: item.duration * 1000,
        animation_effect: item.cameraEffect,
        image_source: item.imageUrl,
        speaker: item.speaker,
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
      // 1. Reset timeline playback to start
      useStudioStore.setState({ currentTime: 0, isPlaying: true });

      // 2. Capture canvas stream at 60 FPS
      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(60) : null;
      if (!stream) {
        throw new Error('Trình duyệt không hỗ trợ HTML5 Canvas captureStream.');
      }

      // Check supported MIME type
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
        videoBitsPerSecond: 6000000, // High quality 6Mbps bitrate
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

      // Record for the total duration of the timeline video + 500ms buffer
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
                playNarrationAudio(activePanelInfo?.text || 'Đã chuyển sang giọng đọc Vbee mới!');
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
              onClick={() =>
                playNarrationAudio(
                  activePanelInfo?.text || 'Xin chào! Đây là giọng lồng tiếng AI Vbee chất lượng cao.'
                )
              }
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
        </div>
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

            {/* Playback Controls & Scrubber */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow transition-all active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentTime(0);
                  stopNarrationAudio();
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors cursor-pointer"
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
          </div>
        </div>

        {/* Right: Active Panel & Track Inspector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white">Khung Hình & Hiệu Ứng Đang Chiếu</h3>
              <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                Active Panel
              </span>
            </div>

            {/* Current Active Panel Details */}
            {activePanelInfo && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
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

            {/* 5-Tracks Overview List */}
            <div className="space-y-2 pt-1 text-[11px]">
              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-violet-300 font-semibold">
                  <Camera className="w-3.5 h-3.5" />
                  <span>1. Image Panel Track</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {panelTimeline.length} Panels
                </span>
              </div>

              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold">
                  <Mic className="w-3.5 h-3.5" />
                  <span>2. Voice TTS Track</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Vbee Studio / Azure</span>
              </div>

              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-yellow-300 font-semibold">
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>3. Subtitle Track</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">CapCut Yellow</span>
              </div>

              <div className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
                  <Music className="w-3.5 h-3.5" />
                  <span>4. Music Track</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Epic Anime BGM</span>
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
                      playNarrationAudio(item.dialogueText);
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
                Giọng Vbee Lồng Tiếng Đồng Bộ
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
                BGM Nhạc Nền Anime
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
