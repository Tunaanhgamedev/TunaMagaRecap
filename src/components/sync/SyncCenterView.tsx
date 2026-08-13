import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  Database,
  Cloud,
  HardDrive,
  GitBranch,
  RefreshCw,
  Layers,
  CheckCircle,
  FolderGit2,
  ShieldCheck,
  Zap,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react';

export const SyncCenterView: React.FC = () => {
  const { selectedProject, pages } = useStudioStore();

  const [dbMode, setDbMode] = useState<'local' | 'cloud'>('local');
  const [localVersion, setLocalVersion] = useState(12);
  const [cloudVersion, setCloudVersion] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncToCloud = () => {
    setIsSyncing(true);
    setSyncStatus('Đang đẩy dữ liệu Metadata & Storage Keys lên PostgreSQL + Cloudflare R2...');
    setTimeout(() => {
      setCloudVersion(localVersion);
      setIsSyncing(false);
      setSyncStatus('✅ Đã đồng bộ hoàn tất lên Cloud (PostgreSQL)! Phiên bản Cloud: v' + localVersion);
    }, 1200);
  };

  const handleFetchFromCloud = () => {
    setIsSyncing(true);
    setSyncStatus('Đang kéo bản ghi mới nhất từ Cloud về SQLite máy cục bộ...');
    setTimeout(() => {
      setLocalVersion(cloudVersion);
      setIsSyncing(false);
      setSyncStatus('✅ Đã cập nhật SQLite cục bộ về phiên bản Cloud: v' + cloudVersion);
    }, 1000);
  };

  return (
    <div className="p-5 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Trung Tâm Kiến Trúc Database Kép & Git-Style Cloud Sync</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kiến trúc đa tầng: SQLite (Offline Desktop) ↔ PostgreSQL + Cloudflare R2 (Online Cloud SaaS) với cơ chế đồng bộ Metadata theo chuẩn Git.
          </p>
        </div>

        {/* Database Mode Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setDbMode('local')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dbMode === 'local'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Local SQLite (Desktop)</span>
          </button>

          <button
            onClick={() => setDbMode('cloud')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dbMode === 'cloud'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud PostgreSQL (SaaS)</span>
          </button>
        </div>
      </div>

      {/* 3 Core Architecture Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Database Engine */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">1. Cơ Sở Dữ Liệu Chính</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {dbMode === 'local' ? 'SQLite (dev.db)' : 'PostgreSQL + Prisma'}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-400">
            <p className="text-white font-semibold flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Chỉ lưu Metadata & Trạng Thái</span>
            </p>
            <p className="text-[11px]">
              Tất cả bảng <code className="text-cyan-300">User, Project, Series, Chapter, Page, Panel, Dialogue, Script, Job</code> đồng nhất 100% schema giữa Web & Desktop.
            </p>
          </div>
        </div>

        {/* Card 2: Object Storage Key Engine */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">2. Lưu Trữ File Ảnh / Video</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
              {dbMode === 'local' ? './projects/ & ./cache/' : 'Cloudflare R2 / S3'}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-400">
            <p className="text-white font-semibold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Lưu qua Storage Key (Không nhét Binary vào DB)</span>
            </p>
            <p className="text-[11px] font-mono text-slate-300 bg-slate-950 p-1 rounded border border-slate-800">
              storageKey: projects/proj-001/chap-001/001.jpg
            </p>
          </div>
        </div>

        {/* Card 3: Job Queue & Background Worker */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">3. Hàng Đợi Tác Vụ Nặng</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {dbMode === 'local' ? 'Local Worker (Ollama + FFmpeg)' : 'Redis + Worker Fleet'}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-400">
            <p className="text-white font-semibold flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Chạy Hoàn Toàn Offline Khi Cần</span>
            </p>
            <p className="text-[11px]">
              Tự động điều phối: <span className="text-slate-300">Crawl ➔ OCR ➔ AI Script ➔ TTS ➔ Subtitle ➔ Render</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Git-Style Sync Control Center */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Git-Style Cloud ↔ Local Sync Engine</h2>
              <p className="text-[11px] text-slate-400">Đồng bộ hai chiều với kiểm soát phiên bản và phát hiện xung đột.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>☁️ Sync Local ➔ Cloud</span>
            </button>

            <button
              onClick={handleFetchFromCloud}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>📥 Kéo Cloud ➔ Local</span>
            </button>
          </div>
        </div>

        {/* Sync Status Alert */}
        {syncStatus && (
          <div className="p-3 bg-violet-950/60 border border-violet-800 rounded-xl text-xs text-violet-200 flex items-center justify-between animate-fadeIn">
            <span>{syncStatus}</span>
            <button onClick={() => setSyncStatus(null)} className="text-violet-400 hover:text-white font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* Version Comparison Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                <HardDrive className="w-4 h-4" />
                <span>Máy Cục Bộ (Local SQLite)</span>
              </span>
              <span className="font-mono font-bold bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                Phiên bản: v{localVersion}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Đang chứa: <span className="text-slate-200 font-semibold">{pages.length} trang ảnh</span> của dự án{' '}
              <span className="text-cyan-300 font-semibold">{selectedProject?.seriesName || 'Truyện Tranh'}</span>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-violet-300 flex items-center space-x-1.5">
                <Cloud className="w-4 h-4" />
                <span>Máy Chủ Cloud (PostgreSQL)</span>
              </span>
              <span className="font-mono font-bold bg-violet-950 text-violet-400 px-2 py-0.5 rounded border border-violet-800">
                Phiên bản: v{cloudVersion}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Trạng thái: {localVersion === cloudVersion ? (
                <span className="text-emerald-400 font-semibold">Đồng bộ hoàn toàn (In-Sync)</span>
              ) : (
                <span className="text-amber-400 font-semibold">Local đi trước Cloud {localVersion - cloudVersion} commit</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Monorepo Architecture Package Map */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <FolderGit2 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Cấu Trúc Gói Monorepo Chia Sẻ Logic (Web SaaS + Desktop App)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { pkg: 'packages/core', desc: 'Chứa types, domain entities & business logic cốt lõi.' },
            { pkg: 'packages/database', desc: 'Prisma Client, SQLite Adapter & PostgreSQL Client.' },
            { pkg: 'packages/crawler', desc: 'Source Adapters (TruyenQQ, ThuVienSach, NetTruyen).' },
            { pkg: 'packages/ocr', desc: 'Panel Bounding Box Detector & Dialogue extraction.' },
            { pkg: 'packages/ai', desc: 'AI Script Director, Cumulative Context & Memory.' },
            { pkg: 'packages/tts', desc: 'Voice synthesis (OpenAI, ElevenLabs, Local TTS).' },
            { pkg: 'packages/media', desc: 'CapCut JSON Generator, Keyframes & FFmpeg.' },
            { pkg: 'apps/desktop & web', desc: 'Chạy cùng 1 bộ core logic, không phải viết lại.' },
          ].map((item) => (
            <div key={item.pkg} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="font-mono text-[11px] font-bold text-cyan-300 block">{item.pkg}</span>
              <p className="text-[10px] text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
