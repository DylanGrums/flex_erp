import { Product, ProductDetail } from '@flex-erp/store/util';

export interface ProductsStateModel {
  items: Product[];
  selectedId: string | null;
  selectedDetailId: string | null;
  selectedDetail: ProductDetail | null;
  loading: boolean;
  error: string | null;
}
