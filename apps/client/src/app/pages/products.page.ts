import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Box, Pencil, Trash2 } from 'lucide-angular';

import {
  DataTableCommand,
  DataTableColumnDef,
  DataTableColumnOrderState,
  DataTableColumnVisibilityState,
  DataTableCustomFilterContext,
  DataTableCellContext,
  DataTableEmptyStateProps,
  DataTableFilteringState,
  DataTableFilter,
  DataTableNumberComparisonOperator,
  DataTablePaginationState,
  DataTableRow,
  DataTableRowSelectionState,
  DataTableSortingState,
  createDataTable,
  createDataTableColumnHelper,
  createDataTableCommandHelper,
  createDataTableFilterHelper,
  isDateComparisonOperator,
  DataTableCommandBarComponent,
  DataTableComponent,
  DataTableFilterMenuComponent,
  DataTablePaginationComponent,
  DataTableSearchComponent,
  DataTableSortingMenuComponent,
  DataTableTableComponent,
  DataTableToolbarComponent,
} from '@flex-erp/shared/ui';

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: string;
  price: number;
  inventory: number;
  createdAt: Date;
  tags: string[];
};

const CATEGORIES = ['Apparel', 'Accessories', 'Electronics', 'Home', 'Beauty'];
const STATUSES = ['Active', 'Draft', 'Archived'];
const TAGS = ['featured', 'promo', 'bestseller', 'limited', 'new'];

const buildProducts = (count: number): Product[] => {
  return Array.from({ length: count }, (_, index) => {
    const category = CATEGORIES[index % CATEGORIES.length];
    const status = STATUSES[index % STATUSES.length];
    const price = 25 + (index % 20) * 7 + (index % 4) * 0.99;
    const inventory = 5 + (index * 3) % 120;
    const createdAt = new Date(2023, (index * 2) % 12, (index * 5) % 28 + 1);
    const id = `prod-${index + 1}`;
    const tags = TAGS.filter((_, tagIndex) => (index + tagIndex) % 2 === 0).slice(0, 3);

    return {
      id,
      name: `Product ${index + 1}`,
      sku: `SKU-${1000 + index}`,
      category,
      status,
      price: Number(price.toFixed(2)),
      inventory,
      createdAt,
      tags,
    };
  });
};

const PRODUCTS = buildProducts(64);

const columnHelper = createDataTableColumnHelper<Product>();
const filterHelper = createDataTableFilterHelper<Product>();
const commandHelper = createDataTableCommandHelper();

const compareValues = (a: unknown, b: unknown, desc: boolean): number => {
  if (a instanceof Date && b instanceof Date) {
    return desc ? b.getTime() - a.getTime() : a.getTime() - b.getTime();
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return desc ? b - a : a - b;
  }

  const aVal = String(a ?? '');
  const bVal = String(b ?? '');
  return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
};

const applyFilters = (
  rows: Product[],
  filters: DataTableFilteringState
): Product[] => {
  return rows.filter((row) => {
    return Object.entries(filters ?? {}).every(([key, filter]) => {
      if (filter === null || filter === undefined) {
        return true;
      }

      if (typeof filter === 'string' && filter.trim().length === 0) {
        return true;
      }

      const value = (row as Record<string, unknown>)[key];

      if (Array.isArray(filter)) {
        if (filter.length === 0) {
          return true;
        }

        if (Array.isArray(value)) {
          return filter.some((entry) => value.includes(entry));
        }

        return filter.includes(value as string);
      }

      if (isDateComparisonOperator(filter)) {
        if (!(value instanceof Date)) {
          return false;
        }

        const dateValue = value.getTime();
        const min = filter.$gte ? new Date(filter.$gte).getTime() : undefined;
        const max = filter.$lte ? new Date(filter.$lte).getTime() : undefined;
        const gt = filter.$gt ? new Date(filter.$gt).getTime() : undefined;
        const lt = filter.$lt ? new Date(filter.$lt).getTime() : undefined;

        if (min !== undefined && dateValue < min) {
          return false;
        }

        if (max !== undefined && dateValue > max) {
          return false;
        }

        if (gt !== undefined && dateValue <= gt) {
          return false;
        }

        if (lt !== undefined && dateValue >= lt) {
          return false;
        }

        return true;
      }

      if (typeof filter === 'object') {
        const operator = Object.keys(filter as DataTableNumberComparisonOperator)[0];
        const operand = (filter as DataTableNumberComparisonOperator)[
          operator as keyof DataTableNumberComparisonOperator
        ];

        if (typeof operand === 'number' && typeof value === 'number') {
          switch (operator) {
            case '$gt':
              return value > operand;
            case '$gte':
              return value >= operand;
            case '$lt':
              return value < operand;
            case '$lte':
              return value <= operand;
            case '$eq':
              return value === operand;
            default:
              return true;
          }
        }
      }

      if (typeof filter === 'string') {
        return String(value ?? '').toLowerCase().includes(filter.toLowerCase());
      }

      return value === filter;
    });
  });
};

@Component({
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
    <div class="medusa-panel p-4">
      <div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="text-lg font-semibold">{{ 'client.pages.products.title' | transloco }}</div>
          <div class="text-sm text-ui-fg-muted">Products overview with mock data.</div>
        </div>
        <div class="text-xs text-ui-fg-muted">Total: {{ rowCount() }}</div>
      </div>

      <flex-data-table [instance]="table">
        <flex-data-table-toolbar
          className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center"
        >
          <div class="text-sm font-semibold">Catalog</div>
          <div class="flex w-full items-center gap-2 md:w-auto">
            <flex-data-table-search placeholder="Search products"></flex-data-table-search>
            <flex-data-table-filter-menu tooltip="Filter"></flex-data-table-filter-menu>
            <flex-data-table-sorting-menu tooltip="Sort"></flex-data-table-sorting-menu>
          </div>
        </flex-data-table-toolbar>

        <flex-data-table-table [emptyState]="emptyState"></flex-data-table-table>
        <flex-data-table-pagination></flex-data-table-pagination>
        <flex-data-table-command-bar [selectedLabel]="selectedLabel"></flex-data-table-command-bar>
      </flex-data-table>
    </div>

    <ng-template
      #categoryFilter
      let-value="value"
      let-onChange="onChange"
      let-onRemove="onRemove"
    >
      <div class="w-[240px] p-3">
        <div class="text-xs font-semibold text-ui-fg-muted">Category</div>
        <div class="mt-2 flex flex-wrap gap-2">
          @for (category of categories; track category) {
            <button
              type="button"
              class="rounded border px-2 py-1 text-xs transition-fg"
              [ngClass]="{
                'border-ui-border-interactive bg-ui-bg-subtle text-ui-fg-base': value === category,
                'border-ui-border-base text-ui-fg-muted hover:bg-ui-bg-base-hover': value !== category
              }"
              (click)="value === category ? onRemove() : onChange(category)"
            >
              {{ category }}
            </button>
          }
        </div>
        <button
          type="button"
          class="mt-3 text-xs text-ui-fg-muted hover:text-ui-fg-subtle"
          (click)="onRemove()"
        >
          Clear category filter
        </button>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  @ViewChild('categoryFilter', { static: true })
  private categoryFilterTemplate!: TemplateRef<DataTableCustomFilterContext>;

  readonly categories = CATEGORIES;

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
    let rows = applyFilters(PRODUCTS, this.filtering());

    if (query) {
      rows = rows.filter((row) => {
        return (
          row.name.toLowerCase().includes(query) ||
          row.sku.toLowerCase().includes(query) ||
          row.category.toLowerCase().includes(query)
        );
      });
    }

    const sorting = this.sorting();
    if (sorting) {
      rows = [...rows].sort((a, b) => {
        const key = sorting.id as keyof Product;
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

  readonly columns: DataTableColumnDef<Product, any>[] = [
    columnHelper.select(),
    columnHelper.accessor('name', {
      header: 'Name',
      enableSorting: true,
      sortAscLabel: 'A-Z',
      sortDescLabel: 'Z-A',
    }),
    columnHelper.accessor('sku', {
      header: 'SKU',
      enableSorting: true,
      maxSize: 140,
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      enableSorting: true,
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      enableSorting: true,
      sortLabel: 'Price',
      sortAscLabel: 'Low to High',
      sortDescLabel: 'High to Low',
      headerAlign: 'right',
      cell: ({ row }: DataTableCellContext<Product, number>) =>
        `$${row.original.price.toFixed(2)}`,
    }),
    columnHelper.accessor('inventory', {
      header: 'Inventory',
      enableSorting: true,
      headerAlign: 'right',
      cell: ({ row }: DataTableCellContext<Product, number>) =>
        row.original.inventory,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      enableSorting: true,
      sortAscLabel: 'Oldest',
      sortDescLabel: 'Newest',
      cell: ({ row }: DataTableCellContext<Product, Date>) =>
        row.original.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    }),
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: ({ row }: DataTableCellContext<Product, string[]>) =>
        row.original.tags.join(', '),
    }),
    columnHelper.action({
      actions: (ctx: DataTableCellContext<Product, unknown>) => [
        [
          {
            label: 'Edit',
            icon: Pencil,
            onClick: () => alert(`Edit ${ctx.row.original.name}`),
          },
        ],
        [
          {
            label: 'Archive',
            icon: Box,
            onClick: () => alert(`Archive ${ctx.row.original.name}`),
          },
          {
            label: 'Delete',
            icon: Trash2,
            onClick: () => alert(`Delete ${ctx.row.original.name}`),
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

  readonly table = createDataTable<Product>({
    data: this.pageData,
    columns: this.columns,
    filters: this.filters,
    commands: this.commands,
    rowCount: this.rowCount,
    getRowId: (row: Product) => row.id,
    onRowClick: (_event: MouseEvent, row: Product) => {
      alert(`Open ${row.name}`);
    },
    search: {
      state: this.search,
      onSearchChange: (value: string) => this.search.set(value),
      debounce: 300,
    },
    filtering: {
      state: this.filtering,
      onFilteringChange: (state: DataTableFilteringState) => this.filtering.set(state),
    },
    sorting: {
      state: this.sorting,
      onSortingChange: (state: DataTableSortingState | null) =>
        this.sorting.set(state),
    },
    pagination: {
      state: this.pagination,
      onPaginationChange: (state: DataTablePaginationState) =>
        this.pagination.set(state),
    },
    rowSelection: {
      state: this.rowSelection,
      onRowSelectionChange: (state: DataTableRowSelectionState) =>
        this.rowSelection.set(state),
      enableRowSelection: (row: DataTableRow<Product>) =>
        row.original.status !== 'Archived',
    },
    columnVisibility: {
      state: this.columnVisibility,
      onColumnVisibilityChange: (state: DataTableColumnVisibilityState) =>
        this.columnVisibility.set(state),
    },
    columnOrder: {
      state: this.columnOrder,
      onColumnOrderChange: (state: DataTableColumnOrderState) =>
        this.columnOrder.set(state),
    },
  });

  ngOnInit(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    this.filters.set([
      filterHelper.accessor('status', {
        label: 'Status',
        type: 'select',
        options: STATUSES.map((status) => ({ label: status, value: status })),
      }),
      filterHelper.accessor('category', {
        label: 'Category',
        type: 'custom',
        template: this.categoryFilterTemplate,
      }),
      filterHelper.accessor('tags', {
        label: 'Tags',
        type: 'multiselect',
        searchable: true,
        options: TAGS.map((tag) => ({ label: tag, value: tag })),
      }),
      filterHelper.accessor('name', {
        label: 'Name',
        type: 'string',
        placeholder: 'Search name...'
      }),
      filterHelper.accessor('price', {
        label: 'Price',
        type: 'number',
        includeOperators: true,
        placeholder: 'Price...'
      }),
      filterHelper.accessor('createdAt', {
        label: 'Created',
        type: 'date',
        format: 'date',
        rangeOptionLabel: 'Custom range',
        rangeOptionStartLabel: 'Starting',
        rangeOptionEndLabel: 'Ending',
        options: [
          {
            label: 'Last 30 days',
            value: { $gte: thirtyDaysAgo.toISOString() },
          },
          {
            label: 'Last 90 days',
            value: { $gte: ninetyDaysAgo.toISOString() },
          },
          {
            label: 'Before 2024',
            value: { $lt: new Date('2024-01-01').toISOString() },
          },
        ],
      }),
    ]);

    this.commands.set([
      commandHelper.command({
        label: 'Archive',
        shortcut: 'A',
        action: (selection: DataTableRowSelectionState) => {
          alert(`Archive ${Object.keys(selection).length} products`);
        },
      }),
      commandHelper.command({
        label: 'Delete',
        shortcut: 'D',
        action: (selection: DataTableRowSelectionState) => {
          alert(`Delete ${Object.keys(selection).length} products`);
        },
      }),
    ]);
  }
}
