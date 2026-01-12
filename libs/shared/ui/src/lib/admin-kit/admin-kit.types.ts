export type AdminTableAlign = 'left' | 'center' | 'right';

export type AdminSortDirection = 'asc' | 'desc';

export interface AdminTableSort {
  key: string;
  direction: AdminSortDirection;
}

export interface AdminTableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: AdminTableAlign;
  width?: string;
  className?: string;
  headerClassName?: string;
  cell?: (row: T) => string | number | null | undefined;
  sortValue?: (row: T) => string | number | null | undefined;
}

export interface AdminTableAction<T = Record<string, unknown>> {
  label: string;
  icon?: string;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  variant?: 'default' | 'danger';
}

export interface AdminTableEmptyState {
  title?: string;
  description?: string;
}

export interface AdminPaginationChange {
  page: number;
  pageSize: number;
  first: number;
}

export interface AdminSelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
