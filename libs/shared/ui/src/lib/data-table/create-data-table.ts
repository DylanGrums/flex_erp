import { computed, isSignal, signal } from '@angular/core';

import {
  DataTableCell,
  DataTableColumn,
  DataTableColumnDef,
  DataTableColumnFilter,
  DataTableColumnOrderState,
  DataTableColumnVisibilityState,
  DataTableCommand,
  DataTableDateComparisonOperator,
  DataTableEmptyState,
  DataTableFilter,
  DataTableFilteringState,
  DataTableFilterOption,
  DataTableHeader,
  DataTableHeaderGroup,
  DataTableHeaderContext,
  DataTablePaginationState,
  DataTableRow,
  DataTableRowData,
  DataTableRowModel,
  DataTableRowSelectionState,
  DataTableSortingState,
  DataTableTableApi,
  MaybeSignal,
} from './types';

export interface DataTableOptions<TData extends DataTableRowData> {
  data: MaybeSignal<TData[]>;
  getRowId?: (row: TData) => string;
  columns: MaybeSignal<DataTableColumnDef<TData, any>[]>;
  filters?: MaybeSignal<DataTableFilter[]>;
  commands?: MaybeSignal<DataTableCommand[]>;
  isLoading?: MaybeSignal<boolean>;
  filtering?: {
    state: MaybeSignal<DataTableFilteringState>;
    onFilteringChange: (state: DataTableFilteringState) => void;
  };
  rowSelection?: {
    state: MaybeSignal<DataTableRowSelectionState>;
    onRowSelectionChange: (state: DataTableRowSelectionState) => void;
    enableRowSelection?: boolean | ((row: DataTableRow<TData>) => boolean) | undefined;
  };
  sorting?: {
    state: MaybeSignal<DataTableSortingState | null>;
    onSortingChange: (state: DataTableSortingState | null) => void;
  };
  search?: {
    state: MaybeSignal<string>;
    onSearchChange: (state: string) => void;
    debounce?: number;
  };
  pagination?: {
    state: MaybeSignal<DataTablePaginationState>;
    onPaginationChange: (state: DataTablePaginationState) => void;
  };
  onRowClick?: (event: MouseEvent, row: TData) => void;
  rowCount?: MaybeSignal<number>;
  autoResetPageIndex?: boolean;
  columnVisibility?: {
    state: MaybeSignal<DataTableColumnVisibilityState>;
    onColumnVisibilityChange: (state: DataTableColumnVisibilityState) => void;
  };
  columnOrder?: {
    state: MaybeSignal<DataTableColumnOrderState>;
    onColumnOrderChange: (state: DataTableColumnOrderState) => void;
  };
}

export interface DataTableInstance<TData extends DataTableRowData>
  extends Pick<DataTableTableApi<TData>, 'getRowModel'> {
  getHeaderGroups(): DataTableHeaderGroup<TData>[];
  getAllColumns(): DataTableColumn<TData>[];
  setSorting(
    sortingOrUpdater:
      | DataTableSortingState
      | null
      | ((prev: DataTableSortingState | null) => DataTableSortingState | null)
  ): void;
  getSorting(): DataTableSortingState | null;
  addFilter(filter: DataTableColumnFilter): void;
  removeFilter(id: string): void;
  clearFilters(): void;
  updateFilter(filter: DataTableColumnFilter): void;
  getFiltering(): DataTableFilteringState;
  getFilters(): DataTableFilter[];
  getFilterOptions<T extends string | string[] | DataTableDateComparisonOperator>(
    id: string
  ): DataTableFilterOption<T>[] | null;
  getFilterMeta(id: string): DataTableFilter | null;
  getSearch(): string;
  onSearchChange(search: string): void;
  getCommands(): DataTableCommand[];
  getRowSelection(): DataTableRowSelectionState;
  onRowClick?: (event: MouseEvent, row: TData) => void;
  emptyState: DataTableEmptyState;
  isLoading: boolean;
  showSkeleton: boolean;
  pageIndex: number;
  pageSize: number;
  rowCount: number;
  enablePagination: boolean;
  enableFiltering: boolean;
  enableSorting: boolean;
  enableSearch: boolean;
  enableColumnVisibility: boolean;
  enableColumnOrder: boolean;
  columnOrder: DataTableColumnOrderState;
  setColumnVisibility(
    updater:
      | DataTableColumnVisibilityState
      | ((prev: DataTableColumnVisibilityState) => DataTableColumnVisibilityState)
  ): void;
  setColumnOrder(
    updater:
      | DataTableColumnOrderState
      | ((prev: DataTableColumnOrderState) => DataTableColumnOrderState)
  ): void;
  setColumnOrderFromArray(order: string[]): void;
  getCanNextPage(): boolean;
  getCanPreviousPage(): boolean;
  nextPage(): void;
  previousPage(): void;
  getPageCount(): number;
}

type Updater<T> = T | ((prev: T) => T);

type ColumnLookup<TData extends DataTableRowData> = Map<string, DataTableColumn<TData>>;

type ResolvedColumn<TData extends DataTableRowData> = DataTableColumn<TData>;

type RenderColumnOrder = {
  ordered: DataTableColumn<any>[];
  visible: DataTableColumn<any>[];
};

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_INDEX = 0;

export function createDataTable<TData extends DataTableRowData>(
  options: DataTableOptions<TData>
): DataTableInstance<TData> {
  const resolveSignal = <T>(value: MaybeSignal<T>): T =>
    isSignal(value) ? value() : value;

  const getRowId = options.getRowId ?? ((row: TData, index: number) => {
    const candidate = (row as { id?: string | number }).id;
    return candidate !== undefined ? String(candidate) : String(index);
  });

  const columnsSignal = computed(() => resolveSignal(options.columns));
  const dataSignal = computed(() => resolveSignal(options.data));
  const filtersSignal = computed(() => resolveSignal(options.filters ?? []));
  const commandsSignal = computed(() => resolveSignal(options.commands ?? []));
  const isLoadingSignal = computed(() => resolveSignal(options.isLoading ?? false));
  const sortingState = computed(() => resolveSignal(options.sorting?.state ?? null));
  const filteringState = computed(() =>
    resolveSignal(options.filtering?.state ?? ({} as DataTableFilteringState))
  );
  const paginationState = computed<DataTablePaginationState>(() =>
    resolveSignal(
      options.pagination?.state ?? {
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
      }
    )
  );
  const searchState = computed(() => resolveSignal(options.search?.state ?? ''));
  const rowSelectionState = computed(() =>
    resolveSignal(options.rowSelection?.state ?? {})
  );
  const columnVisibilityState = computed(() =>
    resolveSignal(options.columnVisibility?.state ?? {})
  );
  const columnOrderState = computed(() =>
    resolveSignal(options.columnOrder?.state ?? [])
  );
  const rowCountSignal = computed(() => {
    if (options.rowCount !== undefined) {
      return resolveSignal(options.rowCount);
    }
    return dataSignal().length;
  });
  const pageCountSignal = computed(() => {
    const total = rowCountSignal();
    const size = paginationState().pageSize || DEFAULT_PAGE_SIZE;
    if (size <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / size));
  });

  const localSearch = signal<string | null>(null);

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const autoResetPageIndex = options.autoResetPageIndex ?? true;

  const resetPageIndex = () => {
    if (!autoResetPageIndex || !options.pagination?.onPaginationChange) {
      return;
    }

    const current = paginationState();
    if (!current) {
      return;
    }

    options.pagination.onPaginationChange({
      ...current,
      pageIndex: DEFAULT_PAGE_INDEX,
    });
  };

  const getColumnId = <TValue>(
    column: DataTableColumnDef<TData, TValue>,
    index: number
  ) => {
    if (column.id) {
      return column.id;
    }

    if (column.accessorKey) {
      return column.accessorKey;
    }

    if (typeof column.header === 'string') {
      return column.header;
    }

    return `column_${index}`;
  };

  const getValueByPath = (row: TData, path: string) => {
    return path
      .split('.')
      .reduce<unknown>((value, key) => {
        if (value && typeof value === 'object' && key in (value as object)) {
          return (value as Record<string, unknown>)[key];
        }
        return undefined;
      }, row);
  };

  const allColumnsSignal = computed(() => {
    return columnsSignal().map((column, index) => {
      const id = getColumnId(column, index);
      const accessorFn = column.accessorFn
        ? column.accessorFn
        : column.accessorKey
          ? (row: TData) => getValueByPath(row, column.accessorKey as string)
          : undefined;

      const resolved: ResolvedColumn<TData> = {
        id,
        columnDef: {
          ...column,
          id,
        },
        accessorFn,
        getCanSort: () => Boolean(column.enableSorting),
        getIsSorted: () => {
          const sort = sortingState();
          if (!sort || sort.id !== id) {
            return false;
          }
          return sort.desc ? 'desc' : 'asc';
        },
        getToggleSortingHandler: () => {
          if (!column.enableSorting || !options.sorting?.onSortingChange) {
            return undefined;
          }

          return () => {
            const current = sortingState();
            const isActive = current?.id === id;
            let next: DataTableSortingState | null;
            if (!isActive) {
              next = { id, desc: false };
            } else if (!current?.desc) {
              next = { id, desc: true };
            } else {
              next = null;
            }

            resetPageIndex();
            options.sorting?.onSortingChange(next);
          };
        },
        getCanHide: () => {
          if (column.enableHiding !== undefined) {
            return column.enableHiding;
          }
          return id !== 'select' && id !== 'action';
        },
        getIsVisible: () => {
          const state = columnVisibilityState();
          if (id in state) {
            return Boolean(state[id]);
          }
          return true;
        },
        toggleVisibility: () => {
          if (!options.columnVisibility?.onColumnVisibilityChange) {
            return;
          }

          const current = columnVisibilityState();
          options.columnVisibility.onColumnVisibilityChange({
            ...current,
            [id]: !current[id],
          });
        },
      };

      return resolved;
    });
  });

  const columnLookupSignal = computed<ColumnLookup<TData>>(() => {
    return new Map(allColumnsSignal().map((column) => [column.id, column]));
  });

  const orderedColumnsSignal = computed<RenderColumnOrder>(() => {
    const columns = allColumnsSignal();
    const order = columnOrderState();
    const allIds = columns.map((column) => column.id);
    const baseOrder = order.length ? order : allIds;
    const hasSelect = allIds.includes('select');
    const hasAction = allIds.includes('action');
    const orderedIds = [
      ...(hasSelect ? ['select'] : []),
      ...baseOrder.filter((id) => id !== 'select' && id !== 'action'),
      ...(hasAction ? ['action'] : []),
    ];
    const uniqueOrder = Array.from(new Set(orderedIds));

    const lookup = new Map(columns.map((column) => [column.id, column]));
    const ordered: DataTableColumn<TData>[] = [];

    uniqueOrder.forEach((id) => {
      const column = lookup.get(id);
      if (column) {
        ordered.push(column);
        lookup.delete(id);
      }
    });

    lookup.forEach((column) => ordered.push(column));

    const visible = ordered.filter((column) => column.getIsVisible());

    return { ordered, visible };
  });

  const rowModelSignal = computed<DataTableRowModel<TData>>(() => {
    return {
      rows: dataSignal().map((row, index) => createRow(row, index)),
    };
  });

  const tableApi: DataTableTableApi<TData> = {
    getRowModel: () => rowModelSignal(),
    getIsAllPageRowsSelected: () => {
      const rows = rowModelSignal().rows.filter((row) => row.getCanSelect());
      if (!rows.length) {
        return false;
      }
      return rows.every((row) => row.getIsSelected());
    },
    getIsSomePageRowsSelected: () => {
      const rows = rowModelSignal().rows.filter((row) => row.getCanSelect());
      if (!rows.length) {
        return false;
      }
      const selected = rows.filter((row) => row.getIsSelected());
      return selected.length > 0 && selected.length < rows.length;
    },
    toggleAllPageRowsSelected: (selected: boolean) => {
      if (!options.rowSelection?.onRowSelectionChange) {
        return;
      }

      const current = { ...rowSelectionState() };
      const rows = rowModelSignal().rows.filter((row) => row.getCanSelect());

      rows.forEach((row) => {
        if (selected) {
          current[row.id] = true;
        } else {
          delete current[row.id];
        }
      });

      options.rowSelection.onRowSelectionChange(current);
    },
  };

  function createCell<TValue>(
    row: DataTableRow<TData>,
    column: DataTableColumn<TData, TValue>
  ): DataTableCell<TData, TValue> {
    return {
      id: `${row.id}_${column.id}`,
      row,
      column,
      getContext: () => ({
        row,
        column,
        table: tableApi,
        getValue: () => row.getValue<TValue>(column.id) as TValue,
      }),
    };
  }

  function createRow(row: TData, index: number): DataTableRow<TData> {
    const id = getRowId(row, index);

    const rowObj: DataTableRow<TData> = {
      id,
      index,
      original: row,
      getValue: <TValue = unknown>(columnId: string) => {
        const column = columnLookupSignal().get(columnId);
        if (column?.accessorFn) {
          return column.accessorFn(row) as TValue;
        }
        return undefined;
      },
      getVisibleCells: () => {
        return orderedColumnsSignal().visible.map((column) =>
          createCell(rowObj, column)
        );
      },
      getCanSelect: () => {
        if (!options.rowSelection) {
          return false;
        }

        const selector = options.rowSelection.enableRowSelection;
        if (typeof selector === 'boolean') {
          return selector;
        }

        if (typeof selector === 'function') {
          return selector(rowObj);
        }

        return true;
      },
      getIsSelected: () => Boolean(rowSelectionState()[id]),
      toggleSelected: () => {
        if (!options.rowSelection?.onRowSelectionChange) {
          return;
        }

        if (!rowObj.getCanSelect()) {
          return;
        }

        const current = { ...rowSelectionState() };
        if (current[id]) {
          delete current[id];
        } else {
          current[id] = true;
        }

        options.rowSelection.onRowSelectionChange(current);
      },
    };

    return rowObj;
  }

  const headerGroupsSignal = computed((): DataTableHeaderGroup<TData>[] => {
    const headers: DataTableHeader<TData>[] = orderedColumnsSignal().visible.map(
      (column) => ({
        id: column.id,
        column,
        getContext: (): DataTableHeaderContext<TData> => ({
          column,
          table: tableApi,
        }),
      })
    );

    return [{ id: 'header', headers }];
  });

  const emptyStateSignal = computed(() => {
    const rows = rowModelSignal().rows;
    const hasRows = rows.length > 0;
    const hasSearch = Boolean(searchState());
    const hasFilters = Object.keys(filteringState() ?? {}).length > 0;

    if (hasRows) {
      return DataTableEmptyState.POPULATED;
    }

    if (hasSearch || hasFilters) {
      return DataTableEmptyState.FILTERED_EMPTY;
    }

    return DataTableEmptyState.EMPTY;
  });

  const showSkeletonSignal = computed(() =>
    isLoadingSignal() && rowModelSignal().rows.length === 0
  );

  const enablePagination = Boolean(options.pagination);
  const enableFiltering = Boolean(options.filtering);
  const enableSorting = Boolean(options.sorting);
  const enableSearch = Boolean(options.search);
  const enableColumnVisibility = Boolean(options.columnVisibility);
  const enableColumnOrder = Boolean(options.columnOrder);

  const getSorting = () => sortingState();

  const setSorting = (
    sortingOrUpdater:
      | DataTableSortingState
      | null
      | ((prev: DataTableSortingState | null) => DataTableSortingState | null)
  ) => {
    if (!options.sorting?.onSortingChange) {
      return;
    }

    const current = sortingState();
    const next =
      typeof sortingOrUpdater === 'function'
        ? sortingOrUpdater(current)
        : sortingOrUpdater;

    resetPageIndex();
    options.sorting.onSortingChange(next);
  };

  const getFilters = () => filtersSignal();

  const getFilterOptions = <
    T extends string | string[] | DataTableDateComparisonOperator
  >(
    id: string
  ) => {
    const filter = getFilters().find((item) => item.id === id);

    if (!filter) {
      return null;
    }

    return (filter as { options?: DataTableFilterOption<T>[] }).options ?? null;
  };

  const getFilterMeta = (id: string) => {
    return getFilters().find((filter) => filter.id === id) ?? null;
  };

  const getFiltering = () => filteringState();

  const addFilter = (filter: DataTableColumnFilter) => {
    if (!options.filtering?.onFilteringChange) {
      return;
    }

    const current = { ...getFiltering() };
    current[filter.id] = filter.value;

    resetPageIndex();
    options.filtering.onFilteringChange(current);
  };

  const removeFilter = (id: string) => {
    if (!options.filtering?.onFilteringChange) {
      return;
    }

    const current = { ...getFiltering() };
    delete current[id];

    resetPageIndex();
    options.filtering.onFilteringChange(current);
  };

  const clearFilters = () => {
    if (!options.filtering?.onFilteringChange) {
      return;
    }

    resetPageIndex();
    options.filtering.onFilteringChange({});
  };

  const updateFilter = (filter: DataTableColumnFilter) => {
    addFilter(filter);
  };

  const getSearch = () => localSearch() ?? searchState();

  const onSearchChange = (value: string) => {
    localSearch.set(value);

    if (!options.search?.onSearchChange) {
      return;
    }

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const debounce = options.search.debounce ?? 300;

    if (debounce <= 0) {
      resetPageIndex();
      options.search.onSearchChange(value);
      localSearch.set(null);
      return;
    }

    searchTimeout = setTimeout(() => {
      resetPageIndex();
      options.search?.onSearchChange(value);
      localSearch.set(null);
    }, debounce);
  };

  const getCommands = () => commandsSignal();

  const getRowSelection = () => rowSelectionState();

  const setColumnVisibility = (updater: Updater<DataTableColumnVisibilityState>) => {
    if (!options.columnVisibility?.onColumnVisibilityChange) {
      return;
    }

    const current = columnVisibilityState();
    const next = typeof updater === 'function' ? updater(current) : updater;
    options.columnVisibility.onColumnVisibilityChange(next);
  };

  const setColumnOrder = (updater: Updater<DataTableColumnOrderState>) => {
    if (!options.columnOrder?.onColumnOrderChange) {
      return;
    }

    const current = columnOrderState();
    const next = typeof updater === 'function' ? updater(current) : updater;
    options.columnOrder.onColumnOrderChange(next);
  };

  const setColumnOrderFromArray = (order: string[]) => {
    setColumnOrder(order);
  };

  const getPageCount = () => pageCountSignal();

  const getPageIndex = () => {
    const current = paginationState().pageIndex ?? DEFAULT_PAGE_INDEX;
    return Math.min(Math.max(current, 0), getPageCount() - 1);
  };

  const getCanNextPage = () => getPageIndex() + 1 < getPageCount();

  const getCanPreviousPage = () => getPageIndex() > 0;

  const nextPage = () => {
    if (!options.pagination?.onPaginationChange) {
      return;
    }

    if (!getCanNextPage()) {
      return;
    }

    const current = paginationState();
    const pageIndex = getPageIndex();
    options.pagination.onPaginationChange({
      ...current,
      pageIndex: pageIndex + 1,
    });
  };

  const previousPage = () => {
    if (!options.pagination?.onPaginationChange) {
      return;
    }

    if (!getCanPreviousPage()) {
      return;
    }

    const current = paginationState();
    const pageIndex = getPageIndex();
    options.pagination.onPaginationChange({
      ...current,
      pageIndex: Math.max(0, pageIndex - 1),
    });
  };

  const instance: DataTableInstance<TData> = {
    getHeaderGroups: () => headerGroupsSignal(),
    getRowModel: () => rowModelSignal(),
    getAllColumns: () => allColumnsSignal(),
    setSorting,
    getSorting,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    getFiltering,
    getFilters,
    getFilterOptions,
    getFilterMeta,
    getSearch,
    onSearchChange,
    getCommands,
    getRowSelection,
    onRowClick: options.onRowClick,
    get emptyState() {
      return emptyStateSignal();
    },
    get isLoading() {
      return isLoadingSignal();
    },
    get showSkeleton() {
      return showSkeletonSignal();
    },
    get pageIndex() {
      return getPageIndex();
    },
    get pageSize() {
      return paginationState().pageSize ?? DEFAULT_PAGE_SIZE;
    },
    get rowCount() {
      return rowCountSignal();
    },
    enablePagination,
    enableFiltering,
    enableSorting,
    enableSearch,
    enableColumnVisibility,
    enableColumnOrder,
    get columnOrder() {
      return columnOrderState();
    },
    setColumnVisibility,
    setColumnOrder,
    setColumnOrderFromArray,
    getCanNextPage,
    getCanPreviousPage,
    nextPage,
    previousPage,
    getPageCount,
  };

  return instance;
}
