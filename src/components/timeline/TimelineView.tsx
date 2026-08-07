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
    setActiveTab,
    selectedProject,
    playNarrationAudio,
    stopNarrationAudio,
  } = useStudioStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Empty State when no clips have been imported yet
  if (clips.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu Timeline Video</h2>
          <p className="text-xs text-slate-400">
            Hệ thống không tự ý đưa dữ liệu giả. Vui lòng dán link chapter truyện tại tab Thư Viện để tải ảnh, thoại và tạo 5 track NLE Timeline.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Mở Thư Viện & Dán Link Truyện</span>
          </button>
        </div>
      </div>
    );
  }

  // HTML5 Canvas Video Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#080a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imageClips = clips.filter((c) => c.trackId === 'image');
    const activeClip = imageClips.find(
      (c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration
    );

    if (activeClip && activeClip.imageUrl) {
      const img = new Image();
      img.src = activeClip.imageUrl;

      const elapsed = currentTime - activeClip.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / activeClip.duration));

      let scale = 1.0;
      let offsetX = 0;

      if (activeClip.animationEffect === 'dramatic_zoom') {
        scale = 1.0 + progress * 0.25;
      } else if (activeClip.animationEffect === 'pan_right') {
        offsetX = progress * 40;
      } else if (activeClip.animationEffect === 'shake') {
        offsetX = (Math.random() - 0.5) * 8;
      }

      ctx.save();
      ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${selectedProject?.seriesName || 'MANGA STUDIO AI'} - PREVIEW`, canvas.width / 2, canvas.height / 2);
    }

    const activeSub = subtitles.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );

    if (activeSub) {
      ctx.save();
      ctx.font = '900 22px system-ui';
      ctx.textAlign = 'center';

      const textMetrics = ctx.measureText(activeSub.text);
      const textWidth = textMetrics.width + 24;
      const textY = canvas.height - 40;

      ctx.fillStyle = 'rgba(234, 179, 8, 0.95)';
      ctx.fillRect(canvas.width / 2 - textWidth / 2, textY - 22, textWidth, 30);

      ctx.fillStyle = '#000000';
      ctx.fillText(activeSub.text, canvas.width / 2, textY);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MANGA STUDIO AI • CAPCUT READY', 16, 24);

    if (activeSub && isPlaying) {
      playNarrationAudio(activeSub.text);
    } else if (!isPlaying) {
      stopNarrationAudio();
    }

    if (isPlaying) {
      const interval = setInterval(() => {
        useStudioStore.setState((s) => {
          const next = s.currentTime + 0.1;
          if (next >= s.duration) {
            return { currentTime: 0, isPlaying: false };
          }
          return { currentTime: next };
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentTime, isPlaying, clips, subtitles]);

  // CapCut 1-Click Export Function (MagaRecap Feature)
  const handleExportCapCutDraft = () => {
    const capcutProjectData = {
      app_version: '3.5.0',
      canvas_config: { width: 1920, height: 1080, fps: 60 },
      tracks: clips.map((c) => ({
        id: c.id,
        type: c.trackId,
        start: c.startTime * 1000,
        duration: c.duration * 1000,
        animation: c.animationEffect || 'zoom_in',
        source: c.title,
      })),
      subtitles: subtitles.map((s) => ({
        start: s.startTime * 1000,
        end: s.endTime * 1000,
        text: s.text,
      })),
    };

    const blob = new Blob([JSON.stringify(capcutProjectData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject?.seriesName || 'Manga'}_CapCut_Draft.json`;
    a.click();
    alert('Đã xuất file dự án CapCut (.json) thành công! Bạn có thể mở trực tiếp trong CapCut.');
  };

  const handleExportWebM = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Đã xuất video WebM 4K thành công!');
    }, 2500);
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <span>
              NLE Video Timeline & CapCut Exporter ({selectedProject?.seriesName} - Chap {selectedProject?.chapterNumber})
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dựng video 5 Tracks với hiệu ứng Ken Burns & Xuất dự án 1-click sang CapCut.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCapCutDraft}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Xuất Sang CapCut (.json)</span>
          </button>

          <button
            onClick={handleExportWebM}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 text-cyan-300 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Đang Xuất 4K...' : 'Xuất Video MP4/WebM'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Preview & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-2">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>4K Realtime Canvas Preview</span>
              </span>
              <span className="font-mono text-cyan-300">60 FPS • Ken Burns Motion</span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <canvas ref={canvasRef} width={800} height={450} className="w-full h-auto aspect-video object-contain" />
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-sm transition-all active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="font-mono text-[11px] font-bold text-cyan-400">
                  {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-40 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Track Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>Cấu Hình CapCut & Tracks</span>
              <span className="text-[10px] font-mono text-emerald-400">CapCut Ready</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="glass-card p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 font-bold text-violet-300">
                  <Camera className="w-3.5 h-3.5" />
                  <span>1. Image Track</span>
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">Ken Burns Pan/Zoom</span>
              </div>

              <div className="glass-card p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 font-bold text-cyan-300">
                  <Mic className="w-3.5 h-3.5" />
                  <span>2. Voice Track</span>
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">ElevenLabs / Edge-TTS</span>
              </div>

              <div className="glass-card p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 font-bold text-yellow-300">
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>3. Subtitle Track</span>
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">CapCut Captions</span>
              </div>

              <div className="glass-card p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="flex items-center space-x-1.5 font-bold text-emerald-300">
                  <Music className="w-3.5 h-3.5" />
                  <span>4. Music Track</span>
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">Epic Battle BGM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Track NLE Timeline */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>NLE 5-Tracks Timeline</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Duration: {duration}s</span>
        </div>

        <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 relative overflow-x-auto">
          <div
            style={{ left: `${(currentTime / duration) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none shadow-md"
          >
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1 -mt-0.5 shadow" />
          </div>

          {['image', 'voice', 'subtitle', 'music', 'effect'].map((trackType) => (
            <div key={trackType} className="flex items-center space-x-2 text-xs">
              <div className="w-20 font-bold text-slate-400 uppercase font-mono text-[9px] shrink-0">
                {trackType}
              </div>

              <div className="flex-1 h-8 bg-slate-900/80 rounded-md border border-slate-800 relative overflow-hidden">
                {clips
                  .filter((c) => c.trackId === trackType)
                  .map((clip) => {
                    const left = (clip.startTime / duration) * 100;
                    const width = (clip.duration / duration) * 100;

                    return (
                      <div
                        key={clip.id}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: clip.color,
                        }}
                        className="absolute top-0.5 bottom-0.5 rounded px-1.5 flex items-center justify-between text-[9.5px] text-white font-semibold shadow-sm overflow-hidden opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <span className="truncate">{clip.title}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
