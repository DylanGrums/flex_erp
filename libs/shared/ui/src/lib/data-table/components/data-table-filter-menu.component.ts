import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  RdxDropdownMenuContentDirective,
  RdxDropdownMenuItemDirective,
  RdxDropdownMenuTriggerDirective,
} from '@radix-ng/primitives/dropdown-menu';
import {
  RdxTooltipContentAttributesComponent,
  RdxTooltipContentDirective,
  RdxTooltipRootDirective,
  RdxTooltipTriggerDirective,
} from '@radix-ng/primitives/tooltip';

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
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective,
    RdxTooltipRootDirective,
    RdxTooltipTriggerDirective,
    RdxTooltipContentDirective,
    RdxTooltipContentAttributesComponent,
  ],
  template: `
    @if (instance.showSkeleton) {
      <flex-data-table-skeleton className="size-7"></flex-data-table-skeleton>
    } @else {
      @if (tooltip) {
        <ng-container rdxTooltipRoot>
          <button
            flexDataTableIconButton
            size="small"
            [disabled]="filterOptions.length === 0"
            [rdxDropdownMenuTrigger]="menu"
            rdxTooltipTrigger
          >
            <i class="pi pi-filter text-sm"></i>
          </button>
          <ng-template rdxTooltipContent>
            <div
              rdxTooltipContentAttributes
              class="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-xs shadow"
            >
              {{ tooltip }}
            </div>
          </ng-template>
        </ng-container>
      } @else {
        <button
          flexDataTableIconButton
          size="small"
          [disabled]="filterOptions.length === 0"
          [rdxDropdownMenuTrigger]="menu"
        >
          <i class="pi pi-filter text-sm"></i>
        </button>
      }

      <ng-template #menu>
        <div
          rdxDropdownMenuContent
          class="rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow"
        >
          @for (filter of filterOptions; track filter.id) {
            <button
              type="button"
              rdxDropdownMenuItem
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

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }

  get enabledFilters(): string[] {
    return Object.keys(this.instance.getFiltering() ?? {});
  }

  get filterOptions(): DataTableFilter[] {
    return this.instance
      .getFilters()
      .filter((filter) => !this.enabledFilters.includes(filter.id));
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
