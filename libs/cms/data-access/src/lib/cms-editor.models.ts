import { DeviceType, EditorHistory, NodeId, PageType, Section } from '@flex-erp/types';

export type InspectorTab = 'content' | 'layout' | 'style';

export interface CmsEditorUiState {
  isSectionLibraryOpen: boolean;
  isOnboardingDone: boolean;
  inspectorTab: InspectorTab;
}

export interface CmsEditorStateModel {
  storeName: string;
  currentPage: PageType;
  viewportMode: DeviceType;
  sections: Section[];
  selectedNodeId: NodeId | null;
  selectedNodeKind: 'section' | 'block' | null;
  isDirty: boolean;
  history: EditorHistory;
  ui: CmsEditorUiState;
}

export type CmsNodePatch = {
  name?: string;
  icon?: string;
  visible?: boolean;
  settings?: Record<string, unknown>;
};
