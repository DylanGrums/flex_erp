export type StoreId = string;

export interface StoreSummary {
  id: StoreId;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  handle?: string | null;
  status?: string | null;
  options?: string[];
  variants?: ProductVariant[];
  images?: string[];
}

export interface ProductVariant {
  id?: string;
  sku?: string | null;
  price?: number | null;
  optionValues?: string[];
}
