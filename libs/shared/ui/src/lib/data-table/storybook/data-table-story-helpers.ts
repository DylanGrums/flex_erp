import { signal, type WritableSignal } from '@angular/core';

import { createDataTable, type DataTableInstance } from '../create-data-table';
import {
  DataTableCellContext,
  DataTableColumnDef,
  DataTableColumnOrderState,
  DataTableColumnVisibilityState,
  DataTableCommand,
  DataTableFilter,
  DataTableFilteringState,
  DataTablePaginationState,
  DataTableRowSelectionState,
  DataTableSortingState,
} from '../types';
import { createDataTableColumnHelper } from '../utils/create-data-table-column-helper';
import { createDataTableCommandHelper } from '../utils/create-data-table-command-helper';
import { createDataTableFilterHelper } from '../utils/create-data-table-filter-helper';

export type StoryRow = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Invited' | 'Inactive';
  role: 'Admin' | 'Member';
  amount: number;
  joinedAt: string;
};

export const storyRows: StoryRow[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@flex.io',
    status: 'Active',
    role: 'Admin',
    amount: 3200,
    joinedAt: '2025-01-10',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    email: 'grace@flex.io',
    status: 'Active',
    role: 'Member',
    amount: 2800,
    joinedAt: '2024-11-21',
  },
  {
    id: '3',
    name: 'Alan Turing',
    email: 'alan@flex.io',
    status: 'Inactive',
    role: 'Member',
    amount: 4100,
    joinedAt: '2024-07-15',
  },
  {
    id: '4',
    name: 'Katherine Johnson',
    email: 'katherine@flex.io',
    status: 'Active',
    role: 'Admin',
    amount: 5100,
    joinedAt: '2025-03-02',
  },
  {
    id: '5',
    name: 'Edsger Dijkstra',
    email: 'edsger@flex.io',
    status: 'Invited',
    role: 'Member',
    amount: 1900,
    joinedAt: '2025-05-01',
  },
  {
    id: '6',
    name: 'Margaret Hamilton',
    email: 'margaret@flex.io',
    status: 'Active',
    role: 'Admin',
    amount: 4700,
    joinedAt: '2024-05-28',
  },
  {
    id: '7',
    name: 'Donald Knuth',
    email: 'donald@flex.io',
    status: 'Inactive',
    role: 'Member',
    amount: 2600,
    joinedAt: '2024-12-05',
  },
  {
    id: '8',
    name: 'Barbara Liskov',
    email: 'barbara@flex.io',
    status: 'Active',
    role: 'Admin',
    amount: 3900,
    joinedAt: '2025-02-17',
  },
  {
    id: '9',
    name: 'Linus Torvalds',
    email: 'linus@flex.io',
    status: 'Invited',
    role: 'Member',
    amount: 3500,
    joinedAt: '2025-04-12',
  },
  {
    id: '10',
    name: 'Radia Perlman',
    email: 'radia@flex.io',
    status: 'Active',
    role: 'Member',
    amount: 2900,
    joinedAt: '2024-09-19',
  },
  {
    id: '11',
    name: 'Tim Berners-Lee',
    email: 'tim@flex.io',
    status: 'Active',
    role: 'Admin',
    amount: 5400,
    joinedAt: '2025-06-07',
  },
  {
    id: '12',
    name: 'Hedy Lamarr',
    email: 'hedy@flex.io',
    status: 'Inactive',
    role: 'Member',
    amount: 2300,
    joinedAt: '2024-10-02',
  },
];

const columnHelper = createDataTableColumnHelper<StoryRow>();
const filterHelper = createDataTableFilterHelper<StoryRow>();
const commandHelper = createDataTableCommandHelper();

export const storyColumns: DataTableColumnDef<StoryRow>[] = [
  columnHelper.select(),
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
    meta: { name: 'Name' },
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    enableSorting: true,
    meta: { name: 'Email' },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    enableSorting: true,
    meta: { name: 'Status' },
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    enableSorting: false,
    meta: { name: 'Role' },
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    enableSorting: true,
    headerAlign: 'right',
    meta: { name: 'Amount' },
  }),
  columnHelper.action({
    actions: [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        onClick: () => {},
      },
      {
        label: 'Archive',
        icon: 'pi pi-archive',
        onClick: () => {},
      },
    ],
    meta: { name: 'Actions' },
  }),
];

export const storyFilters: DataTableFilter[] = [
  filterHelper.accessor('status', {
    type: 'select',
    label: 'Status',
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Invited', value: 'Invited' },
      { label: 'Inactive', value: 'Inactive' },
    ],
  }),
  filterHelper.accessor('role', {
    type: 'multiselect',
    label: 'Role',
    options: [
      { label: 'Admin', value: 'Admin' },
      { label: 'Member', value: 'Member' },
    ],
  }),
  filterHelper.accessor('name', {
    type: 'string',
    label: 'Name',
    placeholder: 'Search names',
  }),
  filterHelper.accessor('amount', {
    type: 'number',
    label: 'Amount',
    includeOperators: true,
  }),
  filterHelper.accessor('joinedAt', {
    type: 'date',
    label: 'Joined',
    format: 'date',
    options: [
      {
        label: 'This year',
        value: { $gte: '2025-01-01', $lte: '2025-12-31' },
      },
      {
        label: 'Last year',
        value: { $gte: '2024-01-01', $lte: '2024-12-31' },
      },
    ],
  }),
];

export const storyCommands: DataTableCommand[] = [
  commandHelper.command({
    label: 'Archive',
    shortcut: 'A',
    action: async () => {},
  }),
  commandHelper.command({
    label: 'Export',
    shortcut: 'E',
    action: async () => {},
  }),
];

export interface StoryTableOptions {
  data?: StoryRow[];
  columns?: DataTableColumnDef<StoryRow>[];
  filters?: DataTableFilter[];
  commands?: DataTableCommand[];
  pageSize?: number;
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
  enableColumnVisibility?: boolean;
  enableColumnOrder?: boolean;
}

export interface StoryTableState {
  sorting: WritableSignal<DataTableSortingState | null>;
  filtering: WritableSignal<DataTableFilteringState>;
  search: WritableSignal<string>;
  pagination: WritableSignal<DataTablePaginationState>;
  rowSelection: WritableSignal<DataTableRowSelectionState>;
  columnVisibility: WritableSignal<DataTableColumnVisibilityState>;
  columnOrder: WritableSignal<DataTableColumnOrderState>;
}

export interface StoryTableInstance {
  instance: DataTableInstance<StoryRow>;
  state: StoryTableState;
}

export const createStoryTable = (options: StoryTableOptions = {}): StoryTableInstance => {
  const {
    enableSelection = true,
    enableSorting = true,
    enableFiltering = true,
    enableSearch = true,
    enablePagination = true,
    enableColumnVisibility = true,
    enableColumnOrder = true,
  } = options;

  const data = signal(options.data ?? storyRows);
  const columns = signal(options.columns ?? storyColumns);
  const filters = signal(options.filters ?? storyFilters);
  const commands = signal(options.commands ?? storyCommands);

  const sorting = signal<DataTableSortingState | null>(null);
  const filtering = signal<DataTableFilteringState>({});
  const search = signal('');
  const pagination = signal<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: options.pageSize ?? 5,
  });
  const rowSelection = signal<DataTableRowSelectionState>({});
  const columnVisibility = signal<DataTableColumnVisibilityState>({});
  const columnOrder = signal<DataTableColumnOrderState>([]);

  const instance = createDataTable<StoryRow>({
    data,
    columns,
    filters: enableFiltering ? filters : [],
    commands,
    sorting: enableSorting
      ? {
          state: sorting,
          onSortingChange: (next) => sorting.set(next),
        }
      : undefined,
    filtering: enableFiltering
      ? {
          state: filtering,
          onFilteringChange: (next) => filtering.set(next),
        }
      : undefined,
    search: enableSearch
      ? {
          state: search,
          onSearchChange: (next) => search.set(next),
          debounce: 0,
        }
      : undefined,
    pagination: enablePagination
      ? {
          state: pagination,
          onPaginationChange: (next) => pagination.set(next),
        }
      : undefined,
    rowSelection: enableSelection
      ? {
          state: rowSelection,
          onRowSelectionChange: (next) => rowSelection.set(next),
          enableRowSelection: true,
        }
      : undefined,
    columnVisibility: enableColumnVisibility
      ? {
          state: columnVisibility,
          onColumnVisibilityChange: (next) => columnVisibility.set(next),
        }
      : undefined,
    columnOrder: enableColumnOrder
      ? {
          state: columnOrder,
          onColumnOrderChange: (next) => columnOrder.set(next),
        }
      : undefined,
  });

  return {
    instance,
    state: {
      sorting,
      filtering,
      search,
      pagination,
      rowSelection,
      columnVisibility,
      columnOrder,
    },
  };
};

export const getStoryCellContext = (
  instance: DataTableInstance<StoryRow>,
  columnId: string,
  rowIndex = 0
): DataTableCellContext<StoryRow, unknown> => {
  const row = instance.getRowModel().rows[rowIndex];
  if (!row) {
    throw new Error('No rows available for story context.');
  }

  const cells = row.getVisibleCells();
  const cell = cells.find(
    (candidate: (typeof cells)[number]) => candidate.column.id === columnId
  );
  if (!cell) {
    throw new Error(`No cell found for column "${columnId}".`);
  }

  return cell.getContext();
};
