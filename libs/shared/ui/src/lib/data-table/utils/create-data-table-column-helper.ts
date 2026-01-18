import { DataTableActionCellComponent } from '../components/data-table-action-cell.component';
import {
  DataTableSelectCellComponent,
  DataTableSelectHeaderComponent,
} from '../components/data-table-select-cell.component';
import {
  DataTableActionColumnDef,
  DataTableAlignableColumnDef,
  DataTableColumnDef,
  DataTableColumnHelper,
  DataTableRowData,
  DataTableSelectColumnDef,
  DataTableSortableColumnDef,
  DataTableSortableColumnDefMeta,
  DataTableAlignableColumnDefMeta,
} from '../types';

export const createDataTableColumnHelper = <TData extends DataTableRowData>(): DataTableColumnHelper<TData> => {
  return {
    accessor: (accessor, column) => {
      const {
        sortLabel,
        sortAscLabel,
        sortDescLabel,
        headerAlign,
        meta,
        enableSorting,
        ...rest
      } = column as DataTableColumnDef<TData, any> &
        DataTableSortableColumnDef &
        DataTableAlignableColumnDef;

      const extendedMeta: DataTableSortableColumnDefMeta &
        DataTableAlignableColumnDefMeta = {
        ___sortMetaData: { sortLabel, sortAscLabel, sortDescLabel },
        ___alignMetaData: { headerAlign },
        ...(meta ?? {}),
      };

      const accessorKey = typeof accessor === 'string' ? accessor : undefined;
      const accessorFn = typeof accessor === 'function' ? accessor : undefined;

      return {
        ...rest,
        id: rest.id ?? accessorKey,
        accessorKey,
        accessorFn,
        enableSorting: enableSorting ?? false,
        meta: extendedMeta,
      } as DataTableColumnDef<TData, any>;
    },
    display: (column) => column,
    action: ({ actions, ...props }: DataTableActionColumnDef<TData>) =>
      ({
        id: 'action',
        cell: (ctx) => ({
          component: DataTableActionCellComponent,
          inputs: { ctx },
        }),
        meta: {
          ___actions: actions,
          ...(props.meta ?? {}),
        },
        ...props,
      }) as DataTableColumnDef<TData, unknown>,
    select: (props?: DataTableSelectColumnDef<TData>) =>
      ({
        id: 'select',
        header:
          props?.header ??
          ((ctx) => ({
            component: DataTableSelectHeaderComponent,
            inputs: { ctx },
          })),
        cell:
          props?.cell ??
          ((ctx) => ({
            component: DataTableSelectCellComponent,
            inputs: { ctx },
          })),
        ...props,
      }) as DataTableColumnDef<TData, unknown>,
  };
};
