import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Plus } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { PromotionListItem } from '@flex-erp/store/util';
import { PromotionsFacade } from '@flex-erp/store/data-access';

import {
  DataTableColumnDef,
  DataTableCommand,
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

import { PromotionsListParams } from '@flex-erp/store/data-access';

const columnHelper = createDataTableColumnHelper<PromotionRow>();
const filterHelper = createDataTableFilterHelper<PromotionRow>();

type PromotionRow = DataTableRowData & {
  id: string;
  code: string;
  status: string;
  method: string;
  active: string;
  startsAt?: string | null;
  endsAt?: string | null;
  promotion: PromotionListItem;
};

@Component({
  selector: 'fe-store-promotions-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    LucideAngularModule,
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
      <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-ui-fg-base">{{ 'store.pages.promotions.title' | transloco }}</h1>
          <p class="mt-1 text-sm text-ui-fg-subtle">
            {{ 'store.pages.promotions.subtitle' | transloco }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex h-9 items-center gap-2 rounded-md bg-ui-bg-interactive px-4 text-sm font-semibold text-ui-fg-on-color shadow-sm transition-fg hover:bg-ui-bg-interactive-hover"
          (click)="createPromotion()"
        >
          <i-lucide [img]="Plus" class="h-4 w-4"></i-lucide>
          New promotion
        </button>
      </header>

      <div class="medusa-panel p-6">
        @if (errors()?.list) {
          <div class="mb-4 text-sm text-ui-fg-muted">{{ errors()?.list }}</div>
        }
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-lg font-semibold">Promotions</div>
            <div class="text-sm text-ui-fg-muted">Discounts applied to products or carts.</div>
          </div>
          <div class="text-xs text-ui-fg-muted">Total: {{ total() }}</div>
        </div>

        <flex-data-table [instance]="table">
          <flex-data-table-toolbar
            className="flex w-full flex-col items-start justify-between gap-3 md:flex-row md:items-center"
          >
            <div class="text-sm font-semibold">Catalog promotions</div>
            <div class="flex w-full flex-wrap items-center gap-2 md:w-auto">
              <flex-data-table-search
                placeholder="Search promotions"
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
export class StorePromotionsPageComponent {
  readonly Plus = Plus;

  private readonly facade = inject(PromotionsFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly promotions = this.facade.items;
  readonly total = this.facade.total;
  readonly errors = this.facade.errors;

  readonly search = signal('');
  readonly sorting = signal<DataTableSortingState | null>(null);
  readonly filtering = signal<DataTableFilteringState>({});
  readonly pagination = signal<DataTablePaginationState>({ pageIndex: 0, pageSize: 10 });
  readonly rowSelection = signal<DataTableRowSelectionState>({});
  readonly columnVisibility = signal<DataTableColumnVisibilityState>({});
  readonly columnOrder = signal<DataTableColumnOrderState>([]);
  readonly filters = signal<DataTableFilter[]>([]);
  readonly commands = signal<DataTableCommand[]>([]);

  readonly rows = computed<PromotionRow[]>(() =>
    this.promotions().map((promotion) => ({
      id: promotion.id,
      code: promotion.code,
      status: promotion.status,
      method: promotion.isAutomatic ? 'Automatic' : 'Code',
      active: promotion.isActive ? 'Active' : 'Inactive',
      startsAt: promotion.startsAt ? new Date(promotion.startsAt).toLocaleDateString() : null,
      endsAt: promotion.endsAt ? new Date(promotion.endsAt).toLocaleDateString() : null,
      promotion,
    })),
  );

  readonly rowCount = computed(() => this.total());

  readonly columns: DataTableColumnDef<PromotionRow>[] = [
    columnHelper.select(),
    columnHelper.accessor('code', {
      header: 'Code',
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      enableSorting: true,
    }),
    columnHelper.accessor('method', {
      header: 'Method',
    }),
    columnHelper.accessor('active', {
      header: 'Active',
    }),
    columnHelper.accessor('startsAt', {
      header: 'Starts',
    }),
    columnHelper.accessor('endsAt', {
      header: 'Ends',
    }),
  ];

  readonly emptyState: DataTableEmptyStateProps = {
    empty: {
      heading: 'No promotions',
      description: 'Create a promotion to get started.',
    },
    filtered: {
      heading: 'No results',
      description: 'Try adjusting your filters or search terms.',
    },
  };

  readonly selectedLabel = (count: number) => `${count} selected`;

  readonly table = createDataTable<PromotionRow>({
    data: this.rows,
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
      enableRowSelection: () => true,
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

  constructor() {
    this.filters.set([
      filterHelper.accessor('status', {
        label: 'Status',
        type: 'string',
        placeholder: 'Status...'
      }),
      filterHelper.accessor('active', {
        label: 'Active',
        type: 'string',
        placeholder: 'Active...'
      }),
    ]);

    effect(() => {
      const { pageIndex, pageSize } = this.pagination();
      const query = this.search().trim();
      const filtering = this.filtering();
      const status = typeof filtering?.['status'] === 'string' ? filtering['status'].trim() : null;
      const isActive = typeof filtering?.['active'] === 'string'
        ? filtering['active'].toLowerCase() === 'active'
        : undefined;

      const params: PromotionsListParams = {
        limit: pageSize,
        offset: pageIndex * pageSize,
        q: query || null,
        status: status ? status.toUpperCase() : null,
        isActive,
      };
      this.facade.loadPromotions(params);
    });
  }

  createPromotion() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }
}
