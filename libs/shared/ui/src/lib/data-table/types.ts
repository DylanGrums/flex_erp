import { Signal, TemplateRef, Type } from '@angular/core';

export type MaybeSignal<T> = T | Signal<T>;

export type DataTableRowData = Record<string, unknown>;

export interface DataTableTableApi<TData extends DataTableRowData> {
  getRowModel(): DataTableRowModel<TData>;
  getIsAllPageRowsSelected(): boolean;
  getIsSomePageRowsSelected(): boolean;
  toggleAllPageRowsSelected(selected: boolean): void;
}

export interface DataTableCellContext<TData extends DataTableRowData, TValue = unknown> {
  row: DataTableRow<TData>;
  column: DataTableColumn<TData, TValue>;
  table: DataTableTableApi<TData>;
  getValue(): TValue;
}

export interface DataTableHeaderContext<TData extends DataTableRowData, TValue = unknown> {
  column: DataTableColumn<TData, TValue>;
  table: DataTableTableApi<TData>;
}

export interface DataTableComponentRenderer<TContext = unknown> {
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
}

export type DataTableRenderOutput<TContext> =
  | string
  | number
  | null
  | TemplateRef<TContext>
  | DataTableComponentRenderer<TContext>;

export type DataTableRender<TContext> =
  | DataTableRenderOutput<TContext>
  | ((ctx: TContext) => DataTableRenderOutput<TContext>);

export type DataTableSortDirection = 'asc' | 'desc';

export type DataTableHeaderAlignment = 'left' | 'center' | 'right';

export type DataTableSortableColumnDef = {
  sortLabel?: string;
  sortAscLabel?: string;
  sortDescLabel?: string;
  enableSorting?: boolean;
};

export type DataTableAlignableColumnDef = {
  headerAlign?: DataTableHeaderAlignment;
};

export type DataTableSortableColumnDefMeta = {
  ___sortMetaData?: DataTableSortableColumnDef;
};

export type DataTableAlignableColumnDefMeta = {
  ___alignMetaData?: DataTableAlignableColumnDef;
};

export type DataTableAction<TData extends DataTableRowData> = {
  label: string;
  onClick: (ctx: DataTableCellContext<TData, unknown>) => void;
  icon?: string | TemplateRef<unknown>;
};

export interface DataTableActionColumnDef<TData extends DataTableRowData>
  extends Pick<DataTableColumnDef<TData, unknown>, 'meta'> {
  actions:
    | DataTableAction<TData>[]
    | DataTableAction<TData>[][]
    | ((ctx: DataTableCellContext<TData, unknown>) =>
        | DataTableAction<TData>[]
        | DataTableAction<TData>[][]);
}

export interface DataTableSelectColumnDef<TData extends DataTableRowData>
  extends Pick<DataTableColumnDef<TData, unknown>, 'cell' | 'header'> {}

export type DataTableActionColumnDefMeta<TData extends DataTableRowData> = {
  ___actions?:
    | DataTableAction<TData>[]
    | DataTableAction<TData>[][]
    | ((ctx: DataTableCellContext<TData, unknown>) =>
        | DataTableAction<TData>[]
        | DataTableAction<TData>[][]);
};

export type DataTableColumnSizing = {
  maxSize?: number;
  minSize?: number;
  size?: number;
};

export interface DataTableColumnDef<TData extends DataTableRowData, TValue = unknown>
  extends DataTableColumnSizing {
  id?: string;
  accessorKey?: string;
  accessorFn?: (row: TData) => TValue;
  header?: DataTableRender<DataTableHeaderContext<TData, TValue>>;
  cell?: DataTableRender<DataTableCellContext<TData, TValue>>;
  meta?: DataTableColumnMeta<TData, TValue>;
  enableSorting?: boolean;
  enableHiding?: boolean;
}

export type DataTableColumnMeta<TData extends DataTableRowData, TValue = unknown> =
  | (DataTableSortableColumnDefMeta &
      DataTableAlignableColumnDefMeta & {
        name?: string;
      } &
      DataTableActionColumnDefMeta<TData>)
  | undefined;

export interface DataTableColumn<TData extends DataTableRowData, TValue = unknown> {
  id: string;
  columnDef: DataTableColumnDef<TData, TValue>;
  accessorFn?: (row: TData) => TValue;
  getCanSort(): boolean;
  getIsSorted(): DataTableSortDirection | false;
  getToggleSortingHandler(): (() => void) | undefined;
  getCanHide(): boolean;
  getIsVisible(): boolean;
  toggleVisibility(): void;
}

export interface DataTableHeader<TData extends DataTableRowData, TValue = unknown> {
  id: string;
  column: DataTableColumn<TData, TValue>;
  getContext(): DataTableHeaderContext<TData, TValue>;
}

export interface DataTableHeaderGroup<TData extends DataTableRowData> {
  id: string;
  headers: DataTableHeader<TData>[];
}

export interface DataTableCell<TData extends DataTableRowData, TValue = unknown> {
  id: string;
  row: DataTableRow<TData>;
  column: DataTableColumn<TData, TValue>;
  getContext(): DataTableCellContext<TData, TValue>;
}

export interface DataTableRow<TData extends DataTableRowData> {
  id: string;
  index: number;
  original: TData;
  getValue<TValue = unknown>(columnId: string): TValue | undefined;
  getVisibleCells(): DataTableCell<TData>[];
  getCanSelect(): boolean;
  getIsSelected(): boolean;
  toggleSelected(): void;
}

export interface DataTableRowModel<TData extends DataTableRowData> {
  rows: DataTableRow<TData>[];
}

export type DataTableSortingState = {
  id: string;
  desc: boolean;
};

export type DataTableRowSelectionState = Record<string, boolean>;

export type DataTablePaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type DataTableFilteringState<T extends Record<string, unknown> = Record<string, unknown>> = {
  [K in keyof T]: T[K];
};

export type DataTableColumnVisibilityState = Record<string, boolean>;

export type DataTableColumnOrderState = string[];

export type DataTableFilterType =
  | 'radio'
  | 'select'
  | 'date'
  | 'multiselect'
  | 'string'
  | 'number'
  | 'custom';

export type DataTableFilterOption<T = string> = {
  label: string;
  value: T;
};

interface DataTableBaseFilterProps {
  type: DataTableFilterType;
  label: string;
}

export interface DataTableRadioFilterProps extends DataTableBaseFilterProps {
  type: 'radio';
  options: DataTableFilterOption[];
}

export interface DataTableSelectFilterProps extends DataTableBaseFilterProps {
  type: 'select';
  options: DataTableFilterOption[];
}

export interface DataTableDateFilterProps extends DataTableBaseFilterProps {
  type: 'date';
  format?: 'date' | 'date-time';
  rangeOptionLabel?: string;
  rangeOptionStartLabel?: string;
  rangeOptionEndLabel?: string;
  disableRangeOption?: boolean;
  formatDateValue?: (value: Date) => string;
  options: DataTableFilterOption<DataTableDateComparisonOperator>[];
}

export interface DataTableMultiselectFilterProps extends DataTableBaseFilterProps {
  type: 'multiselect';
  options: DataTableFilterOption[];
  searchable?: boolean;
}

export interface DataTableStringFilterProps extends DataTableBaseFilterProps {
  type: 'string';
  placeholder?: string;
}

export interface DataTableNumberFilterProps extends DataTableBaseFilterProps {
  type: 'number';
  placeholder?: string;
  includeOperators?: boolean;
}

export interface DataTableCustomFilterContext {
  value: unknown;
  onChange: (value: unknown) => void;
  onRemove: () => void;
}

export interface DataTableCustomFilterProps extends DataTableBaseFilterProps {
  type: 'custom';
  template?: TemplateRef<DataTableCustomFilterContext>;
  component?: Type<unknown>;
  componentInputs?: Record<string, unknown>;
}

export type DataTableFilterProps =
  | DataTableRadioFilterProps
  | DataTableSelectFilterProps
  | DataTableDateFilterProps
  | DataTableMultiselectFilterProps
  | DataTableStringFilterProps
  | DataTableNumberFilterProps
  | DataTableCustomFilterProps;

export type DataTableFilter<T extends DataTableFilterProps = DataTableFilterProps> = T & {
  id: string;
};

export enum DataTableEmptyState {
  EMPTY = 'EMPTY',
  FILTERED_EMPTY = 'FILTERED_EMPTY',
  POPULATED = 'POPULATED',
}

export type DataTableDateComparisonOperator = {
  $gte?: string;
  $lte?: string;
  $lt?: string;
  $gt?: string;
};

export type DataTableNumberComparisonOperator = {
  $gte?: number;
  $lte?: number;
  $lt?: number;
  $gt?: number;
  $eq?: number;
};

type DataTableCommandAction = (selection: DataTableRowSelectionState) => void | Promise<void>;

export interface DataTableCommand {
  label: string;
  action: DataTableCommandAction;
  shortcut: string;
}

export type DataTableEmptyStateContent = {
  heading?: string;
  description?: string;
  custom?: TemplateRef<unknown> | DataTableComponentRenderer<unknown>;
};

export type DataTableEmptyStateProps = {
  filtered?: DataTableEmptyStateContent;
  empty?: DataTableEmptyStateContent;
};

export type DataTableColumnFilter = {
  id: string;
  value: unknown;
};

export interface DataTableColumnHelper<TData extends DataTableRowData> {
  accessor: <TValue>(
    accessor: string | ((row: TData) => TValue),
    column: DataTableColumnDef<TData, TValue> & DataTableSortableColumnDef & DataTableAlignableColumnDef
  ) => DataTableColumnDef<TData, TValue>;
  display: (column: DataTableColumnDef<TData>) => DataTableColumnDef<TData>;
  action: (props: DataTableActionColumnDef<TData>) => DataTableColumnDef<TData, unknown>;
  select: (props?: DataTableSelectColumnDef<TData>) => DataTableColumnDef<TData, unknown>;
}
