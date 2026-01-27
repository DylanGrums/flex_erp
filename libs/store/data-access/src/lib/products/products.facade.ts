import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { Product } from '@flex-erp/store/util';

import {
  CreateProduct,
  LoadProduct,
  LoadProducts,
  ProductUpsertPayload,
  SelectProduct,
  UpdateProduct,
} from './products.actions';
import { ProductsState } from './products.state';

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private store = inject(Store);

  readonly items$ = this.store.select(ProductsState.items);
  readonly selectedId$ = this.store.select(ProductsState.selectedId);
  readonly selected$ = this.store.select(ProductsState.selected);
  readonly loading$ = this.store.select(ProductsState.loading);
  readonly error$ = this.store.select(ProductsState.error);

  readonly items = toSignal(this.items$, { initialValue: [] as Product[] });
  readonly selectedId = toSignal(this.selectedId$, { initialValue: null });
  readonly selected = toSignal(this.selected$, { initialValue: null });
  readonly loading = toSignal(this.loading$, { initialValue: false });
  readonly error = toSignal(this.error$, { initialValue: null });

  loadProducts() {
    return this.store.dispatch(new LoadProducts());
  }

  loadAll() {
    return this.loadProducts();
  }

  loadProduct(productId: string) {
    return this.store.dispatch(new LoadProduct(productId));
  }

  createProduct(payload: ProductUpsertPayload) {
    return this.store.dispatch(new CreateProduct(payload));
  }

  updateProduct(productId: string, payload: ProductUpsertPayload) {
    return this.store.dispatch(new UpdateProduct(productId, payload));
  }

  selectProduct(productId: string | null) {
    return this.store.dispatch(new SelectProduct(productId));
  }
}
