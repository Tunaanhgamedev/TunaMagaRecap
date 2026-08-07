import React, { useState } from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Table, Sparkles, Download, Layers, Wand2, RefreshCw, Check } from 'lucide-react';
import { AnimationEffectType } from '../../types/studio';

export const GridEditorView: React.FC = () => {
  const { pages, updateDialogueText, setActiveTab } = useStudioStore();
  const [selectedLanguage, setSelectedLanguage] = useState('vi');

  // Flatten all panels & dialogues into a spreadsheet rows format
  const rows = pages.flatMap((page) =>
    page.panels.flatMap((panel) =>
      panel.dialogues.map((d) => ({
        id: d.id,
        pageIndex: page.pageIndex,
        panelIndex: panel.panelIndex,
        speaker: d.speaker,
        text: d.text,
        translatedText: d.translatedText || d.text,
        cameraEffect: panel.suggestedCameraEffect || 'zoom_in',
        emotion: d.emotion,
      }))
    )
  );

  const handleApplyBatchKeyframes = (effect: AnimationEffectType) => {
    useStudioStore.setState((s) => ({
      pages: s.pages.map((p) => ({
        ...p,
        panels: p.panels.map((panel) => ({
          ...panel,
          suggestedCameraEffect: effect,
        })),
      })),
    }));
  };

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <span>Excel-Style Grid Editor (MagaRecap Feature)</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Chỉnh sửa văn bản thoại & lời kể ở dạng ô/dòng giống Excel, hỗ trợ áp dụng Hoạt Ảnh Keyframe hàng loạt.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Batch Keyframe Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-slate-400 font-semibold">Gán Keyframe Hàng Loạt:</span>
            <select
              onChange={(e) => handleApplyBatchKeyframes(e.target.value as AnimationEffectType)}
              className="bg-slate-950 text-white font-bold text-[11px] border border-slate-800 rounded px-2 py-0.5 focus:outline-none"
            >
              <option value="dramatic_zoom">Zoom In Kịch Tính</option>
              <option value="zoom_out">Zoom Out Thu Nhỏ</option>
              <option value="pan_right">Pan Quét Sang Phải</option>
              <option value="pan_left">Pan Quét Sang Trái</option>
              <option value="shake">Rung Lắc (Shake)</option>
              <option value="flash">Chớp Sáng (Flash)</option>
            </select>
          </div>

          <button
            onClick={() => setActiveTab('timeline')}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            Xuất Sang Timeline / CapCut
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3 overflow-x-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span className="font-bold text-white">MagaRecap Row Inspector ({rows.length} Rows)</span>
          <span className="font-mono text-cyan-400">Cell & Row Live Editing</span>
        </div>

        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
              <th className="p-2 border-r border-slate-800 w-12 text-center">STT</th>
              <th className="p-2 border-r border-slate-800 w-24">Vị Trí</th>
              <th className="p-2 border-r border-slate-800 w-32">Nhân Vật</th>
              <th className="p-2 border-r border-slate-800">Văn Bản Thô (OCR Text)</th>
              <th className="p-2 border-r border-slate-800 w-44">Hoạt Ảnh Keyframe</th>
              <th className="p-2 w-28 text-center">Cảm Xúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-slate-900/60 transition-colors">
                <td className="p-2 border-r border-slate-800 text-center font-bold text-cyan-400">
                  {idx + 1}
                </td>
                <td className="p-2 border-r border-slate-800 text-slate-300">
                  P.{row.pageIndex} / Panel #{row.panelIndex}
                </td>
                <td className="p-2 border-r border-slate-800 font-bold text-violet-300">
                  {row.speaker}
                </td>
                <td className="p-2 border-r border-slate-800">
                  <input
                    type="text"
                    value={row.text}
                    onChange={(e) =>
                      updateDialogueText(
                        row.pageIndex - 1,
                        `panel-${row.pageIndex}-1`,
                        row.id,
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-950 text-slate-100 px-2 py-1 rounded border border-slate-800 text-[11px] focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </td>
                <td className="p-2 border-r border-slate-800">
                  <span className="text-[10px] bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-slate-800">
                    {row.cameraEffect}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">
                    {row.emotion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
