import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CmsEditorFacade, mockCollections, sectionDefinitions, templates } from '@flex-erp/cms/data-access';
import { Collection, DeviceType, PageType, SectionDefinition, Template } from '@flex-erp/cms/types';
import { CmsEditorShellComponent } from '@flex-erp/cms/ui';

@Component({
  selector: 'cms-editor-page',
  standalone: true,
  imports: [CmsEditorShellComponent],
  templateUrl: './cms-editor-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full min-h-0',
  },
})
export class CmsEditorPageComponent {
  private facade = inject(CmsEditorFacade);

  readonly sectionDefinitions = sectionDefinitions;
  readonly collections: Collection[] = mockCollections;
  readonly templates: Template[] = templates;

  readonly showOnboarding = computed(() => !this.facade.isOnboardingDone());

  storeName = this.facade.storeName;
  currentPage = this.facade.currentPage;
  viewportMode = this.facade.viewportMode;
  sections = this.facade.sections;
  selectedNodeId = this.facade.selectedNodeId;
  selectedNodeKind = this.facade.selectedNodeKind;
  selectedSection = this.facade.selectedSection;
  canUndo = this.facade.canUndo;
  canRedo = this.facade.canRedo;
  isSectionLibraryOpen = this.facade.isSectionLibraryOpen;

  selectTemplate(template: Template): void {
    this.facade.initFromMock(template);
  }

  openSectionLibrary(): void {
    this.facade.openSectionLibrary();
  }

  closeSectionLibrary(): void {
    this.facade.closeSectionLibrary();
  }

  addSection(definition: SectionDefinition): void {
    this.facade.addSection(definition);
  }

  selectNode(nodeId: string): void {
    this.facade.selectNode(nodeId);
  }

  updateSectionSettings(event: { sectionId: string; key: string; value: unknown }): void {
    this.facade.updateNodeProps(event.sectionId, { settings: { [event.key]: event.value } });
  }

  toggleVisibility(sectionId: string): void {
    const section = this.sections().find((item) => item.id === sectionId);
    if (!section) return;
    this.facade.updateNodeProps(sectionId, { visible: !section.visible });
  }

  duplicateNode(nodeId: string): void {
    this.facade.duplicateNode(nodeId);
  }

  removeNode(nodeId: string): void {
    this.facade.removeNode(nodeId);
  }

  reorderSections(event: { startIndex: number; endIndex: number }): void {
    const sections = this.sections();
    const section = sections[event.startIndex];
    if (!section) return;
    this.facade.moveNode(section.id, null, event.endIndex);
  }

  setStoreName(name: string): void {
    this.facade.setStoreName(name);
  }

  setCurrentPage(page: PageType): void {
    this.facade.setCurrentPage(page);
  }

  setViewportMode(mode: DeviceType): void {
    this.facade.setViewportMode(mode);
  }

  undo(): void {
    this.facade.undo();
  }

  redo(): void {
    this.facade.redo();
  }

  save(): void {
    this.facade.saveDraft();
  }

  publish(): void {
    this.facade.publishDraft();
  }
}
