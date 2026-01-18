import { DataTableFilter, DataTableFilterProps } from '../types';

export const createDataTableFilterHelper = <TData>() => ({
  accessor: (accessor: string, props: DataTableFilterProps) => ({
    id: accessor,
    ...props,
  }),
  custom: <T extends DataTableFilterProps>(props: DataTableFilter<T>) => props,
});
