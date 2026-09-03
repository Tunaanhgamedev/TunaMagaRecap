import React, { useState, useEffect } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  TrendingUp,
  Flame,
  Sparkles,
  Clock,
  Film,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  Award,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  Lightbulb,
} from 'lucide-react';

export const ViralLabView: React.FC = () => {
  const {
    clips,
    scriptData,
    selectedProject,
    viralReport,
    runViralAnalysis,
    applyViralPacingOptimization,
    applyViralHookToScript,
    benchmarkChannels,
    selectedBenchmarkChannel,
    setSelectedBenchmarkChannel,
    setActiveTab,
    isAnalyzingViral,
  } = useStudioStore();

  const [copiedHookId, setCopiedHookId] = useState<string | null>(null);
  const [pacingAppliedToast, setPacingAppliedToast] = useState(false);
  const [hookAppliedToast, setHookAppliedToast] = useState(false);

  // Auto-run analysis if not yet run
  useEffect(() => {
    if (!viralReport && clips.length > 0) {
      runViralAnalysis();
    }
  }, [viralReport, clips.length, runViralAnalysis]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHookId(id);
    setTimeout(() => setCopiedHookId(null), 2000);
  };

  const handleApplyPacing = () => {
    const selectedChan = benchmarkChannels.find((c) => c.id === selectedBenchmarkChannel);
    const targetPacing = selectedChan ? selectedChan.avgPacingSec : 3.5;
    applyViralPacingOptimization(targetPacing);
    setPacingAppliedToast(true);
    setTimeout(() => setPacingAppliedToast(false), 3000);
  };

  const handleApplyHook = (hookText: string) => {
    applyViralHookToScript(hookText);
    setHookAppliedToast(true);
    setTimeout(() => setHookAppliedToast(false), 3000);
  };

  if (clips.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Chưa Có Dữ Liệu Video & Khung Hình</h2>
          <p className="text-xs text-slate-400">
            Vui lòng dán link chapter truyện tại tab Thư Viện để cào toàn bộ ảnh và bắt đầu phân tích độ viral.
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Mở Thư Viện & Cào Ảnh Truyện</span>
          </button>
        </div>
      </div>
    );
  }

  const currentBenchmark = benchmarkChannels.find((c) => c.id === selectedBenchmarkChannel) || benchmarkChannels[0];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="gradient-text">Viral Video Lab & Retention Intelligence</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Phân tích thuật toán giữ chân người xem (Average View Duration) và tối ưu hóa video dựa trên các kênh Manga Recap triệu view nổi tiếng thế giới.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runViralAnalysis()}
            disabled={isAnalyzingViral}
            className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzingViral ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingViral ? 'Đang Phân Tích...' : 'Quét Lại Video'}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>Sang NLE & Xuất Video</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Score Card + 1-Click Viral Auto-Tune */}
      {viralReport && (
        <div className="glass-panel p-4 rounded-xl border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/90 to-violet-950/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left: Score Gauge */}
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-lg ${
                    viralReport.overallScore >= 85
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-emerald-500/20'
                      : viralReport.overallScore >= 70
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-amber-500/20'
                      : 'border-rose-500 bg-rose-950/40 text-rose-300 shadow-rose-500/20'
                  }`}
                >
                  <span className="text-xl font-extrabold tracking-tight font-mono leading-none">
                    {viralReport.overallScore}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    Điểm Viral
                  </span>
                </div>
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border shadow-md font-mono ${
                    viralReport.tier === 'S+'
                      ? 'bg-amber-500 text-black border-yellow-300'
                      : viralReport.tier === 'A'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-violet-600 text-white border-violet-400'
                  }`}
                >
                  {viralReport.tier} TIER
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-white">
                    {viralReport.overallScore >= 90
                      ? '🔥 Video Đã Đạt Chuẩn Giữ Chân Triệu View!'
                      : viralReport.overallScore >= 75
                      ? '⚡ Video Khá Tốt - Có Thể Tối Ưu Thêm Nhịp Độ'
                      : '⚠️ Cần Cải Thiện Nhịp Chuyển Cảnh & Hook'}
                  </h2>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Tổng thời lượng: <span className="font-mono text-cyan-300 font-bold">{Math.round(viralReport.totalDurationSec)}s</span> ({viralReport.totalClips} khung hình ảnh thật). Nhịp độ hiện tại: <span className="font-mono text-cyan-300 font-bold">{viralReport.avgClipDurationSec}s/cảnh</span> ({viralReport.cutsPerMinute} chuyển cảnh/phút).
                </p>
                <div className="flex items-center space-x-2 text-[10.5px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bảo toàn 100% ảnh đã cào • Sẵn sàng xem trước Canvas & xuất CapCut / MP4</span>
                </div>
              </div>
            </div>

            {/* Right: Quick 1-Click Action */}
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                onClick={handleApplyPacing}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                title="Tự động căn chỉnh nhịp độ chuyển cảnh chuẩn 3.2s - 3.8s của kênh triệu view mà không làm mất bất kỳ ảnh nào"
              >
                <Zap className="w-4 h-4 text-yellow-200 fill-current" />
                <span>Tự Động Tinh Chỉnh Nhịp Timeline Chuẩn Triệu View</span>
              </button>

              {pacingAppliedToast && (
                <div className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã tối ưu nhịp độ thành công!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Famous Recap Channels Selection */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-white">Mô Phỏng & Học Hỏi Công Thức Từ Kênh Triệu View</span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800">
              Case Studies
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Chọn phong cách kênh để hệ thống đo lường và đưa ra thông số tối ưu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {benchmarkChannels.map((chan) => {
            const isSelected = selectedBenchmarkChannel === chan.id;
            return (
              <div
                key={chan.id}
                onClick={() => {
                  setSelectedBenchmarkChannel(chan.id);
                  runViralAnalysis();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-violet-950/40 border-violet-500/80 ring-1 ring-violet-500/40 shadow-md shadow-violet-500/10'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <img
                    src={chan.avatarUrl}
                    alt={chan.name}
                    className="w-9 h-9 rounded-lg object-cover border border-violet-500/40 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{chan.name}</h4>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                      <span className="text-amber-400 font-bold">{chan.subscriberCount}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{chan.avgPacingSec}s/cảnh</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">{chan.description}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                  <span className="text-slate-500 font-medium truncate max-w-[140px]">{chan.targetAudience}</span>
                  {isSelected ? (
                    <span className="text-violet-400 font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Đang chọn</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 hover:text-slate-300">Áp dụng</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Channel Specific Pro Tips */}
        {currentBenchmark && (
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex items-start space-x-2 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-200">
                Bí quyết thực chiến của kênh {currentBenchmark.name}:
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-slate-400 list-disc list-inside">
                {currentBenchmark.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 4 Multi-Dimensional Diagnostic Cards */}
      {viralReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Hook 3s */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <span>🎯</span>
                <span>Hook 3 Giây Mở Đầu</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  viralReport.hookAnalysis.score >= 80
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}
              >
                {viralReport.hookAnalysis.score}/100
              </span>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-3 bg-slate-950 p-2 rounded border border-slate-900 italic">
              "{viralReport.hookAnalysis.hookText}"
            </p>

            <div className="flex flex-wrap gap-1 text-[9px] font-mono">
              <span className={`px-1.5 py-0.2 rounded border ${viralReport.hookAnalysis.hasPowerKeyword ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                {viralReport.hookAnalysis.hasPowerKeyword ? '✓ Từ Khóa Sức Mạnh' : '✗ Thiếu Từ Khóa Sức Mạnh'}
              </span>
              <span className={`px-1.5 py-0.2 rounded border ${viralReport.hookAnalysis.hasCuriosityGap ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                {viralReport.hookAnalysis.hasCuriosityGap ? '✓ Gây Tò Mò' : '✗ Thiếu Yếu Tố Tò Mò'}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">{viralReport.hookAnalysis.recommendation}</p>
          </div>

          {/* Card 2: Pacing & Cut Rhythm */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <span>⏱️</span>
                <span>Nhịp Cắt Cảnh (Pacing)</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  viralReport.pacingAnalysis.score >= 80
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}
              >
                {viralReport.pacingAnalysis.score}/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded border border-slate-900">
                <span className="text-xs font-bold font-mono text-cyan-300">{viralReport.avgClipDurationSec}s</span>
                <span className="block text-[9px] text-slate-500 uppercase mt-0.5">Trung Bình/Cảnh</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-900">
                <span className="text-xs font-bold font-mono text-cyan-300">{viralReport.cutsPerMinute}</span>
                <span className="block text-[9px] text-slate-500 uppercase mt-0.5">Cắt / Phút</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">{viralReport.pacingAnalysis.recommendation}</p>

            <button
              onClick={handleApplyPacing}
              className="w-full text-center py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-cyan-200 text-[10px] font-bold transition-all cursor-pointer"
            >
              Căn Chỉnh {currentBenchmark.avgPacingSec}s/cảnh
            </button>
          </div>

          {/* Card 3: Visual Motion */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <span>🎬</span>
                <span>Chuyển Động Điện Ảnh</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border bg-emerald-950 text-emerald-300 border-emerald-800">
                {viralReport.visualAnalysis.score}/100
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Độ phong phú Ken Burns</span>
                <span className="font-mono text-violet-300 font-bold">{viralReport.visualAnalysis.motionVarietyScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${viralReport.visualAnalysis.motionVarietyScore}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">{viralReport.visualAnalysis.recommendation}</p>
          </div>

          {/* Card 4: Subtitle Retention */}
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <span>💬</span>
                <span>Phụ Đề Giữ Chân</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  viralReport.subtitleAnalysis.score >= 80
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}
              >
                {viralReport.subtitleAnalysis.score}/100
              </span>
            </div>

            <div className="bg-slate-950 p-2 rounded border border-slate-900 text-center">
              <span className="text-xs font-bold font-mono text-yellow-400">
                {viralReport.subtitleAnalysis.subtitlesCount} dòng phụ đề
              </span>
              <span className="block text-[9px] text-slate-500 uppercase mt-0.5">CapCut TikTok Yellow</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">{viralReport.subtitleAnalysis.recommendation}</p>
          </div>
        </div>
      )}

      {/* 5 High-Retention 3-Second Hooks */}
      {viralReport && (
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">5 Mẫu Hook 3 Giây Giữ Chân Khán Giả (Tự Động Sinh Cho Bộ Truyện)</span>
            </div>
            {hookAppliedToast && (
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Đã chèn Hook vào đầu kịch bản thành công!</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            {viralReport.suggestedHooks.map((h) => (
              <div
                key={h.id}
                className="bg-slate-950/90 p-3 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{h.title}</span>
                    <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                      {h.retentionRating}% Retention
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{h.text}"</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => copyText(h.text, h.id)}
                    className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedHookId === h.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHookId === h.id ? 'Đã Copy' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleApplyHook(h.text)}
                    className="flex items-center space-x-1 bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow transition-all active:scale-95 cursor-pointer"
                    title="Chèn ngay câu này vào phần mở đầu kịch bản"
                  >
                    <Zap className="w-3 h-3 text-yellow-300 fill-current" />
                    <span>Chèn Vào Kịch Bản</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Upload Viral Checklist (7 Golden Standards) */}
      {viralReport && (
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Checklist 7 Tiêu Chuẩn Vàng Của Video Triệu View Trước Khi Xuất Bản</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Đạt {viralReport.viralChecklist.filter((c) => c.passed).length}/7 tiêu chí
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {viralReport.viralChecklist.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-lg border flex items-start space-x-2.5 ${
                  item.passed
                    ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <h4 className={`text-xs font-bold ${item.passed ? 'text-white' : 'text-slate-300'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
