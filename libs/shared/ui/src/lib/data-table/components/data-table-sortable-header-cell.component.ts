import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'flex-data-table-sortable-header-cell',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <th
      cdkDrag
      [cdkDragData]="id"
      cdkDragLockAxis="x"
      (cdkDragStarted)="isDragging = true"
      (cdkDragEnded)="isDragging = false"
      [ngClass]="classes"
      [ngStyle]="computedStyle"
    >
      <ng-content></ng-content>
    </th>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
    :host {
      display: table-cell;
    }
      /* th.cdk-drag-preview {
        box-sizing: border-box;
        box-shadow: var(--shadow-elevation-8);
        border-radius: 4px;
      }

      th.cdk-drag-placeholder {
        opacity: 0;
      }

      th.cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      } */
    `,
  ],
})
export class DataTableSortableHeaderCellComponent {
  @Input({ required: true }) id!: string;
  @Input() className = '';
  @Input() style: Record<string, string | number> | null = null;
  @Input() isFirstColumn = false;

  isDragging = false;

  get classes(): string {
    return ['group/header-cell bg-ui-bg-base', this.className].filter(Boolean).join(' ');
  }

  get computedStyle(): Record<string, string | number> {
    return {
      ...(this.style ?? {}),
      opacity: this.isDragging ? 0.8 : 1,
      zIndex: this.isDragging ? 50 : this.isFirstColumn ? 1 : 0,
    };
  }
}

@Component({
  selector: 'flex-data-table-non-sortable-header-cell',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <th
      cdkDrag
      [cdkDragData]="id"
      cdkDragLockAxis="x"
      [cdkDragDisabled]="true"
      [ngClass]="className"
      [ngStyle]="style"
    >
      <ng-content></ng-content>
    </th>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
    :host {
      display: table-cell;
    }
    `,
  ],
})
export class DataTableNonSortableHeaderCellComponent {
  @Input({ required: true }) id!: string;
  @Input() className = '';
  @Input() style: Record<string, string | number> | null = null;
}
