import { Product } from '@flex-erp/store/util';

export class LoadProducts {
  static readonly type = '[Store Products] Load';
  constructor(public storeId: string) {}
}

export class LoadProductsSuccess {
  static readonly type = '[Store Products] Load Success';
  constructor(public items: Product[]) {}
}

export class LoadProductsFailed {
  static readonly type = '[Store Products] Load Failed';
  constructor(public error: string) {}
}

export class SelectProduct {
  static readonly type = '[Store Products] Select';
  constructor(public productId: string | null) {}
}
