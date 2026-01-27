import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, of, tap } from 'rxjs';
import { Product } from '@flex-erp/store/util';

import {
  CreateProduct,
  CreateProductFailed,
  CreateProductSuccess,
  LoadProduct,
  LoadProductFailed,
  LoadProductSuccess,
  LoadProducts,
  LoadProductsFailed,
  LoadProductsSuccess,
  SelectProduct,
  UpdateProduct,
  UpdateProductFailed,
  UpdateProductSuccess,
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
    return this.api.list().pipe(
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

  @Action(LoadProduct)
  loadProduct(ctx: StateContext<ProductsStateModel>, action: LoadProduct) {
    ctx.patchState({
      loading: true,
      error: null,
      selectedId: action.productId,
    });
    return this.api.getById(action.productId).pipe(
      tap((product) => {
        if (!product) {
          ctx.dispatch(new LoadProductFailed('Product not found'));
          return;
        }
        ctx.dispatch(new LoadProductSuccess(product));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load product';
        ctx.dispatch(
          new LoadProductFailed(Array.isArray(msg) ? msg.join(', ') : msg),
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

  @Action(LoadProductSuccess)
  loadProductSuccess(
    ctx: StateContext<ProductsStateModel>,
    action: LoadProductSuccess,
  ) {
    const state = ctx.getState();
    const existingIndex = state.items.findIndex(
      (item) => item.id === action.product.id,
    );
    const nextItems = [...state.items];
    if (existingIndex >= 0) {
      nextItems[existingIndex] = action.product;
    } else {
      nextItems.push(action.product);
    }
    ctx.patchState({ items: nextItems, loading: false, error: null });
  }

  @Action(LoadProductsFailed)
  loadProductsFailed(
    ctx: StateContext<ProductsStateModel>,
    action: LoadProductsFailed,
  ) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(LoadProductFailed)
  loadProductFailed(
    ctx: StateContext<ProductsStateModel>,
    action: LoadProductFailed,
  ) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(CreateProduct)
  createProduct(ctx: StateContext<ProductsStateModel>, action: CreateProduct) {
    ctx.patchState({ loading: true, error: null });
    return this.api.create(action.payload).pipe(
      tap((product) => {
        if (!product) {
          ctx.dispatch(new CreateProductFailed('Product not created'));
          return;
        }
        ctx.dispatch(new CreateProductSuccess(product));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to create product';
        ctx.dispatch(
          new CreateProductFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(CreateProductSuccess)
  createProductSuccess(
    ctx: StateContext<ProductsStateModel>,
    action: CreateProductSuccess,
  ) {
    const state = ctx.getState();
    ctx.patchState({
      items: [...state.items, action.product],
      selectedId: action.product.id,
      loading: false,
      error: null,
    });
  }

  @Action(CreateProductFailed)
  createProductFailed(
    ctx: StateContext<ProductsStateModel>,
    action: CreateProductFailed,
  ) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(UpdateProduct)
  updateProduct(ctx: StateContext<ProductsStateModel>, action: UpdateProduct) {
    ctx.patchState({
      loading: true,
      error: null,
      selectedId: action.productId,
    });
    return this.api.update(action.productId, action.payload).pipe(
        tap((product) => {
          if (!product) {
            ctx.dispatch(new UpdateProductFailed('Product not updated'));
            return;
          }
          ctx.dispatch(new UpdateProductSuccess(product));
        }),
        catchError((err) => {
          const msg = err?.error?.message ?? 'Failed to update product';
          ctx.dispatch(
            new UpdateProductFailed(Array.isArray(msg) ? msg.join(', ') : msg),
          );
          return of(null);
        }),
      );
  }

  @Action(UpdateProductSuccess)
  updateProductSuccess(
    ctx: StateContext<ProductsStateModel>,
    action: UpdateProductSuccess,
  ) {
    const state = ctx.getState();
    const index = state.items.findIndex(
      (item) => item.id === action.product.id,
    );
    const nextItems = [...state.items];
    if (index >= 0) {
      nextItems[index] = action.product;
    } else {
      nextItems.push(action.product);
    }
    ctx.patchState({ items: nextItems, loading: false, error: null });
  }

  @Action(UpdateProductFailed)
  updateProductFailed(
    ctx: StateContext<ProductsStateModel>,
    action: UpdateProductFailed,
  ) {
    ctx.patchState({ loading: false, error: action.error });
  }

  @Action(SelectProduct)
  selectProduct(ctx: StateContext<ProductsStateModel>, action: SelectProduct) {
    ctx.patchState({ selectedId: action.productId });
  }
}
