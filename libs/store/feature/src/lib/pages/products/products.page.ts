import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Box, Pencil, Trash2 } from 'lucide-angular';
import { Product } from '@flex-erp/store/util';
import { ProductsFacade } from '@flex-erp/store/data-access';

import {
  DataTableCommand,
  DataTableColumnDef,
  DataTableColumnOrderState,
  DataTableColumnVisibilityState,
  DataTableEmptyStateProps,
  DataTableFilteringState,
  DataTableFilter,
  DataTablePaginationState,
  DataTableRowData,
  DataTableRowSelectionState,
  DataTableSortingState,
  createDataTable,
  createDataTableColumnHelper,
  createDataTableCommandHelper,
  createDataTableFilterHelper,
  DataTableCommandBarComponent,
  DataTableComponent,
  DataTableFilterMenuComponent,
  DataTablePaginationComponent,
  DataTableSearchComponent,
  DataTableSortingMenuComponent,
  DataTableTableComponent,
  DataTableToolbarComponent,
} from '@flex-erp/shared/ui';

type ProductRow = DataTableRowData & {
  id: string;
  title: string;
  handle: string | null;
  status: string | null;
  product: Product;
};

const columnHelper = createDataTableColumnHelper<ProductRow>();
const filterHelper = createDataTableFilterHelper<ProductRow>();
const commandHelper = createDataTableCommandHelper();

const compareValues = (a: unknown, b: unknown, desc: boolean): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return desc ? b - a : a - b;
  }

  const aVal = String(a ?? '');
  const bVal = String(b ?? '');
  return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
};

const applyFilters = (
  rows: ProductRow[],
  filters: DataTableFilteringState,
): ProductRow[] =>
  rows.filter((row) =>
    Object.entries(filters ?? {}).every(([key, filter]) => {
      if (filter === null || filter === undefined) return true;
      if (typeof filter === 'string' && filter.trim().length === 0) return true;

      const value = row[key];

      if (typeof filter === 'string') {
        return String(value ?? '').toLowerCase().includes(filter.toLowerCase());
      }

      return value === filter;
    }),
  );

@Component({
  selector: 'fe-store-products-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    DataTableComponent,
    DataTableToolbarComponent,
    DataTableSearchComponent,
    DataTableFilterMenuComponent,
    DataTableSortingMenuComponent,
    DataTableTableComponent,
    DataTablePaginationComponent,
    DataTableCommandBarComponent,
  ],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold text-ui-fg-base">{{ 'store.pages.products.title' | transloco }}</h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">
          {{ 'store.pages.products.subtitle' | transloco }}
        </p>
      </header>

      <div class="medusa-panel p-6">
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-lg font-semibold">Catalog</div>
            <div class="text-sm text-ui-fg-muted">Products from your store.</div>
          </div>
          <div class="text-xs text-ui-fg-muted">Total: {{ rowCount() }}</div>
        </div>

        <flex-data-table [instance]="table">
          <flex-data-table-toolbar
            className="flex w-full flex-col items-start justify-between gap-3 md:flex-row md:items-center"
          >
            <div class="text-sm font-semibold">Inventory</div>
            <div class="flex w-full flex-wrap items-center gap-2 md:w-auto">
              <flex-data-table-search
                placeholder="Search products"
                className="min-w-[200px] flex-1 md:w-[240px]"
              ></flex-data-table-search>
              <flex-data-table-filter-menu tooltip="Filter"></flex-data-table-filter-menu>
              <flex-data-table-sorting-menu tooltip="Sort"></flex-data-table-sorting-menu>
            </div>
          </flex-data-table-toolbar>

          <flex-data-table-table [emptyState]="emptyState"></flex-data-table-table>
          <flex-data-table-pagination></flex-data-table-pagination>
          <flex-data-table-command-bar [selectedLabel]="selectedLabel"></flex-data-table-command-bar>
        </flex-data-table>
      </div>
    </section>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProductsPageComponent {
  private readonly facade = inject(ProductsFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly products = this.facade.items;
  readonly search = signal('');
  readonly sorting = signal<DataTableSortingState | null>(null);
  readonly filtering = signal<DataTableFilteringState>({});
  readonly pagination = signal<DataTablePaginationState>({ pageIndex: 0, pageSize: 10 });
  readonly rowSelection = signal<DataTableRowSelectionState>({});
  readonly columnVisibility = signal<DataTableColumnVisibilityState>({});
  readonly columnOrder = signal<DataTableColumnOrderState>([]);

  readonly filters = signal<DataTableFilter[]>([]);
  readonly commands = signal<DataTableCommand[]>([]);

  readonly processedRows = computed(() => {
    const query = this.search().trim().toLowerCase();
    const productRows = this.products().map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle ?? null,
      status: product.status ?? null,
      product,
    }));
    let rows = applyFilters(productRows, this.filtering());

    if (query) {
      rows = rows.filter((row) => {
        return (
          row.title.toLowerCase().includes(query) ||
          (row.handle ?? '').toLowerCase().includes(query) ||
          (row.status ?? '').toLowerCase().includes(query)
        );
      });
    }

    const sorting = this.sorting();
    if (sorting) {
      rows = [...rows].sort((a, b) => {
        const key = sorting.id as keyof ProductRow;
        return compareValues(a[key], b[key], sorting.desc);
      });
    }

    return rows;
  });

  readonly pageData = computed(() => {
    const { pageIndex, pageSize } = this.pagination();
    const start = pageIndex * pageSize;
    return this.processedRows().slice(start, start + pageSize);
  });

  readonly rowCount = computed(() => this.processedRows().length);

  readonly columns: DataTableColumnDef<ProductRow>[] = [
    columnHelper.select(),
    columnHelper.accessor('title', {
      header: 'Title',
      enableSorting: true,
      sortAscLabel: 'A-Z',
      sortDescLabel: 'Z-A',
    }),
    columnHelper.accessor('handle', {
      header: 'Handle',
      enableSorting: true,
      maxSize: 200,
      cell: ({ row }) => row.original.handle ?? '-',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      enableSorting: true,
    }),
    columnHelper.action({
      actions: (ctx) => [
        [
          {
            label: 'Edit',
            icon: Pencil,
            onClick: () => alert(`Edit ${ctx.row.original.title}`),
          },
        ],
        [
          {
            label: 'Archive',
            icon: Box,
            onClick: () => alert(`Archive ${ctx.row.original.title}`),
          },
          {
            label: 'Delete',
            icon: Trash2,
            onClick: () => alert(`Delete ${ctx.row.original.title}`),
          },
        ],
      ],
    }),
  ];

  readonly emptyState: DataTableEmptyStateProps = {
    empty: {
      heading: 'No products',
      description: 'There are no products to display.',
    },
    filtered: {
      heading: 'No results',
      description: 'Try adjusting your filters or search terms.',
    },
  };

  readonly selectedLabel = (count: number) => `${count} selected`;

  readonly table = createDataTable<ProductRow>({
    data: this.pageData,
    columns: this.columns,
    filters: this.filters,
    commands: this.commands,
    rowCount: this.rowCount,
    getRowId: (row) => row.id,
    onRowClick: (_event, row) => {
      this.router.navigate([row.id], { relativeTo: this.route });
    },
    search: {
      state: this.search,
      onSearchChange: (value) => this.search.set(value),
      debounce: 300,
    },
    filtering: {
      state: this.filtering,
      onFilteringChange: (state) => this.filtering.set(state),
    },
    sorting: {
      state: this.sorting,
      onSortingChange: (state) => this.sorting.set(state),
    },
    pagination: {
      state: this.pagination,
      onPaginationChange: (state) => this.pagination.set(state),
    },
    rowSelection: {
      state: this.rowSelection,
      onRowSelectionChange: (state) => this.rowSelection.set(state),
      enableRowSelection: (row) =>
        (row.original.status ?? '').toLowerCase() !== 'archived',
    },
    columnVisibility: {
      state: this.columnVisibility,
      onColumnVisibilityChange: (state) => this.columnVisibility.set(state),
    },
    columnOrder: {
      state: this.columnOrder,
      onColumnOrderChange: (state) => this.columnOrder.set(state),
    },
  });

  ngOnInit(): void {
    this.filters.set([
      filterHelper.accessor('status', {
        label: 'Status',
        type: 'string',
        placeholder: 'Status...',
      }),
      filterHelper.accessor('title', {
        label: 'Title',
        type: 'string',
        placeholder: 'Search title...',
      }),
      filterHelper.accessor('handle', {
        label: 'Handle',
        type: 'string',
        placeholder: 'Search handle...',
      }),
    ]);

    this.commands.set([
      commandHelper.command({
        label: 'Archive',
        shortcut: 'A',
        action: (selection) => {
          alert(`Archive ${Object.keys(selection).length} products`);
        },
      }),
      commandHelper.command({
        label: 'Delete',
        shortcut: 'D',
        action: (selection) => {
          alert(`Delete ${Object.keys(selection).length} products`);
        },
      }),
    ]);

    this.facade.loadProducts();
  }
}
