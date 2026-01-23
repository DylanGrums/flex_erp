import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemIndicatorDirective,
  FlexDropdownMenuItemRadioDirective,
  FlexDropdownMenuItemRadioGroupDirective,
  FlexDropdownMenuSeparatorDirective,
  FlexDropdownMenuTriggerDirective,
} from '../../primitives/dropdown-menu/dropdown-menu.directive';
import {
  FlexTooltipDirective,
  FlexTooltipTriggerDirective,
} from '../../primitives/tooltip/tooltip.directive';

import { injectDataTableContext } from '../data-table-context';
import { DataTableColumn, DataTableSortableColumnDefMeta } from '../types';
import { DataTableIconButtonComponent } from '../primitives/data-table-icon-button.component';
import { DataTableSkeletonComponent } from '../primitives/data-table-skeleton.component';

@Component({
  selector: 'flex-data-table-sorting-menu',
  standalone: true,
  imports: [
    CommonModule,
    DataTableIconButtonComponent,
    DataTableSkeletonComponent,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemRadioGroupDirective,
    FlexDropdownMenuItemRadioDirective,
    FlexDropdownMenuItemIndicatorDirective,
    FlexDropdownMenuSeparatorDirective,
    FlexTooltipTriggerDirective,
    FlexTooltipDirective,
  ],
  template: `
    @if (instance.showSkeleton) {
      <flex-data-table-skeleton className="size-7"></flex-data-table-skeleton>
    } @else {
      @if (tooltip) {
        <button
          flexDataTableIconButton
          size="small"
          [flexDropdownMenuTrigger]="menu"
          [flexTooltipTrigger]="tooltipTemplate"
        >
          <i class="pi pi-sort-alt text-sm"></i>
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
          <i class="pi pi-sort-alt text-sm"></i>
        </button>
      }

      <ng-template #menu>
        <div flexDropdownMenuContent class="min-w-[200px] rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow">
          <div flexDropdownMenuItemRadioGroup [value]="sortingKey" (valueChange)="setKey($event)">
            <button
              type="button"
              flexDropdownMenuItemRadio
              [value]="noneValue"
              class="flex w-full items-center rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
            >
              No sorting
              <span flexDropdownMenuItemIndicator class="ms-auto text-ui-fg-interactive">
                <i class="pi pi-check text-xs"></i>
              </span>
            </button>
            @for (column of sortableColumns; track column.id) {
              <button
                type="button"
                flexDropdownMenuItemRadio
                [value]="column.id"
                class="flex w-full items-center rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              >
                {{ getSortLabel(column) }}
                <span flexDropdownMenuItemIndicator class="ms-auto text-ui-fg-interactive">
                  <i class="pi pi-check text-xs"></i>
                </span>
              </button>
            }
          </div>

          @if (sorting) {
            <div flexDropdownMenuSeparator class="my-1 h-px bg-ui-border-base"></div>
            <div
              flexDropdownMenuItemRadioGroup
              [value]="sorting.desc ? 'true' : 'false'"
              (valueChange)="setDesc($event)"
            >
              <button
                type="button"
                flexDropdownMenuItemRadio
                value="false"
                class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              >
                <i class="pi pi-arrow-up text-xs text-ui-fg-subtle"></i>
                {{ getSortDescriptor('asc', selectedColumn) }}
              </button>
              <button
                type="button"
                flexDropdownMenuItemRadio
                value="true"
                class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              >
                <i class="pi pi-arrow-down text-xs text-ui-fg-subtle"></i>
                {{ getSortDescriptor('desc', selectedColumn) }}
              </button>
            </div>
          }
        </div>
      </ng-template>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableSortingMenuComponent {
  @Input() tooltip?: string;

  readonly context = injectDataTableContext();
  readonly noneValue = '__none__';

  get instance() {
    return this.context.instance;
  }

  get sortableColumns(): DataTableColumn<any, unknown>[] {
    return this.instance.getAllColumns().filter((column) => column.getCanSort());
  }

  get sorting(): { id: string; desc: boolean } | null {
    return this.instance.getSorting();
  }

  get sortingKey(): string {
    return this.sorting?.id ?? this.noneValue;
  }

  get selectedColumn(): DataTableColumn<any, unknown> | undefined {
    return this.sortableColumns.find((column) => column.id === this.sorting?.id);
  }

  setKey(id: string): void {
    if (id === this.noneValue) {
      this.instance.setSorting(() => null);
      return;
    }

    this.instance.setSorting((prev) => ({
      id,
      desc: prev?.desc ?? false,
    }));
  }

  setDesc(desc: string): void {
    const current = this.sorting?.id ?? this.sortableColumns[0]?.id;
    if (!current) {
      return;
    }

    this.instance.setSorting(() => ({
      id: current,
      desc: desc === 'true',
    }));
  }

  getSortLabel(column: DataTableColumn<any, unknown>): string {
    const meta = column.columnDef.meta as DataTableSortableColumnDefMeta | undefined;
    if (meta?.___sortMetaData?.sortLabel) {
      return meta.___sortMetaData.sortLabel;
    }

    if (typeof column.columnDef.header === 'string') {
      return column.columnDef.header;
    }

    return column.id;
  }

  getSortDescriptor(
    direction: 'asc' | 'desc',
    column?: DataTableColumn<any, unknown>
  ): string | null {
    if (!column) {
      return null;
    }

    const meta = column.columnDef.meta as DataTableSortableColumnDefMeta | undefined;
    if (direction === 'asc') {
      return meta?.___sortMetaData?.sortAscLabel ?? 'A-Z';
    }

    return meta?.___sortMetaData?.sortDescLabel ?? 'Z-A';
  }
}
