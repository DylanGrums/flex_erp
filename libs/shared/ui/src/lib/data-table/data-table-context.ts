import { InjectionToken, inject } from '@angular/core';

import { DataTableInstance } from './create-data-table';
import { DataTableRowData } from './types';

export interface DataTableContextValue<TData extends DataTableRowData> {
  instance: DataTableInstance<TData>;
  enableColumnVisibility: boolean;
  enableColumnOrder: boolean;
}

export const DATA_TABLE_CONTEXT = new InjectionToken<DataTableContextValue<any>>(
  'DATA_TABLE_CONTEXT'
);

export function injectDataTableContext<TData extends DataTableRowData>(): DataTableContextValue<TData> {
  const context = inject(DATA_TABLE_CONTEXT, { optional: false });

  if (!context) {
    throw new Error('DataTable components must be used within <flex-data-table>.');
  }

  return context as DataTableContextValue<TData>;
}
