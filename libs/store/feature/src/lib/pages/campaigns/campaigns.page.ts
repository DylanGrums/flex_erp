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
import { CampaignListItem } from '@flex-erp/store/util';
import { CampaignsFacade, CampaignsListParams } from '@flex-erp/store/data-access';

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

const columnHelper = createDataTableColumnHelper<CampaignRow>();
const filterHelper = createDataTableFilterHelper<CampaignRow>();

type CampaignRow = DataTableRowData & {
  id: string;
  name: string;
  active: string;
  startsAt?: string | null;
  endsAt?: string | null;
  budgetType: string;
  campaign: CampaignListItem;
};

@Component({
  selector: 'fe-store-campaigns-page',
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
        <h1 class="text-2xl font-semibold text-ui-fg-base">Campaigns</h1>
        <p class="mt-1 text-sm text-ui-fg-subtle">Plan and track promotional campaigns.</p>
      </header>

      <div class="medusa-panel p-6">
        @if (errors()?.list) {
          <div class="mb-4 text-sm text-ui-fg-muted">{{ errors()?.list }}</div>
        }
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-lg font-semibold">Campaigns</div>
            <div class="text-sm text-ui-fg-muted">Marketing windows and budgets.</div>
          </div>
          <div class="text-xs text-ui-fg-muted">Total: {{ total() }}</div>
        </div>

        <flex-data-table [instance]="table">
          <flex-data-table-toolbar
            className="flex w-full flex-col items-start justify-between gap-3 md:flex-row md:items-center"
          >
            <div class="text-sm font-semibold">Campaign list</div>
            <div class="flex w-full flex-wrap items-center gap-2 md:w-auto">
              <flex-data-table-search
                placeholder="Search campaigns"
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
export class StoreCampaignsPageComponent {
  private readonly facade = inject(CampaignsFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly campaigns = this.facade.items;
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

  readonly rows = computed<CampaignRow[]>(() =>
    this.campaigns().map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      active: campaign.isActive ? 'Active' : 'Inactive',
      startsAt: campaign.startsAt ? new Date(campaign.startsAt).toLocaleDateString() : null,
      endsAt: campaign.endsAt ? new Date(campaign.endsAt).toLocaleDateString() : null,
      budgetType: campaign.budget?.type ?? 'NONE',
      campaign,
    })),
  );

  readonly rowCount = computed(() => this.total());

  readonly columns: DataTableColumnDef<CampaignRow>[] = [
    columnHelper.select(),
    columnHelper.accessor('name', {
      header: 'Name',
      enableSorting: true,
    }),
    columnHelper.accessor('budgetType', {
      header: 'Budget',
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
      heading: 'No campaigns',
      description: 'Create a campaign to group promotions.',
    },
    filtered: {
      heading: 'No results',
      description: 'Try adjusting your filters or search terms.',
    },
  };

  readonly selectedLabel = (count: number) => `${count} selected`;

  readonly table = createDataTable<CampaignRow>({
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
      const isActive = typeof filtering?.['active'] === 'string'
        ? filtering['active'].toLowerCase() === 'active'
        : undefined;

      const params: CampaignsListParams = {
        limit: pageSize,
        offset: pageIndex * pageSize,
        q: query || null,
        isActive,
      };
      this.facade.loadCampaigns(params);
    });
  }
}
