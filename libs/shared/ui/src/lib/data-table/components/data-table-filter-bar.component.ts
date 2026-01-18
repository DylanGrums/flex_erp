import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, effect, signal } from '@angular/core';

import { injectDataTableContext } from '../data-table-context';
import { DataTableFilterComponent } from './data-table-filter.component';
import { DataTableFilterMenuComponent } from './data-table-filter-menu.component';
import { DataTableSortingMenuComponent } from './data-table-sorting-menu.component';
import { DataTableColumnVisibilityMenuComponent } from './data-table-column-visibility-menu.component';
import { DataTableSkeletonComponent } from '../primitives/data-table-skeleton.component';
import { isDateComparisonOperator } from '../utils/is-date-comparison-operator';

interface LocalFilter {
  id: string;
  value: unknown;
  isNew: boolean;
}

@Component({
  selector: 'flex-data-table-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    DataTableFilterComponent,
    DataTableFilterMenuComponent,
    DataTableSortingMenuComponent,
    DataTableColumnVisibilityMenuComponent,
    DataTableSkeletonComponent,
  ],
  template: `
    @if (shouldShow) {
      @if (instance.showSkeleton) {
        <div class="bg-ui-bg-subtle flex w-full flex-nowrap items-center gap-2 overflow-x-auto border-t border-ui-border-base px-6 py-2.5 md:flex-wrap">
          @for (row of skeletonRows; track row) {
            <flex-data-table-skeleton className="h-8 w-[180px]"></flex-data-table-skeleton>
          }
          @if (skeletonRows.length > 0) {
            <flex-data-table-skeleton className="h-8 w-[66px]"></flex-data-table-skeleton>
          }
        </div>
      } @else {
        <div class="bg-ui-bg-subtle flex w-full flex-nowrap items-center justify-between gap-2 overflow-x-auto border-t border-ui-border-base px-6 py-2.5">
          <div class="flex flex-nowrap items-center gap-2 md:flex-wrap">
            @for (localFilter of localFilters(); track localFilter.id) {
              <flex-data-table-filter
                [id]="localFilter.id"
                [filter]="localFilter.value"
                [isNew]="localFilter.isNew"
                (update)="updateLocalFilter(localFilter.id, $event)"
                (remove)="removeLocalFilter(localFilter.id)"
              ></flex-data-table-filter>
            }
            @if (hasAvailableFilters) {
              <flex-data-table-filter-menu [onAddFilter]="addLocalFilter"></flex-data-table-filter-menu>
            }
          </div>
          <div class="flex flex-shrink-0 items-center gap-2">
            @if (hasSorting) {
              <flex-data-table-sorting-menu [tooltip]="sortingTooltip"></flex-data-table-sorting-menu>
            }
            @if (enableColumnVisibility) {
              <flex-data-table-column-visibility-menu
                [tooltip]="columnsTooltip"
              ></flex-data-table-column-visibility-menu>
            }
            <ng-content></ng-content>
          </div>
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterBarComponent {
  @Input() clearAllFiltersLabel = 'Clear all';
  @Input() alwaysShow = false;
  @Input() sortingTooltip?: string;
  @Input() columnsTooltip?: string;

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }
  readonly localFilters = signal<LocalFilter[]>([]);

  constructor() {
    effect(() => {
      const parentFilters = this.instance.getFiltering() ?? {};
      const parentIds = Object.keys(parentFilters);

      this.localFilters.update((prev) => {
        const next = prev.filter(
          (filter) => parentIds.includes(filter.id) || filter.isNew
        );

        const existingIds = new Set(next.map((filter) => filter.id));
        parentIds.forEach((id) => {
          if (!existingIds.has(id)) {
            next.push({
              id,
              value: parentFilters[id],
              isNew: false,
            });
          }
        });

        return next;
      });
    });
  }

  get filterCount(): number {
    return this.localFilters().length;
  }

  get hasAvailableFilters(): boolean {
    return this.instance.getFilters().length > 0;
  }

  get hasSorting(): boolean {
    return (
      this.instance.enableSorting &&
      this.instance.getAllColumns().some((column) => column.getCanSort())
    );
  }

  get enableColumnVisibility(): boolean {
    return this.instance.enableColumnVisibility;
  }

  get shouldShow(): boolean {
    return (
      this.filterCount > 0 ||
      this.hasAvailableFilters ||
      this.hasSorting ||
      this.enableColumnVisibility ||
      this.alwaysShow
    );
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.filterCount }, (_, i) => i);
  }

  readonly addLocalFilter = (id: string, value: unknown): void => {
    this.localFilters.update((prev) => [...prev, { id, value, isNew: true }]);
  };

  updateLocalFilter(id: string, value: unknown): void {
    this.localFilters.update((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, value, isNew: false } : filter
      )
    );

    if (this.hasMeaningfulValue(value)) {
      this.instance.updateFilter({ id, value });
    }
  }

  removeLocalFilter(id: string): void {
    const parentFilters = this.instance.getFiltering() ?? {};

    this.localFilters.update((prev) => prev.filter((filter) => filter.id !== id));

    if (parentFilters[id] !== undefined) {
      this.instance.removeFilter(id);
    }
  }

  clearFilters(): void {
    this.localFilters.set([]);
    this.instance.clearFilters();
  }

  private hasMeaningfulValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'number') {
      return true;
    }

    if (isDateComparisonOperator(value)) {
      return Boolean(value.$gte || value.$lte || value.$gt || value.$lt);
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value as Record<string, unknown>);
      return keys.length > 0;
    }

    return true;
  }
}
