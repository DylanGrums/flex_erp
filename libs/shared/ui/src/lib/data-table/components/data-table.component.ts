import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DataTableInstance } from '../create-data-table';
import { DATA_TABLE_CONTEXT, DataTableContextValue } from '../data-table-context';
import { DataTableEmptyState, DataTableRowData } from '../types';

const EMPTY_DATA_TABLE_INSTANCE: DataTableInstance<any> = {
  getHeaderGroups: () => [],
  getRowModel: () => ({ rows: [] }),
  getAllColumns: () => [],
  setSorting: () => {},
  getSorting: () => null,
  addFilter: () => {},
  removeFilter: () => {},
  clearFilters: () => {},
  updateFilter: () => {},
  getFiltering: () => ({}),
  getFilters: () => [],
  getFilterOptions: () => null,
  getFilterMeta: () => null,
  getSearch: () => '',
  onSearchChange: () => {},
  getCommands: () => [],
  getRowSelection: () => ({}),
  emptyState: DataTableEmptyState.EMPTY,
  isLoading: false,
  showSkeleton: false,
  pageIndex: 0,
  pageSize: 10,
  rowCount: 0,
  enablePagination: false,
  enableFiltering: false,
  enableSorting: false,
  enableSearch: false,
  enableColumnVisibility: false,
  enableColumnOrder: false,
  columnOrder: [],
  setColumnVisibility: () => {},
  setColumnOrder: () => {},
  setColumnOrderFromArray: () => {},
  getCanNextPage: () => false,
  getCanPreviousPage: () => false,
  nextPage: () => {},
  previousPage: () => {},
  getPageCount: () => 0,
};

@Component({
  selector: 'flex-data-table',
  standalone: true,
  template: `
    <div class="relative flex min-h-0 flex-1 flex-col" [class]="className">
      <ng-content></ng-content>
    </div>
  `,
  providers: [
    {
      provide: DATA_TABLE_CONTEXT,
      useExisting: DataTableComponent,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<TData extends DataTableRowData>
  implements DataTableContextValue<TData>
{
  @Input({ required: true }) instance: DataTableInstance<TData> =
    EMPTY_DATA_TABLE_INSTANCE as DataTableInstance<TData>;
  @Input() className = '';

  get enableColumnVisibility(): boolean {
    return this.instance?.enableColumnVisibility ?? false;
  }

  get enableColumnOrder(): boolean {
    return this.instance?.enableColumnOrder ?? false;
  }
}
