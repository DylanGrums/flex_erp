import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, of, tap } from 'rxjs';
import { Product } from '@flex-erp/store/util';

import {
  LoadProducts,
  LoadProductsFailed,
  LoadProductsSuccess,
  SelectProduct,
} from './products.actions';
import { ProductsApi } from './products.api';
import { ProductsStateModel } from './products.models';

const DEFAULT_STATE: ProductsStateModel = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};

@State<ProductsStateModel>({
  name: 'storeProducts',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class ProductsState {
  private api = inject(ProductsApi);

  @Selector()
  static items(state: ProductsStateModel) {
    return state.items;
  }

  @Selector()
  static selectedId(state: ProductsStateModel) {
    return state.selectedId;
  }

  @Selector()
  static selected(state: ProductsStateModel) {
    return state.items.find((item) => item.id === state.selectedId) ?? null;
  }

  @Selector()
  static loading(state: ProductsStateModel) {
    return state.loading;
  }

  @Selector()
  static error(state: ProductsStateModel) {
    return state.error;
  }

  @Action(LoadProducts)
  loadProducts(ctx: StateContext<ProductsStateModel>, action: LoadProducts) {
    ctx.patchState({ loading: true, error: null });
    return this.api.list(action.storeId).pipe(
      tap((items) => {
        const safeItems: Product[] = Array.isArray(items) ? items : [];
        ctx.dispatch(new LoadProductsSuccess(safeItems));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load products';
        ctx.dispatch(
          new LoadProductsFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(LoadProductsSuccess)
  loadProductsSuccess(
    ctx: StateContext<ProductsStateModel>,
    action: LoadProductsSuccess,
  ) {
    ctx.patchState({ items: action.items, loading: false, error: null });
  }

  @Action(LoadProductsFailed)
  loadProductsFailed(
    ctx: StateContext<ProductsStateModel>,
    action: LoadProductsFailed,
  ) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(SelectProduct)
  selectProduct(ctx: StateContext<ProductsStateModel>, action: SelectProduct) {
    ctx.patchState({ selectedId: action.productId });
  }
}
