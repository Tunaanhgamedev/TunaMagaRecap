import React, { Suspense } from 'react';
import { useStudioStore } from './store/useStudioStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Lazy-load all tab views — each tab only loads its JS when the user navigates to it
const DashboardView = React.lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const LibraryView = React.lazy(() => import('./components/library/LibraryView').then(m => ({ default: m.LibraryView })));
const OCRView = React.lazy(() => import('./components/ocr/OCRView').then(m => ({ default: m.OCRView })));
const GridEditorView = React.lazy(() => import('./components/grid/GridEditorView').then(m => ({ default: m.GridEditorView })));
const TranslationView = React.lazy(() => import('./components/translation/TranslationView').then(m => ({ default: m.TranslationView })));
const ScriptView = React.lazy(() => import('./components/script/ScriptView').then(m => ({ default: m.ScriptView })));
const VoiceView = React.lazy(() => import('./components/voice/VoiceView').then(m => ({ default: m.VoiceView })));
const SubtitleView = React.lazy(() => import('./components/subtitle/SubtitleView').then(m => ({ default: m.SubtitleView })));
const TimelineView = React.lazy(() => import('./components/timeline/TimelineView').then(m => ({ default: m.TimelineView })));
const ViralLabView = React.lazy(() => import('./components/viral/ViralLabView').then(m => ({ default: m.ViralLabView })));
const ThumbnailView = React.lazy(() => import('./components/thumbnail/ThumbnailView').then(m => ({ default: m.ThumbnailView })));
const SEOView = React.lazy(() => import('./components/seo/SEOView').then(m => ({ default: m.SEOView })));
const WorkflowView = React.lazy(() => import('./components/workflow/WorkflowView').then(m => ({ default: m.WorkflowView })));
const QueueView = React.lazy(() => import('./components/queue/QueueView').then(m => ({ default: m.QueueView })));
const SyncCenterView = React.lazy(() => import('./components/sync/SyncCenterView').then(m => ({ default: m.SyncCenterView })));
const SettingsView = React.lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })));

const TabSpinner = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-medium">Đang tải module...</span>
    </div>
  </div>
);

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
      case 'viral_lab':
        return <ViralLabView />;
      case 'thumbnail':
        return <ThumbnailView />;
      case 'seo':
        return <SEOView />;
      case 'workflow':
        return <WorkflowView />;
      case 'queue':
        return <QueueView />;
      case 'sync_center':
        return <SyncCenterView />;
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
        <main className="flex-1 overflow-y-auto pb-8">
          <Suspense fallback={<TabSpinner />}>
            {renderActiveView()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;

