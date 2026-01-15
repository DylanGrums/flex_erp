import React, { createContext, useContext, ReactNode } from 'react';
import { useEditorState } from '@/hooks/useEditorState';

type EditorContextType = ReturnType<typeof useEditorState>;

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const editor = useEditorState();
  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
