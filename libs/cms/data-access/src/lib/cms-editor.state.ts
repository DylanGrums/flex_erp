import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, forkJoin, map, of, switchMap, tap, Observable } from 'rxjs';
import { CmsEditorStateModel, CmsNodePatch } from './cms-editor.models';
import {
  AddSection,
  CloseSectionLibrary,
  DuplicateNode,
  LoadEditor,
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
  PageType,
  Section,
  SectionDefinition,
  Template,
} from '@flex-erp/cms/types';
import { classicStorefrontTemplate } from './mock-data';
import { CmsApi } from './cms.api';
import { CmsPage, CmsPageContent, CmsPageVersion, CmsSite } from './cms-api.models';

const DEFAULT_STATE: CmsEditorStateModel = {
  storeName: 'My Store',
  currentPage: 'home',
  viewportMode: 'desktop',
  sections: [],
  collections: [],
  site: null,
  page: null,
  selectedNodeId: null,
  selectedNodeKind: null,
  isDirty: false,
  loading: false,
  error: null,
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
  private api = inject(CmsApi);

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
  static collections(state: CmsEditorStateModel) {
    return state.collections;
  }

  @Selector()
  static site(state: CmsEditorStateModel) {
    return state.site;
  }

  @Selector()
  static page(state: CmsEditorStateModel) {
    return state.page;
  }

  @Selector()
  static loading(state: CmsEditorStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: CmsEditorStateModel) {
    return state.error;
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

  @Action(LoadEditor)
  loadEditor(ctx: StateContext<CmsEditorStateModel>) {
    ctx.patchState({ loading: true, error: null });
    const state = ctx.getState();
    return this.ensureSite(state.storeName).pipe(
      switchMap((site) =>
        forkJoin({
          site: of(site),
          collections: this.api
            .listCollections()
            .pipe(
              map((items) => (Array.isArray(items) ? items : [])),
              catchError(() => of([])),
            ),
        }),
      ),
      switchMap(({ site, collections }) =>
        this.fetchPageData(site, state.currentPage).pipe(
          tap(({ page, sections, hasContent }) => {
            const nextState = ctx.getState();
            ctx.setState({
              ...nextState,
              storeName: site.name,
              site,
              page,
              collections,
              sections: cloneSections(sections),
              selectedNodeId: null,
              selectedNodeKind: null,
              isDirty: false,
              loading: false,
              error: null,
              history: { past: [], future: [] },
              ui: { ...nextState.ui, isOnboardingDone: hasContent },
            });
          }),
        ),
      ),
      catchError((err) => {
        ctx.patchState({
          loading: false,
          error: this.errorMessage(err, 'Failed to load CMS'),
        });
        return of(null);
      }),
    );
  }

  @Action(InitFromMock)
  initFromMock(ctx: StateContext<CmsEditorStateModel>, action: InitFromMock) {
    const template: Template | undefined = action.template ?? classicStorefrontTemplate;
    const state = ctx.getState();
    ctx.setState({
      ...state,
      sections: cloneSections(template ? template.sections : []),
      selectedNodeId: null,
      selectedNodeKind: null,
      isDirty: true,
      history: { past: [], future: [] },
      ui: {
        ...state.ui,
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
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });
    const content = this.buildPageContent(state.sections);
    return this.ensurePageReady(state).pipe(
      switchMap(({ site, page }) =>
        this.api
          .createPageVersion(page.id, {
            content,
            contentSchemaVersion: 1,
          })
          .pipe(
            switchMap((version) =>
              this.api.publishPage(page.id, { versionId: version?.id ?? null }),
            ),
            map((updatedPage) => ({
              site,
              page: updatedPage ?? page,
            })),
          ),
      ),
      tap(({ site, page }) => {
        const nextState = ctx.getState();
        ctx.patchState({
          site,
          page,
          storeName: site.name,
          isDirty: false,
          loading: false,
          error: null,
          ui: { ...nextState.ui, isOnboardingDone: true },
        });
      }),
      catchError((err) => {
        ctx.patchState({
          loading: false,
          error: this.errorMessage(err, 'Failed to publish draft'),
        });
        return of(null);
      }),
    );
  }

  @Action(SaveDraft)
  saveDraft(ctx: StateContext<CmsEditorStateModel>) {
    const state = ctx.getState();
    ctx.patchState({ loading: true, error: null });
    const content = this.buildPageContent(state.sections);
    return this.ensurePageReady(state).pipe(
      switchMap(({ site, page }) =>
        this.api
          .createPageVersion(page.id, {
            content,
            contentSchemaVersion: 1,
          })
          .pipe(
            map(() => ({ site, page })),
          ),
      ),
      tap(({ site, page }) => {
        const nextState = ctx.getState();
        ctx.patchState({
          site,
          page,
          storeName: site.name,
          isDirty: false,
          loading: false,
          error: null,
          ui: { ...nextState.ui, isOnboardingDone: true },
        });
      }),
      catchError((err) => {
        ctx.patchState({
          loading: false,
          error: this.errorMessage(err, 'Failed to save draft'),
        });
        return of(null);
      }),
    );
  }

  @Action(SetStoreName)
  setStoreName(ctx: StateContext<CmsEditorStateModel>, action: SetStoreName) {
    const name = action.name.trim();
    if (!name) return;
    const state = ctx.getState();
    const prevName = state.storeName;
    ctx.patchState({ storeName: name });
    if (!state.site) return;
    ctx.patchState({ loading: true, error: null });
    return this.api.updateSite(state.site.id, { name }).pipe(
      tap((site) => {
        if (!site) {
          ctx.patchState({
            storeName: prevName,
            loading: false,
            error: 'Site not found',
          });
          return;
        }
        ctx.patchState({
          site,
          storeName: site.name,
          loading: false,
          error: null,
        });
      }),
      catchError((err) => {
        ctx.patchState({
          storeName: prevName,
          loading: false,
          error: this.errorMessage(err, 'Failed to update site'),
        });
        return of(null);
      }),
    );
  }

  @Action(SetCurrentPage)
  setCurrentPage(ctx: StateContext<CmsEditorStateModel>, action: SetCurrentPage) {
    const state = ctx.getState();
    ctx.patchState({ currentPage: action.page });
    if (!state.site) return;
    ctx.patchState({ loading: true, error: null });
    return this.fetchPageData(state.site, action.page).pipe(
      tap(({ page, sections, hasContent }) => {
        const nextState = ctx.getState();
        ctx.setState({
          ...nextState,
          page,
          sections: cloneSections(sections),
          selectedNodeId: null,
          selectedNodeKind: null,
          isDirty: false,
          loading: false,
          error: null,
          history: { past: [], future: [] },
          ui: { ...nextState.ui, isOnboardingDone: hasContent },
        });
      }),
      catchError((err) => {
        ctx.patchState({
          loading: false,
          error: this.errorMessage(err, 'Failed to load page'),
        });
        return of(null);
      }),
    );
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

  private ensureSite(name: string): Observable<CmsSite> {
    const safeName = name?.trim() || 'My Store';
    return this.api.getCurrentSite().pipe(
      switchMap((site) => {
        if (site) return of(site);
        return this.api.createSite({ name: safeName }).pipe(
          map((created) => {
            if (!created) {
              throw new Error('Site not created');
            }
            return created;
          }),
        );
      }),
    );
  }

  private ensurePage(siteId: string, pageType: PageType): Observable<CmsPage> {
    const slug = pageType;
    const title = this.pageTitle(pageType);
    return this.api.getPageBySlug(siteId, slug).pipe(
      switchMap((page) => {
        if (page) return of(page);
        return this.api
          .createPage({
            siteId,
            slug,
            title,
            status: 'DRAFT',
          })
          .pipe(
            map((created) => {
              if (!created) {
                throw new Error('Page not created');
              }
              return created;
            }),
          );
      }),
    );
  }

  private ensurePageReady(state: CmsEditorStateModel): Observable<{ site: CmsSite; page: CmsPage }> {
    const existingSite = state.site;
    const site$ = existingSite ? of(existingSite) : this.ensureSite(state.storeName);
    return site$.pipe(
      switchMap((site) =>
        this.ensurePage(site.id, state.currentPage).pipe(
          map((page) => ({ site, page })),
        ),
      ),
    );
  }

  private fetchPageData(site: CmsSite, pageType: PageType): Observable<{
    page: CmsPage;
    sections: Section[];
    hasContent: boolean;
  }> {
    return this.ensurePage(site.id, pageType).pipe(
      switchMap((page) =>
        this.api.listPageVersions(page.id).pipe(
          map((versions) => {
            const list = Array.isArray(versions) ? versions : [];
            const latest = list.length > 0 ? list[0] : null;
            const sections = latest ? this.extractSections(latest) : [];
            return { page, sections, hasContent: !!latest };
          }),
        ),
      ),
    );
  }

  private buildPageContent(sections: Section[]): CmsPageContent {
    return { sections: cloneSections(sections) };
  }

  private extractSections(version: CmsPageVersion): Section[] {
    const content = version?.content as any;
    if (Array.isArray(content)) return content as Section[];
    if (content && typeof content === 'object' && Array.isArray(content.sections)) {
      return content.sections as Section[];
    }
    return [];
  }

  private pageTitle(pageType: PageType): string {
    return pageType.charAt(0).toUpperCase() + pageType.slice(1);
  }

  private errorMessage(err: any, fallback: string): string {
    if (err?.status === 401) {
      return 'Select a store to save or publish changes.';
    }
    const msg = err?.error?.message ?? err?.message ?? fallback;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
}
