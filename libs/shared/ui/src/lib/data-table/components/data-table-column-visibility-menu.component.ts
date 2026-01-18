import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuLabelDirective,
  FlexDropdownMenuSeparatorDirective,
  FlexDropdownMenuTriggerDirective,
} from '../../primitives/dropdown-menu/dropdown-menu.directive';
import {
  FlexTooltipDirective,
  FlexTooltipTriggerDirective,
} from '../../primitives/tooltip/tooltip.directive';

import { injectDataTableContext } from '../data-table-context';
import { DataTableColumn } from '../types';
import { DataTableCheckboxComponent } from '../primitives/data-table-checkbox.component';
import { DataTableIconButtonComponent } from '../primitives/data-table-icon-button.component';

@Component({
  selector: 'flex-data-table-column-visibility-menu',
  standalone: true,
  imports: [
    CommonModule,
    DataTableCheckboxComponent,
    DataTableIconButtonComponent,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
    FlexDropdownMenuSeparatorDirective,
    FlexDropdownMenuLabelDirective,
    FlexTooltipTriggerDirective,
    FlexTooltipDirective,
  ],
  template: `
    @if (enableColumnVisibility) {
      @if (tooltip) {
        <button
          flexDataTableIconButton
          size="small"
          [flexDropdownMenuTrigger]="menu"
          [flexTooltipTrigger]="tooltipTemplate"
        >
          <i class="pi pi-sliders-h text-sm"></i>
        </button>
        <ng-template #tooltipTemplate>
          <div
            flexTooltip
            class="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-xs shadow"
          >
            {{ tooltip }}
          </div>
        </ng-template>
      } @else {
        <button flexDataTableIconButton size="small" [flexDropdownMenuTrigger]="menu">
          <i class="pi pi-sliders-h text-sm"></i>
        </button>
      }

      <ng-template #menu>
        <div
          flexDropdownMenuContent
          class="min-w-[200px] max-h-[400px] overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow"
        >
          <div flexDropdownMenuLabel class="px-2 py-1 text-xs text-ui-fg-muted">
            Toggle columns
          </div>
          <div flexDropdownMenuSeparator class="my-1 h-px bg-ui-border-base"></div>
          <button
            type="button"
            flexDropdownMenuItem
            class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
            (click)="toggleAll()"
          >
            <flex-data-table-checkbox [checked]="toggleAllState"></flex-data-table-checkbox>
            <span>Toggle all</span>
          </button>
          <div flexDropdownMenuSeparator class="my-1 h-px bg-ui-border-base"></div>
          <div class="max-h-[250px] overflow-y-auto">
            @for (column of columns; track column.id) {
              <button
                type="button"
                flexDropdownMenuItem
                class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
                (click)="toggleColumn(column)"
              >
                <flex-data-table-checkbox [checked]="column.getIsVisible()"></flex-data-table-checkbox>
                <span class="truncate">{{ getColumnLabel(column) }}</span>
              </button>
            }
          </div>
        </div>
      </ng-template>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableColumnVisibilityMenuComponent {
  @Input() tooltip?: string;

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }

  get enableColumnVisibility(): boolean {
    return this.instance.enableColumnVisibility;
  }

  get columns(): DataTableColumn<any>[] {
    return this.instance.getAllColumns().filter((column) => column.getCanHide());
  }

  get allColumnsVisible(): boolean {
    return this.columns.every((column) => column.getIsVisible());
  }

  get someColumnsVisible(): boolean {
    return this.columns.some((column) => column.getIsVisible());
  }

  get toggleAllState(): boolean | 'indeterminate' {
    if (this.allColumnsVisible) {
      return true;
    }

    if (this.someColumnsVisible) {
      return 'indeterminate';
    }

    return false;
  }

  toggleAll(): void {
    const value = !this.allColumnsVisible;
    const next = Object.fromEntries(this.columns.map((column) => [column.id, value]));
    this.instance.setColumnVisibility(next);
  }

  toggleColumn(column: DataTableColumn<any>): void {
    column.toggleVisibility();
  }

  getColumnLabel(column: DataTableColumn<any>): string {
    const meta = column.columnDef.meta as { name?: string } | undefined;
    return meta?.name ?? column.id;
  }
}
