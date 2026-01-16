import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AdminPaginationChange } from '../admin-kit.types';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'fe-admin-pagination',
  standalone: true,
  imports: [CommonModule, PaginatorModule, TranslocoModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 border-t border-ui-border-base bg-ui-bg-base/50">
      <span class="text-xs text-ui-fg-muted">
        {{
          'admin.pagination.results'
            | transloco
              : {
                  start: first + 1,
                  end: Math.min(first + pageSize, total),
                  total
                }
        }}
      </span>
      
      <p-paginator
        [first]="first"
        [rows]="pageSize"
        [totalRecords]="total"
        (onPageChange)="onPageChange($event)"
        styleClass="!bg-transparent !border-none !p-0"
        [showCurrentPageReport]="false"
        [showPageLinks]="true"
        [showFirstLastIcon]="false"
      ></p-paginator>
    </div>
  `
})
export class FeAdminPaginationComponent {
  @Input() page = 0;
  @Input() pageSize = 10;
  @Input() total = 0;

  readonly pageChange = output<AdminPaginationChange>();

  get first(): number {
    return this.page * this.pageSize;
  }

  protected readonly Math = Math;

  onPageChange(event: PaginatorState) {
    this.pageChange.emit({
      page: event.page || 0,
      pageSize: event.rows || 10,
      first: event.first || 0
    });
  }
}
