import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';

import { injectDataTableContext } from '../data-table-context';
import { DataTableFilterBarComponent } from './data-table-filter-bar.component';

export interface DataTableToolbarTranslations {
  clearAll?: string;
  sort?: string;
  columns?: string;
}

@Component({
  selector: 'flex-data-table-toolbar',
  standalone: true,
  imports: [CommonModule, DataTableFilterBarComponent],
  template: `
    <div class="flex flex-col divide-y">
      <div class="flex flex-wrap items-center gap-3 px-6 py-3" [class]="className">
        <ng-content></ng-content>
      </div>
      <flex-data-table-filter-bar
        [clearAllFiltersLabel]="clearAllLabel"
        [alwaysShow]="hasFilters"
        [sortingTooltip]="translations?.sort"
        [columnsTooltip]="translations?.columns"
      >
        @if (filterBarContent) {
          <ng-container *ngTemplateOutlet="filterBarContent"></ng-container>
        }
      </flex-data-table-filter-bar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableToolbarComponent {
  @Input() className = '';
  @Input() translations?: DataTableToolbarTranslations;
  @Input() filterBarContent?: TemplateRef<unknown>;

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }

  get hasFilters(): boolean {
    return this.instance.getFilters().length > 0;
  }

  get clearAllLabel(): string {
    return this.translations?.clearAll ?? 'Clear all';
  }
}
