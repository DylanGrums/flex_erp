import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { CmsEditorStateModel, CmsNodePatch } from './cms-editor.models';
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
import {
  Block,
  CmsTreeNode,
  NodeId,
  Section,
  SectionDefinition,
  Template,
} from '@flex-erp/types';
import { classicStorefrontTemplate } from './mock-data';

const DEFAULT_STATE: CmsEditorStateModel = {
  storeName: 'My Store',
  currentPage: 'home',
  viewportMode: 'desktop',
  sections: classicStorefrontTemplate.sections,
  selectedNodeId: null,
  selectedNodeKind: null,
  isDirty: false,
  history: {
    past: [],
    future: [],
  },
  ui: {
    isSectionLibraryOpen: false,
    isOnboardingDone: false,
    inspectorTab: 'content',
  },
};

function withHistory(state: CmsEditorStateModel, sections: Section[]): CmsEditorStateModel {
  return {
    ...state,
    sections,
    isDirty: true,
    history: {
      past: [...state.history.past.slice(-20), state.sections],
      future: [],
    },
  };
}

function findSectionIndex(sections: Section[], sectionId: NodeId): number {
  return sections.findIndex((section) => section.id === sectionId);
}

function findBlockLocation(sections: Section[], blockId: NodeId): { sectionIndex: number; blockIndex: number } | null {
  const sectionIndex = sections.findIndex((section) => section.blocks.some((block) => block.id === blockId));
  if (sectionIndex === -1) return null;
  const blockIndex = sections[sectionIndex].blocks.findIndex((block) => block.id === blockId);
  if (blockIndex === -1) return null;
  return { sectionIndex, blockIndex };
}

function determineNodeKind(sections: Section[], nodeId: NodeId | null): 'section' | 'block' | null {
  if (!nodeId) return null;
  if (sections.some((section) => section.id === nodeId)) return 'section';
  return sections.some((section) => section.blocks.some((block) => block.id === nodeId)) ? 'block' : null;
}

function applyNodePatch(node: Section | Block, patch: CmsNodePatch): Section | Block {
  const nextSettings = patch.settings ? { ...node.settings, ...patch.settings } : node.settings;
  return {
    ...node,
    ...patch,
    settings: nextSettings,
  };
}

function createSectionFromDefinition(def: SectionDefinition): Section {
  return {
    id: `${def.type}-${Date.now()}`,
    type: def.type,
    name: def.name,
    icon: def.icon,
    visible: true,
    settings: { ...def.defaultSettings },
    blocks: [],
  };
}

function cloneSections(sections: Section[]): Section[] {
  return sections.map((section) => ({
    ...section,
    settings: { ...section.settings },
    blocks: section.blocks.map((block) => ({ ...block, settings: { ...block.settings } })),
  }));
}

@State<CmsEditorStateModel>({
  name: 'cmsEditor',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class CmsEditorState {
  @Selector()
  static storeName(state: CmsEditorStateModel) {
    return state.storeName;
  }

  @Selector()
  static currentPage(state: CmsEditorStateModel) {
    return state.currentPage;
  }

  @Selector()
  static viewportMode(state: CmsEditorStateModel) {
    return state.viewportMode;
  }

  @Selector()
  static sections(state: CmsEditorStateModel) {
    return state.sections;
  }

  @Selector()
  static selectedNodeId(state: CmsEditorStateModel) {
    return state.selectedNodeId;
  }

  @Selector()
  static selectedNodeKind(state: CmsEditorStateModel) {
    return state.selectedNodeKind;
  }

  @Selector()
  static selectedNode(state: CmsEditorStateModel) {
    const { selectedNodeId, selectedNodeKind, sections } = state;
    if (!selectedNodeId || !selectedNodeKind) return null;
    if (selectedNodeKind === 'section') {
      return sections.find((section) => section.id === selectedNodeId) ?? null;
    }
    const location = findBlockLocation(sections, selectedNodeId);
    if (!location) return null;
    return sections[location.sectionIndex].blocks[location.blockIndex] ?? null;
  }

  @Selector()
  static selectedSection(state: CmsEditorStateModel) {
    if (!state.selectedNodeId) return null;
    if (state.selectedNodeKind === 'section') {
      return state.sections.find((section) => section.id === state.selectedNodeId) ?? null;
    }
    const location = findBlockLocation(state.sections, state.selectedNodeId);
    if (!location) return null;
    return state.sections[location.sectionIndex] ?? null;
  }

  @Selector()
  static sectionsTree(state: CmsEditorStateModel): CmsTreeNode[] {
    return state.sections.map((section) => ({
      id: section.id,
      kind: 'section',
      name: section.name,
      type: section.type,
      icon: section.icon,
      visible: section.visible,
      children: section.blocks.map((block) => ({
        id: block.id,
        kind: 'block',
        name: block.name,
        type: block.type,
      })),
    }));
  }

  @Selector()
  static breadcrumbs(state: CmsEditorStateModel) {
    if (!state.selectedNodeId) return [];
    if (state.selectedNodeKind === 'section') {
      const section = state.sections.find((s) => s.id === state.selectedNodeId);
      return section ? [section] : [];
    }
    const location = findBlockLocation(state.sections, state.selectedNodeId);
    if (!location) return [];
    const section = state.sections[location.sectionIndex];
    const block = section.blocks[location.blockIndex];
    return [section, block];
  }

  @Selector()
  static isSectionLibraryOpen(state: CmsEditorStateModel) {
    return state.ui.isSectionLibraryOpen;
  }

  @Selector()
  static isOnboardingDone(state: CmsEditorStateModel) {
    return state.ui.isOnboardingDone;
  }

  @Selector()
  static inspectorTab(state: CmsEditorStateModel) {
    return state.ui.inspectorTab;
  }

  @Selector()
  static canUndo(state: CmsEditorStateModel) {
    return state.history.past.length > 0;
  }

  @Selector()
  static canRedo(state: CmsEditorStateModel) {
    return state.history.future.length > 0;
  }

  @Selector()
  static isDirty(state: CmsEditorStateModel) {
    return state.isDirty;
  }

  @Action(InitFromMock)
  initFromMock(ctx: StateContext<CmsEditorStateModel>, action: InitFromMock) {
    const template: Template | undefined = action.template ?? classicStorefrontTemplate;
    ctx.setState({
      ...DEFAULT_STATE,
      sections: cloneSections(template.sections),
      ui: {
        ...DEFAULT_STATE.ui,
        isOnboardingDone: true,
      },
    });
  }

  @Action(SelectNode)
  selectNode(ctx: StateContext<CmsEditorStateModel>, action: SelectNode) {
    const state = ctx.getState();
    const selectedNodeKind = determineNodeKind(state.sections, action.nodeId);
    ctx.patchState({ selectedNodeId: action.nodeId, selectedNodeKind });
  }

  @Action(AddSection)
  addSection(ctx: StateContext<CmsEditorStateModel>, action: AddSection) {
    const state = ctx.getState();
    const nextSection = createSectionFromDefinition(action.sectionTemplate);
    const nextSections = [...state.sections];
    const insertIndex = typeof action.index === 'number' ? action.index : nextSections.length;
    nextSections.splice(insertIndex, 0, nextSection);
    ctx.setState({
      ...withHistory(state, nextSections),
      selectedNodeId: nextSection.id,
      selectedNodeKind: 'section',
    });
  }

  @Action(RemoveNode)
  removeNode(ctx: StateContext<CmsEditorStateModel>, action: RemoveNode) {
    const state = ctx.getState();
    const sections = cloneSections(state.sections);
    const sectionIndex = findSectionIndex(sections, action.nodeId);
    if (sectionIndex >= 0) {
      sections.splice(sectionIndex, 1);
    } else {
      const location = findBlockLocation(sections, action.nodeId);
      if (!location) return;
      sections[location.sectionIndex].blocks.splice(location.blockIndex, 1);
    }

    const isSelected = state.selectedNodeId === action.nodeId;
    ctx.setState({
      ...withHistory(state, sections),
      selectedNodeId: isSelected ? null : state.selectedNodeId,
      selectedNodeKind: isSelected ? null : state.selectedNodeKind,
    });
  }

  @Action(UpdateNodeProps)
  updateNodeProps(ctx: StateContext<CmsEditorStateModel>, action: UpdateNodeProps) {
    const state = ctx.getState();
    const sections = cloneSections(state.sections);
    const sectionIndex = findSectionIndex(sections, action.nodeId);
    if (sectionIndex >= 0) {
      sections[sectionIndex] = applyNodePatch(sections[sectionIndex], action.patch) as Section;
      ctx.setState(withHistory(state, sections));
      return;
    }

    const location = findBlockLocation(sections, action.nodeId);
    if (!location) return;
    const section = sections[location.sectionIndex];
    section.blocks[location.blockIndex] = applyNodePatch(section.blocks[location.blockIndex], action.patch) as Block;
    ctx.setState(withHistory(state, sections));
  }

  @Action(MoveNode)
  moveNode(ctx: StateContext<CmsEditorStateModel>, action: MoveNode) {
    const state = ctx.getState();
    const sections = cloneSections(state.sections);
    const sectionIndex = findSectionIndex(sections, action.nodeId);
    if (sectionIndex >= 0) {
      const [removed] = sections.splice(sectionIndex, 1);
      const nextIndex = Math.max(0, Math.min(action.index, sections.length));
      sections.splice(nextIndex, 0, removed);
      ctx.setState(withHistory(state, sections));
      return;
    }

    const location = findBlockLocation(sections, action.nodeId);
    if (!location) return;
    const [removed] = sections[location.sectionIndex].blocks.splice(location.blockIndex, 1);
    const targetSectionIndex =
      action.targetParentId ? findSectionIndex(sections, action.targetParentId) : location.sectionIndex;
    if (targetSectionIndex === -1) return;
    const targetBlocks = sections[targetSectionIndex].blocks;
    const nextIndex = Math.max(0, Math.min(action.index, targetBlocks.length));
    targetBlocks.splice(nextIndex, 0, removed);
    ctx.setState(withHistory(state, sections));
  }

  @Action(SetViewportMode)
  setViewportMode(ctx: StateContext<CmsEditorStateModel>, action: SetViewportMode) {
    ctx.patchState({ viewportMode: action.mode });
  }

  @Action(ToggleInspectorTab)
  toggleInspectorTab(ctx: StateContext<CmsEditorStateModel>, action: ToggleInspectorTab) {
    ctx.patchState({ ui: { ...ctx.getState().ui, inspectorTab: action.tab } });
  }

  @Action(OpenSectionLibrary)
  openSectionLibrary(ctx: StateContext<CmsEditorStateModel>) {
    ctx.patchState({ ui: { ...ctx.getState().ui, isSectionLibraryOpen: true } });
  }

  @Action(CloseSectionLibrary)
  closeSectionLibrary(ctx: StateContext<CmsEditorStateModel>) {
    ctx.patchState({ ui: { ...ctx.getState().ui, isSectionLibraryOpen: false } });
  }

  @Action(PublishDraft)
  publishDraft(ctx: StateContext<CmsEditorStateModel>) {
    ctx.patchState({ isDirty: false });
  }

  @Action(SaveDraft)
  saveDraft(ctx: StateContext<CmsEditorStateModel>) {
    ctx.patchState({ isDirty: false });
  }

  @Action(SetStoreName)
  setStoreName(ctx: StateContext<CmsEditorStateModel>, action: SetStoreName) {
    ctx.patchState({ storeName: action.name, isDirty: true });
  }

  @Action(SetCurrentPage)
  setCurrentPage(ctx: StateContext<CmsEditorStateModel>, action: SetCurrentPage) {
    ctx.patchState({ currentPage: action.page });
  }

  @Action(Undo)
  undo(ctx: StateContext<CmsEditorStateModel>) {
    const state = ctx.getState();
    if (state.history.past.length === 0) return;
    const past = [...state.history.past];
    const previous = past.pop();
    if (!previous) return;
    ctx.setState({
      ...state,
      sections: previous,
      history: {
        past,
        future: [state.sections, ...state.history.future],
      },
    });
  }

  @Action(Redo)
  redo(ctx: StateContext<CmsEditorStateModel>) {
    const state = ctx.getState();
    if (state.history.future.length === 0) return;
    const future = [...state.history.future];
    const next = future.shift();
    if (!next) return;
    ctx.setState({
      ...state,
      sections: next,
      history: {
        past: [...state.history.past, state.sections],
        future,
      },
    });
  }

  @Action(DuplicateNode)
  duplicateNode(ctx: StateContext<CmsEditorStateModel>, action: DuplicateNode) {
    const state = ctx.getState();
    const sections = cloneSections(state.sections);
    const sectionIndex = findSectionIndex(sections, action.nodeId);
    if (sectionIndex >= 0) {
      const section = sections[sectionIndex];
      const newSection: Section = {
        ...section,
        id: `${section.type}-${Date.now()}`,
        name: `${section.name} (Copy)`,
        blocks: section.blocks.map((block) => ({
          ...block,
          id: `${block.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          settings: { ...block.settings },
        })),
      };
      sections.splice(sectionIndex + 1, 0, newSection);
      ctx.setState({
        ...withHistory(state, sections),
        selectedNodeId: newSection.id,
        selectedNodeKind: 'section',
      });
      return;
    }

    const location = findBlockLocation(sections, action.nodeId);
    if (!location) return;
    const section = sections[location.sectionIndex];
    const block = section.blocks[location.blockIndex];
    const newBlock: Block = {
      ...block,
      id: `${block.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${block.name} (Copy)`,
      settings: { ...block.settings },
    };
    section.blocks.splice(location.blockIndex + 1, 0, newBlock);
    ctx.setState({
      ...withHistory(state, sections),
      selectedNodeId: newBlock.id,
      selectedNodeKind: 'block',
    });
  }
}
