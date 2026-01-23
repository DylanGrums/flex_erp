import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FlexDropdownMenuContentDirective,
  FlexDropdownMenuItemDirective,
  FlexDropdownMenuTriggerDirective,
} from '../../primitives/dropdown-menu/dropdown-menu.directive';
import {
  FlexTooltipDirective,
  FlexTooltipTriggerDirective,
} from '../../primitives/tooltip/tooltip.directive';

import { injectDataTableContext } from '../data-table-context';
import { DataTableFilter } from '../types';
import { DataTableIconButtonComponent } from '../primitives/data-table-icon-button.component';
import { DataTableSkeletonComponent } from '../primitives/data-table-skeleton.component';

@Component({
  selector: 'flex-data-table-filter-menu',
  standalone: true,
  imports: [
    CommonModule,
    DataTableIconButtonComponent,
    DataTableSkeletonComponent,
    FlexDropdownMenuTriggerDirective,
    FlexDropdownMenuContentDirective,
    FlexDropdownMenuItemDirective,
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
          [disabled]="filterOptions.length === 0"
          [flexDropdownMenuTrigger]="menu"
          [flexTooltipTrigger]="tooltipTemplate"
        >
          <i class="pi pi-filter text-sm"></i>
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
          [disabled]="filterOptions.length === 0"
          [flexDropdownMenuTrigger]="menu"
        >
          <i class="pi pi-filter text-sm"></i>
        </button>
      }

      <ng-template #menu>
        <div
          flexDropdownMenuContent
          class="rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow"
        >
          @for (filter of filterOptions; track filter.id) {
            <button
              type="button"
              flexDropdownMenuItem
              class="flex w-full items-center rounded px-2 py-1.5 text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover"
              (click)="addFilter($event, filter)"
            >
              {{ filter.label }}
            </button>
          }
        </div>
      </ng-template>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterMenuComponent {
  @Input() tooltip?: string;
  @Input() onAddFilter?: (id: string, value: unknown) => void;
  @Input() activeFilterIds: string[] = [];

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }

  get enabledFilters(): string[] {
    return Object.keys(this.instance.getFiltering() ?? {});
  }

  get filterOptions(): DataTableFilter[] {
    const active = new Set([
      ...this.enabledFilters,
      ...(this.activeFilterIds ?? []),
    ]);
    return this.instance.getFilters().filter((filter) => !active.has(filter.id));
  }

  addFilter(event: MouseEvent, filter: DataTableFilter): void {
    event.stopPropagation();

    const value = this.getDefaultValue(filter);
    if (this.onAddFilter) {
      this.onAddFilter(filter.id, value);
      return;
    }

    this.instance.addFilter({ id: filter.id, value });
  }

  private getDefaultValue(filter: DataTableFilter): unknown {
    switch (filter.type) {
      case 'select':
        return undefined;
      case 'multiselect':
        return [];
      case 'string':
        return '';
      case 'number':
      case 'date':
      case 'radio':
      case 'custom':
      default:
        return null;
    }
  }
}
