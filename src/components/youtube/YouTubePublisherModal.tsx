import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import {
  X,
  Youtube,
  Upload,
  Sparkles,
  Calendar,
  Eye,
  Lock,
  Globe,
  CheckCircle,
  ExternalLink,
  Tag,
  Clock,
} from 'lucide-react';

interface YouTubePublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YouTubePublisherModal: React.FC<YouTubePublisherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { seo, thumbnail, selectedProject } = useStudioStore();

  const [title, setTitle] = useState(seo?.title || `${selectedProject?.seriesName || 'Truyện Tranh'} - Chapter ${selectedProject?.chapterNumber || 1} Recap`);
  const [description, setDescription] = useState(
    seo?.description ||
      `🔥 Đón xem toàn bộ diễn biến cực cháy của Chapter ${selectedProject?.chapterNumber || 1} bộ truyện ${selectedProject?.seriesName || ''}!\n\n🔔 Hãy ĐĂNG KÝ KÊNH để không bỏ lỡ các tập tiếp theo nhé!`
  );
  const [tags, setTags] = useState(seo?.tags?.join(', ') || 'recap truyện, review truyện tranh, manhwa recap, anime recap');
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'unlisted' | 'private' | 'scheduled'>('public');
  const [scheduledDate, setScheduledDate] = useState('2026-08-30T19:00');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    videoUrl?: string;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishResult(null);

    try {
      const res = await fetch('/api/youtube/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          privacyStatus,
          scheduledTime: privacyStatus === 'scheduled' ? scheduledDate : null,
          seriesName: selectedProject?.seriesName || '',
          chapterNumber: selectedProject?.chapterNumber || 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishResult({
          success: true,
          videoUrl: data.data?.videoUrl,
          message: data.message,
        });
      } else {
        setPublishResult({
          success: false,
          message: data.error || 'Xuất bản thất bại',
        });
      }
    } catch (e: any) {
      setPublishResult({
        success: false,
        message: e.message,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Xuất Bản & Hẹn Giờ Video Trực Tiếp Lên YouTube</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
                  YouTube Data API v3
                </span>
              </h2>
              <p className="text-[10.5px] text-slate-400">
                Tự động đồng bộ Video Recap, Thumbnail 4K và Tiêu đề/Thẻ Tags SEO lên kênh của bạn.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {publishResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                publishResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
              }`}
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold">{publishResult.message}</p>
                {publishResult.videoUrl && (
                  <a
                    href={publishResult.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-cyan-300 hover:underline font-mono bg-slate-950/80 px-2.5 py-1 rounded border border-cyan-800/80"
                  >
                    <span>Xem video trên YouTube: {publishResult.videoUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-200 flex items-center justify-between">
              <span>Tiêu Đề Video (AI SEO Optimized):</span>
              <span className="text-[10px] font-mono text-slate-400">{title.length}/100</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-red-500 outline-none"
              placeholder="Nhập tiêu đề video..."
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-200">Mô Tả Video (Description):</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-[11px]"
              placeholder="Nhập mô tả video và liên kết..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-bold text-slate-200 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-red-400" />
              <span>Thẻ Tags (phân cách bằng dấu phẩy):</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-red-500 outline-none font-mono text-[11px]"
            />
          </div>

          {/* Privacy & Publishing Schedule Mode */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200">Chế Độ Xuất Bản:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'public', label: 'Công Khai', icon: Globe, desc: 'Public ngay' },
                { id: 'unlisted', label: 'Không Công Khai', icon: Eye, desc: 'Chỉ ai có link' },
                { id: 'private', label: 'Riêng Tư', icon: Lock, desc: 'Chỉ mình bạn' },
                { id: 'scheduled', label: 'Hẹn Giờ', icon: Calendar, desc: 'Công chiếu sau' },
              ].map((m) => {
                const Icon = m.icon;
                const isSel = privacyStatus === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPrivacyStatus(m.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? 'bg-red-950/60 border-red-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSel ? 'text-red-400' : 'text-slate-500'}`} />
                    <div className="font-bold text-xs">{m.label}</div>
                    <div className="text-[9.5px] text-slate-400">{m.desc}</div>
                  </button>
                );
              })}
            </div>

            {privacyStatus === 'scheduled' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-red-900/60 flex items-center space-x-3">
                <Clock className="w-4 h-4 text-red-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 block font-bold">Thời gian công chiếu:</span>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs outline-none mt-0.5"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-semibold cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Upload className={`w-4 h-4 ${isPublishing ? 'animate-bounce' : ''}`} />
            <span>{isPublishing ? 'Đang Tải Lên YouTube...' : '🚀 Xuất Bản Ngay Lên Kênh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
