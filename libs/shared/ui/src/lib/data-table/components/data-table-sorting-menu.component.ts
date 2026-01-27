import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, LucideAngularModule } from 'lucide-angular';
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
    LucideAngularModule,
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
          [attr.aria-label]="tooltip || 'Sort'"
        >
          <i-lucide [img]="ArrowUpDown" class="h-4 w-4"></i-lucide>
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
        <button
          flexDataTableIconButton
          size="small"
          [flexDropdownMenuTrigger]="menu"
          [attr.aria-label]="tooltip || 'Sort'"
        >
          <i-lucide [img]="ArrowUpDown" class="h-4 w-4"></i-lucide>
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
                <i-lucide [img]="Check" class="h-3 w-3"></i-lucide>
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
                  <i-lucide [img]="Check" class="h-3 w-3"></i-lucide>
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
                <i-lucide [img]="ArrowUp" class="h-3 w-3 text-ui-fg-subtle"></i-lucide>
                {{ getSortDescriptor('asc', selectedColumn) }}
              </button>
              <button
                type="button"
                flexDropdownMenuItemRadio
                value="true"
                class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              >
                <i-lucide [img]="ArrowDown" class="h-3 w-3 text-ui-fg-subtle"></i-lucide>
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
  readonly ArrowUpDown = ArrowUpDown;
  readonly Check = Check;
  readonly ArrowUp = ArrowUp;
  readonly ArrowDown = ArrowDown;

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
