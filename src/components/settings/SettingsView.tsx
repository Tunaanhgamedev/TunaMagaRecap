import React from 'react';
import { useStudioStore } from '../../store/useStudioStore';
import { Settings, Key, CheckCircle, ShieldAlert, Cpu, Database, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { apiKeys, updateApiKey } = useStudioStore();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-violet-400" />
            <span>Plugin System & AI API Provider Keys</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý chìa khóa API & kết nối đa mô hình AI (Gemini 1.5, Claude 3.5, GPT-4o, DeepSeek R1, ElevenLabs).
          </p>
        </div>
      </div>

      {/* AI Plugin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'gemini', title: 'Google Gemini AI', desc: 'Sử dụng Gemini 1.5 Pro cho AI Script Director & OCR vision analysis', color: 'text-cyan-400' },
          { id: 'claude', title: 'Anthropic Claude AI', desc: 'Sử dụng Claude 3.5 Sonnet cho văn phong kể chuyện drama sâu sắc', color: 'text-orange-400' },
          { id: 'openai', title: 'OpenAI GPT & Voice', desc: 'Sử dụng GPT-4o & OpenAI TTS Nova cho giọng lồng tiếng cảm xúc', color: 'text-emerald-400' },
          { id: 'deepseek', title: 'DeepSeek R1 Reasoning', desc: 'Sử dụng DeepSeek R1 để phân tích chiều sâu cốt truyện manga phức tạp', color: 'text-blue-400' },
        ].map((plugin) => {
          const config = apiKeys[plugin.id];

          return (
            <div key={plugin.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className={`w-5 h-5 ${plugin.color}`} />
                  <h3 className="text-sm font-bold text-white">{plugin.title}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>CONNECTED</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-snug">{plugin.desc}</p>

              <div>
                <label className="block text-[11px] text-slate-400 font-mono mb-1">API Key Config:</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={config?.apiKey || ''}
                    onChange={(e) => updateApiKey(plugin.id, e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
