import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NodeId, Section } from '@flex-erp/cms/types';
import { CmsButtonComponent } from '../primitives/button/cms-button.component';
import { CmsScrollAreaComponent } from '../primitives/scroll-area/cms-scroll-area.component';
import { CmsDialogComponent } from '../primitives/dialog/cms-dialog.component';
import { TranslocoModule } from '@jsverse/transloco';

import {
  LucideAngularModule,
  GripVertical,
  ChevronRight,
  LayoutTemplate,
  LucideIconData,
  Columns2,
  Grid3x3,
  Mail,
  PanelBottom,
  Megaphone,
  CreditCard,
  Quote,
  FolderKanban,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
} from 'lucide-angular';

@Component({
  selector: 'cms-sections-tree',
  standalone: true,
  imports: [CmsButtonComponent, CmsScrollAreaComponent, CmsDialogComponent, LucideAngularModule, TranslocoModule],
  templateUrl: './sections-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
        :host {
          @apply h-full;
        }
      `,
  ],
})
export class CmsSectionsTreeComponent {
  @Input() sections: Section[] = [];
  @Input() selectedNodeId: NodeId | null = null;
  @Input() selectedNodeKind: 'section' | 'block' | null = null;

  @Output() openSectionLibrary = new EventEmitter<void>();
  @Output() selectNode = new EventEmitter<NodeId>();
  @Output() toggleVisibility = new EventEmitter<NodeId>();
  @Output() duplicateNode = new EventEmitter<NodeId>();
  @Output() removeNode = new EventEmitter<NodeId>();
  @Output() reorderSections = new EventEmitter<{ startIndex: number; endIndex: number }>();

  dragOverIndex: number | null = null;
  draggedIndex: number | null = null;
  expandedSections = new Set<string>();
  pendingDelete: Section | null = null;

  GripVertical = GripVertical;
  ChevronRight = ChevronRight;
  LayoutTemplate = LayoutTemplate;
  Eye = Eye;
  EyeOff = EyeOff;
  Copy = Copy;
  Trash2 = Trash2;
  Plus = Plus;




  iconClass(icon: string): LucideIconData {
    const map: Record<string, LucideIconData> = {
      'layout-template': LayoutTemplate,
      image: ImageIcon,
      columns: Columns2,
      'grid-3x3': Grid3x3,
      mail: Mail,
      'panel-bottom': PanelBottom,
      megaphone: Megaphone,
      'credit-card': CreditCard,
      quote: Quote,
      'folder-kanban': FolderKanban,
    };
    return map[icon] || LayoutTemplate;
  }

  isSectionSelected(section: Section): boolean {
    return this.selectedNodeKind === 'section' && this.selectedNodeId === section.id;
  }

  isBlockSelected(sectionId: string, blockId: string): boolean {
    return this.selectedNodeKind === 'block' && this.selectedNodeId === blockId;
  }

  toggleExpanded(sectionId: string): void {
    if (this.expandedSections.has(sectionId)) {
      this.expandedSections.delete(sectionId);
      return;
    }
    this.expandedSections.add(sectionId);
  }

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(index: number): void {
    if (this.draggedIndex !== null && this.draggedIndex !== index) {
      this.dragOverIndex = index;
    }
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer?.getData('text/plain'));
    if (!Number.isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      this.reorderSections.emit({ startIndex: sourceIndex, endIndex: targetIndex });
    }
    this.dragOverIndex = null;
    this.draggedIndex = null;
  }

  onDragEnd(): void {
    this.dragOverIndex = null;
    this.draggedIndex = null;
  }

  confirmDelete(section: Section): void {
    this.pendingDelete = section;
  }

  cancelDelete(): void {
    this.pendingDelete = null;
  }

  deleteSection(): void {
    if (this.pendingDelete) {
      this.removeNode.emit(this.pendingDelete.id);
    }
    this.pendingDelete = null;
  }
}
