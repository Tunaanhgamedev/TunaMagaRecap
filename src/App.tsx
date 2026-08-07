import React from 'react';
import { useStudioStore } from './store/useStudioStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { LibraryView } from './components/library/LibraryView';
import { OCRView } from './components/ocr/OCRView';
import { GridEditorView } from './components/grid/GridEditorView';
import { TranslationView } from './components/translation/TranslationView';
import { ScriptView } from './components/script/ScriptView';
import { VoiceView } from './components/voice/VoiceView';
import { SubtitleView } from './components/subtitle/SubtitleView';
import { TimelineView } from './components/timeline/TimelineView';
import { ThumbnailView } from './components/thumbnail/ThumbnailView';
import { SEOView } from './components/seo/SEOView';
import { WorkflowView } from './components/workflow/WorkflowView';
import { QueueView } from './components/queue/QueueView';
import { SettingsView } from './components/settings/SettingsView';

export function App() {
  const { activeTab } = useStudioStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'library':
        return <LibraryView />;
      case 'ocr':
        return <OCRView />;
      case 'grid_editor':
        return <GridEditorView />;
      case 'translation':
        return <TranslationView />;
      case 'script':
        return <ScriptView />;
      case 'voice':
        return <VoiceView />;
      case 'subtitle':
        return <SubtitleView />;
      case 'timeline':
        return <TimelineView />;
      case 'thumbnail':
        return <ThumbnailView />;
      case 'seo':
        return <SEOView />;
      case 'workflow':
        return <WorkflowView />;
      case 'queue':
        return <QueueView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-8">{renderActiveView()}</main>
      </div>
    </div>
  );
}

export default App;
