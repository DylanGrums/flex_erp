import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { DeviceType, NodeId, PageType, SectionDefinition, Template } from '@flex-erp/cms/types';
import {
  AddSection,
  CloseSectionLibrary,
  DuplicateNode,
  InitFromMock,
  MoveNode,
  OpenSectionLibrary,
  PublishDraft,
  Redo,
  RemoveNode,
  SaveDraft,
  SelectNode,
  SetCurrentPage,
  SetStoreName,
  SetViewportMode,
  ToggleInspectorTab,
  Undo,
  UpdateNodeProps,
} from './cms-editor.actions';
import { CmsEditorState } from './cms-editor.state';
import { CmsNodePatch, InspectorTab } from './cms-editor.models';

@Injectable({ providedIn: 'root' })
export class CmsEditorFacade {
  private store = inject(Store);

  readonly storeName$ = this.store.select(CmsEditorState.storeName);
  readonly currentPage$ = this.store.select(CmsEditorState.currentPage);
  readonly viewportMode$ = this.store.select(CmsEditorState.viewportMode);
  readonly sections$ = this.store.select(CmsEditorState.sections);
  readonly selectedNodeId$ = this.store.select(CmsEditorState.selectedNodeId);
  readonly selectedNodeKind$ = this.store.select(CmsEditorState.selectedNodeKind);
  readonly selectedNode$ = this.store.select(CmsEditorState.selectedNode);
  readonly selectedSection$ = this.store.select(CmsEditorState.selectedSection);
  readonly sectionsTree$ = this.store.select(CmsEditorState.sectionsTree);
  readonly breadcrumbs$ = this.store.select(CmsEditorState.breadcrumbs);
  readonly isSectionLibraryOpen$ = this.store.select(CmsEditorState.isSectionLibraryOpen);
  readonly isOnboardingDone$ = this.store.select(CmsEditorState.isOnboardingDone);
  readonly inspectorTab$ = this.store.select(CmsEditorState.inspectorTab);
  readonly canUndo$ = this.store.select(CmsEditorState.canUndo);
  readonly canRedo$ = this.store.select(CmsEditorState.canRedo);
  readonly isDirty$ = this.store.select(CmsEditorState.isDirty);

  readonly storeName = toSignal(this.storeName$, { initialValue: 'My Store' });
  readonly currentPage = toSignal(this.currentPage$, { initialValue: 'home' as PageType });
  readonly viewportMode = toSignal(this.viewportMode$, { initialValue: 'desktop' as DeviceType });
  readonly sections = toSignal(this.sections$, { initialValue: [] });
  readonly selectedNodeId = toSignal(this.selectedNodeId$, { initialValue: null });
  readonly selectedNodeKind = toSignal(this.selectedNodeKind$, { initialValue: null });
  readonly selectedNode = toSignal(this.selectedNode$, { initialValue: null });
  readonly selectedSection = toSignal(this.selectedSection$, { initialValue: null });
  readonly sectionsTree = toSignal(this.sectionsTree$, { initialValue: [] });
  readonly breadcrumbs = toSignal(this.breadcrumbs$, { initialValue: [] });
  readonly isSectionLibraryOpen = toSignal(this.isSectionLibraryOpen$, { initialValue: false });
  readonly isOnboardingDone = toSignal(this.isOnboardingDone$, { initialValue: false });
  readonly inspectorTab = toSignal(this.inspectorTab$, { initialValue: 'content' as InspectorTab });
  readonly canUndo = toSignal(this.canUndo$, { initialValue: false });
  readonly canRedo = toSignal(this.canRedo$, { initialValue: false });
  readonly isDirty = toSignal(this.isDirty$, { initialValue: false });

  initFromMock(template?: Template) {
    return this.store.dispatch(new InitFromMock(template));
  }

  selectNode(nodeId: NodeId | null) {
    return this.store.dispatch(new SelectNode(nodeId));
  }

  addSection(template: SectionDefinition, parentId?: NodeId, index?: number) {
    return this.store.dispatch(new AddSection(template, parentId, index));
  }

  removeNode(nodeId: NodeId) {
    return this.store.dispatch(new RemoveNode(nodeId));
  }

  updateNodeProps(nodeId: NodeId, patch: CmsNodePatch) {
    return this.store.dispatch(new UpdateNodeProps(nodeId, patch));
  }

  moveNode(nodeId: NodeId, targetParentId: NodeId | null, index: number) {
    return this.store.dispatch(new MoveNode(nodeId, targetParentId, index));
  }

  setViewportMode(mode: DeviceType) {
    return this.store.dispatch(new SetViewportMode(mode));
  }

  toggleInspectorTab(tab: InspectorTab) {
    return this.store.dispatch(new ToggleInspectorTab(tab));
  }

  openSectionLibrary() {
    return this.store.dispatch(new OpenSectionLibrary());
  }

  closeSectionLibrary() {
    return this.store.dispatch(new CloseSectionLibrary());
  }

  publishDraft() {
    return this.store.dispatch(new PublishDraft());
  }

  saveDraft() {
    return this.store.dispatch(new SaveDraft());
  }

  setStoreName(name: string) {
    return this.store.dispatch(new SetStoreName(name));
  }

  setCurrentPage(page: PageType) {
    return this.store.dispatch(new SetCurrentPage(page));
  }

  undo() {
    return this.store.dispatch(new Undo());
  }

  redo() {
    return this.store.dispatch(new Redo());
  }

  duplicateNode(nodeId: NodeId) {
    return this.store.dispatch(new DuplicateNode(nodeId));
  }
}
