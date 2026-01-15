import { useState } from 'react';
import { EditorProvider } from '@/contexts/EditorContext';
import { TopBar } from './TopBar';
import { SectionsTree } from './SectionsTree';
import { PreviewCanvas } from './PreviewCanvas';
import { InspectorPanel } from './InspectorPanel';
import { SectionLibraryModal } from './SectionLibraryModal';
import { OnboardingScreen } from './OnboardingScreen';
import { useEditorState } from '@/hooks/useEditorState';
import { Section, Template } from '@/types/editor';

function EditorContent() {
  const [showLibrary, setShowLibrary] = useState(false);
  const editor = useEditorState();

  const handleAddSection = (section: Section) => {
    editor.addSection(section);
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <SectionsTree onAddSection={() => setShowLibrary(true)} />
          <PreviewCanvas />
          <InspectorPanel />
        </div>
      </div>

      <SectionLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onAdd={handleAddSection}
      />
    </>
  );
}

export function EditorShell() {
  const [hasStarted, setHasStarted] = useState(false);
  const [initialTemplate, setInitialTemplate] = useState<Template | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setInitialTemplate(template);
    setHasStarted(true);
  };

  if (!hasStarted) {
    return <OnboardingScreen onSelectTemplate={handleSelectTemplate} />;
  }

  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  );
}
