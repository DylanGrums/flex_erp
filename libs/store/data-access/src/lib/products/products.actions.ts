import { Product } from '@flex-erp/store/util';

export class LoadProducts {
  static readonly type = '[Store Products] Load';
  constructor() {}
}

export class LoadProduct {
  static readonly type = '[Store Products] Load One';
  constructor(public productId: string) {}
}

export class LoadProductsSuccess {
  static readonly type = '[Store Products] Load Success';
  constructor(public items: Product[]) {}
}

export class LoadProductSuccess {
  static readonly type = '[Store Products] Load One Success';
  constructor(public product: Product) {}
}

export class LoadProductsFailed {
  static readonly type = '[Store Products] Load Failed';
  constructor(public error: string) {}
}

export class LoadProductFailed {
  static readonly type = '[Store Products] Load One Failed';
  constructor(public error: string) {}
}

export type ProductUpsertPayload = {
  title: string;
  handle: string | null;
  status: string;
  options: string[];
  variants: Array<{
    sku: string | null;
    price: number;
    optionValues: string[];
  }>;
  images: string[];
};

export class CreateProduct {
  static readonly type = '[Store Products] Create';
  constructor(public payload: ProductUpsertPayload) {}
}

export class CreateProductSuccess {
  static readonly type = '[Store Products] Create Success';
  constructor(public product: Product) {}
}

export class CreateProductFailed {
  static readonly type = '[Store Products] Create Failed';
  constructor(public error: string) {}
}

export class UpdateProduct {
  static readonly type = '[Store Products] Update';
  constructor(public productId: string, public payload: ProductUpsertPayload) {}
}

export class UpdateProductSuccess {
  static readonly type = '[Store Products] Update Success';
  constructor(public product: Product) {}
}

export class UpdateProductFailed {
  static readonly type = '[Store Products] Update Failed';
  constructor(public error: string) {}
}

export class SelectProduct {
  static readonly type = '[Store Products] Select';
  constructor(public productId: string | null) {}
}
