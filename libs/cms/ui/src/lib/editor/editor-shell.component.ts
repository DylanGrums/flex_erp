import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Collection, DeviceType, NodeId, PageType, Section, SectionDefinition, Template } from '@flex-erp/types';
import { CmsTopBarComponent } from './top-bar.component';
import { CmsSectionsTreeComponent } from './sections-tree.component';
import { CmsPreviewCanvasComponent } from './preview-canvas.component';
import { CmsInspectorPanelComponent } from './inspector-panel.component';
import { CmsSectionLibraryModalComponent } from './section-library-modal.component';
import { CmsOnboardingScreenComponent } from './onboarding-screen.component';
import { CmsResizableGroupComponent } from '../primitives/resizable/cms-resizable-group.component';
import { CmsResizablePanelComponent } from '../primitives/resizable/cms-resizable-panel.component';
import { CmsResizableHandleComponent } from '../primitives/resizable/cms-resizable-handle.component';

@Component({
  selector: 'cms-editor-shell',
  standalone: true,
  imports: [
    CmsTopBarComponent,
    CmsSectionsTreeComponent,
    CmsPreviewCanvasComponent,
    CmsInspectorPanelComponent,
    CmsSectionLibraryModalComponent,
    CmsOnboardingScreenComponent,
    CmsResizableGroupComponent,
    CmsResizablePanelComponent,
    CmsResizableHandleComponent,
  ],
  templateUrl: './editor-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsEditorShellComponent {
  @Input() showOnboarding = false;
  @Input() templates: Template[] = [];
  @Input() storeName = '';
  @Input() currentPage: PageType = 'home';
  @Input() viewportMode: DeviceType = 'desktop';
  @Input() canUndo = false;
  @Input() canRedo = false;
  @Input() sections: Section[] = [];
  @Input() selectedNodeId: NodeId | null = null;
  @Input() selectedNodeKind: 'section' | 'block' | null = null;
  @Input() selectedSection: Section | null = null;
  @Input() sectionDefinitions: SectionDefinition[] = [];
  @Input() collections: Collection[] = [];
  @Input() isSectionLibraryOpen = false;

  @Output() selectTemplate = new EventEmitter<Template>();
  @Output() storeNameChange = new EventEmitter<string>();
  @Output() currentPageChange = new EventEmitter<PageType>();
  @Output() viewportModeChange = new EventEmitter<DeviceType>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() publish = new EventEmitter<void>();
  @Output() selectNode = new EventEmitter<NodeId>();
  @Output() toggleVisibility = new EventEmitter<NodeId>();
  @Output() duplicateNode = new EventEmitter<NodeId>();
  @Output() removeNode = new EventEmitter<NodeId>();
  @Output() reorderSections = new EventEmitter<{ startIndex: number; endIndex: number }>();
  @Output() openSectionLibrary = new EventEmitter<void>();
  @Output() closeSectionLibrary = new EventEmitter<void>();
  @Output() addSection = new EventEmitter<SectionDefinition>();
  @Output() updateSectionSettings = new EventEmitter<{ sectionId: string; key: string; value: unknown }>();
}
