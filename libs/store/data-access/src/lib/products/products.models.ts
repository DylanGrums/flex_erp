import { Product } from '@flex-erp/store/util';

export interface ProductsStateModel {
  items: Product[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}
