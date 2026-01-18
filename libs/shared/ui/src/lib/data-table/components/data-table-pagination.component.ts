import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { injectDataTableContext } from '../data-table-context';
import { DataTableSkeletonComponent } from '../primitives/data-table-skeleton.component';

export interface DataTablePaginationTranslations {
  results?: (from: number, to: number, total: number) => string;
  page?: (pageIndex: number, pageCount: number) => string;
  previous?: string;
  next?: string;
}

@Component({
  selector: 'flex-data-table-pagination',
  standalone: true,
  imports: [CommonModule, DataTableSkeletonComponent],
  template: `
    @if (instance.showSkeleton) {
      <div>
        <div class="flex items-center justify-between border-t border-ui-border-base bg-ui-bg-subtle px-4 py-3">
          <flex-data-table-skeleton className="h-8 w-[150px]"></flex-data-table-skeleton>
          <div class="flex items-center gap-x-2">
            <flex-data-table-skeleton className="h-8 w-24"></flex-data-table-skeleton>
            <flex-data-table-skeleton className="h-8 w-11"></flex-data-table-skeleton>
            <flex-data-table-skeleton className="h-8 w-11"></flex-data-table-skeleton>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex items-center justify-between border-t border-ui-border-base bg-ui-bg-subtle px-4 py-3">
        <div class="text-xs text-ui-fg-muted">
          {{ resultsLabel }}
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-8 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-xs text-ui-fg-base transition-fg hover:bg-ui-bg-base-hover"
            [disabled]="!instance.getCanPreviousPage()"
            (click)="instance.previousPage()"
          >
            {{ translations?.previous || 'Previous' }}
          </button>
          <div class="text-xs text-ui-fg-muted">
            {{ pageLabel }}
          </div>
          <button
            type="button"
            class="inline-flex h-8 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-xs text-ui-fg-base transition-fg hover:bg-ui-bg-base-hover"
            [disabled]="!instance.getCanNextPage()"
            (click)="instance.nextPage()"
          >
            {{ translations?.next || 'Next' }}
          </button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTablePaginationComponent {
  @Input() translations?: DataTablePaginationTranslations;

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }

  get pageCount(): number {
    return this.instance.getPageCount();
  }

  get resultsLabel(): string {
    const pageIndex = this.instance.pageIndex;
    const pageSize = this.instance.pageSize;
    const total = this.instance.rowCount;
    const start = total === 0 ? 0 : pageIndex * pageSize + 1;
    const end = Math.min(total, (pageIndex + 1) * pageSize);

    if (this.translations?.results) {
      return this.translations.results(start, end, total);
    }

    return `Showing ${start}-${end} of ${total}`;
  }

  get pageLabel(): string {
    if (this.translations?.page) {
      return this.translations.page(this.instance.pageIndex + 1, this.pageCount);
    }

    return `Page ${this.instance.pageIndex + 1} of ${this.pageCount}`;
  }
}
