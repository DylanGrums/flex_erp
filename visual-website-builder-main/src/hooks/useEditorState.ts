import { useState, useCallback, useMemo } from 'react';
import { EditorState, Section, DeviceType, PageType } from '@/types/editor';
import { classicStorefrontTemplate } from '@/data/mockData';

const initialState: EditorState = {
  storeName: 'My Store',
  currentPage: 'home',
  device: 'desktop',
  sections: classicStorefrontTemplate.sections,
  selectedSectionId: null,
  selectedBlockId: null,
  isDirty: false,
  history: {
    past: [],
    future: [],
  },
};

export function useEditorState() {
  const [state, setState] = useState<EditorState>(initialState);

  const pushHistory = useCallback((sections: Section[]) => {
    setState((prev) => ({
      ...prev,
      history: {
        past: [...prev.history.past.slice(-20), prev.sections],
        future: [],
      },
      sections,
      isDirty: true,
    }));
  }, []);

  const setStoreName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, storeName: name, isDirty: true }));
  }, []);

  const setCurrentPage = useCallback((page: PageType) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setDevice = useCallback((device: DeviceType) => {
    setState((prev) => ({ ...prev, device }));
  }, []);

  const selectSection = useCallback((sectionId: string | null, blockId: string | null = null) => {
    setState((prev) => ({
      ...prev,
      selectedSectionId: sectionId,
      selectedBlockId: blockId,
    }));
  }, []);

  const updateSectionSettings = useCallback((sectionId: string, settings: Record<string, unknown>) => {
    setState((prev) => {
      const newSections = prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, settings: { ...section.settings, ...settings } }
          : section
      );
      return {
        ...prev,
        sections: newSections,
        isDirty: true,
        history: {
          past: [...prev.history.past.slice(-20), prev.sections],
          future: [],
        },
      };
    });
  }, []);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setState((prev) => {
      const newSections = prev.sections.map((section) =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section
      );
      return { ...prev, sections: newSections, isDirty: true };
    });
  }, []);

  const duplicateSection = useCallback((sectionId: string) => {
    setState((prev) => {
      const index = prev.sections.findIndex((s) => s.id === sectionId);
      if (index === -1) return prev;
      
      const section = prev.sections[index];
      const newSection: Section = {
        ...section,
        id: `${section.type}-${Date.now()}`,
        name: `${section.name} (Copy)`,
        blocks: section.blocks.map((b) => ({ ...b, id: `${b.type}-${Date.now()}-${Math.random()}` })),
      };
      
      const newSections = [
        ...prev.sections.slice(0, index + 1),
        newSection,
        ...prev.sections.slice(index + 1),
      ];
      
      return {
        ...prev,
        sections: newSections,
        isDirty: true,
        history: {
          past: [...prev.history.past.slice(-20), prev.sections],
          future: [],
        },
      };
    });
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setState((prev) => {
      const newSections = prev.sections.filter((s) => s.id !== sectionId);
      return {
        ...prev,
        sections: newSections,
        selectedSectionId: prev.selectedSectionId === sectionId ? null : prev.selectedSectionId,
        isDirty: true,
        history: {
          past: [...prev.history.past.slice(-20), prev.sections],
          future: [],
        },
      };
    });
  }, []);

  const addSection = useCallback((section: Section) => {
    setState((prev) => {
      const newSections = [...prev.sections, section];
      return {
        ...prev,
        sections: newSections,
        selectedSectionId: section.id,
        isDirty: true,
        history: {
          past: [...prev.history.past.slice(-20), prev.sections],
          future: [],
        },
      };
    });
  }, []);

  const reorderSections = useCallback((startIndex: number, endIndex: number) => {
    setState((prev) => {
      const newSections = [...prev.sections];
      const [removed] = newSections.splice(startIndex, 1);
      newSections.splice(endIndex, 0, removed);
      
      return {
        ...prev,
        sections: newSections,
        isDirty: true,
        history: {
          past: [...prev.history.past.slice(-20), prev.sections],
          future: [],
        },
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.history.past.length === 0) return prev;
      
      const newPast = [...prev.history.past];
      const previous = newPast.pop()!;
      
      return {
        ...prev,
        sections: previous,
        history: {
          past: newPast,
          future: [prev.sections, ...prev.history.future],
        },
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.history.future.length === 0) return prev;
      
      const newFuture = [...prev.history.future];
      const next = newFuture.shift()!;
      
      return {
        ...prev,
        sections: next,
        history: {
          past: [...prev.history.past, prev.sections],
          future: newFuture,
        },
      };
    });
  }, []);

  const save = useCallback(() => {
    setState((prev) => ({ ...prev, isDirty: false }));
    // Mock save - in real app would call API
    console.log('Saved!');
  }, []);

  const publish = useCallback(() => {
    setState((prev) => ({ ...prev, isDirty: false }));
    // Mock publish - in real app would call API
    console.log('Published!');
  }, []);

  const loadTemplate = useCallback((sections: Section[]) => {
    setState((prev) => ({
      ...prev,
      sections,
      selectedSectionId: null,
      selectedBlockId: null,
      isDirty: false,
      history: { past: [], future: [] },
    }));
  }, []);

  const selectedSection = useMemo(() => {
    return state.sections.find((s) => s.id === state.selectedSectionId) || null;
  }, [state.sections, state.selectedSectionId]);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  return {
    state,
    selectedSection,
    canUndo,
    canRedo,
    setStoreName,
    setCurrentPage,
    setDevice,
    selectSection,
    updateSectionSettings,
    toggleSectionVisibility,
    duplicateSection,
    deleteSection,
    addSection,
    reorderSections,
    undo,
    redo,
    save,
    publish,
    loadTemplate,
  };
}
