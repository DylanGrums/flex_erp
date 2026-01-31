import { DeviceType, EditorHistory, NodeId, PageType, Section, Collection } from '@flex-erp/cms/types';
import { CmsPage, CmsSite } from './cms-api.models';

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
  collections: Collection[];
  site: CmsSite | null;
  page: CmsPage | null;
  selectedNodeId: NodeId | null;
  selectedNodeKind: 'section' | 'block' | null;
  isDirty: boolean;
  loading: boolean;
  error: string | null;
  history: EditorHistory;
  ui: CmsEditorUiState;
}

export type CmsNodePatch = {
  name?: string;
  icon?: string;
  visible?: boolean;
  settings?: Record<string, unknown>;
};
