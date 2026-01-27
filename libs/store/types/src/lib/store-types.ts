export type StoreId = string;

export interface StoreSummary {
  id: StoreId;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
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

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  position?: number | null;
}

export interface ProductOptionValue {
  id: string;
  value: string;
  position?: number | null;
}

export interface ProductOption {
  id: string;
  name: string;
  position?: number | null;
  values?: ProductOptionValue[];
}

export interface ProductVariantOptionValue {
  id: string;
  value: string;
  optionId: string;
  optionName?: string | null;
}

export interface ProductVariantDetail {
  id: string;
  title: string;
  sku?: string | null;
  priceAmount?: number | null;
  price?: number | null;
  inventoryQuantity?: number | null;
  allowBackorder?: boolean | null;
  optionValues?: ProductVariantOptionValue[];
}

export interface ProductCollection {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
}

export interface ProductDetail {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
  status?: string | null;
  images?: ProductImage[];
  options?: ProductOption[];
  variants?: ProductVariantDetail[];
  collections?: ProductCollection[];
}
