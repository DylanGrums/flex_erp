import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, of, tap } from 'rxjs';

import {
  ClearContext,
  HydrateFromStorage,
  LoadStores,
  LoadStoresFailed,
  LoadStoresSuccess,
  SetStoreId,
  SetTenantId,
} from './context.actions';
import { AppContext, ContextStateModel, TenantStore } from './context.models';
import { ContextApi } from './context.api';
import { ContextStorage } from './context.storage';

const DEFAULT_CONTEXT: AppContext = {
  tenantId: null,
  storeId: null,
};

const DEFAULT_STATE: ContextStateModel = {
  ctx: DEFAULT_CONTEXT,
  hydrated: false,
  stores: [],
  storesLoading: false,
  storesError: null,
};

@State<ContextStateModel>({
  name: 'appContext',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class ContextState {
  private storage = inject(ContextStorage);
  private api = inject(ContextApi);

  @Selector()
  static storeId(state: ContextStateModel) {
    return state.ctx.storeId;
  }

  @Selector()
  static tenantId(state: ContextStateModel) {
    return state.ctx.tenantId;
  }

  @Selector()
  static hydrated(state: ContextStateModel) {
    return state.hydrated;
  }

  @Selector()
  static hasStore(state: ContextStateModel) {
    return Boolean(state.ctx.storeId);
  }

  @Selector()
  static stores(state: ContextStateModel) {
    return state.stores;
  }

  @Selector()
  static storesLoading(state: ContextStateModel) {
    return state.storesLoading;
  }

  @Selector()
  static storesError(state: ContextStateModel) {
    return state.storesError;
  }

  @Action(HydrateFromStorage)
  hydrate(ctx: StateContext<ContextStateModel>) {
    const stored = this.storage.read();
    if (stored) {
      ctx.patchState({ ctx: { ...stored }, hydrated: true });
      if (stored.tenantId) {
        ctx.dispatch(new LoadStores());
      }
      return;
    }

    ctx.patchState({ hydrated: true });
  }

  @Action(LoadStores)
  loadStores(ctx: StateContext<ContextStateModel>) {
    ctx.patchState({ storesLoading: true, storesError: null });
    return this.api.listStores().pipe(
      tap((stores) => {
        const safeStores: TenantStore[] = Array.isArray(stores) ? stores : [];
        ctx.dispatch(new LoadStoresSuccess(safeStores));
      }),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load stores';
        ctx.dispatch(
          new LoadStoresFailed(Array.isArray(msg) ? msg.join(', ') : msg),
        );
        return of(null);
      }),
    );
  }

  @Action(LoadStoresSuccess)
  loadStoresSuccess(
    ctx: StateContext<ContextStateModel>,
    action: LoadStoresSuccess,
  ) {
    const currentCtx = ctx.getState().ctx;
    const defaultStoreId =
      currentCtx.storeId ?? action.stores[0]?.id ?? null;
    const nextCtx =
      currentCtx.storeId === defaultStoreId
        ? currentCtx
        : { ...currentCtx, storeId: defaultStoreId };

    if (nextCtx !== currentCtx) {
      this.storage.write(nextCtx);
    }

    ctx.patchState({
      stores: action.stores,
      storesLoading: false,
      storesError: null,
      ctx: nextCtx,
    });
  }

  @Action(LoadStoresFailed)
  loadStoresFailed(
    ctx: StateContext<ContextStateModel>,
    action: LoadStoresFailed,
  ) {
    ctx.patchState({ storesLoading: false, storesError: action.error });
  }

  @Action(SetStoreId)
  setStoreId(ctx: StateContext<ContextStateModel>, action: SetStoreId) {
    const next = { ...ctx.getState().ctx, storeId: action.storeId };
    ctx.patchState({ ctx: next });
    this.storage.write(next);
  }

  @Action(SetTenantId)
  setTenantId(ctx: StateContext<ContextStateModel>, action: SetTenantId) {
    const next = { ...ctx.getState().ctx, tenantId: action.tenantId };
    ctx.patchState({ ctx: next });
    this.storage.write(next);
    if (action.tenantId) {
      ctx.dispatch(new LoadStores());
    } else {
      ctx.patchState({
        ctx: { tenantId: null, storeId: null },
        stores: [],
        storesLoading: false,
        storesError: null,
      });
    }
  }

  @Action(ClearContext)
  clear(ctx: StateContext<ContextStateModel>) {
    ctx.setState({ ...DEFAULT_STATE, ctx: { ...DEFAULT_CONTEXT } });
    this.storage.clear();
  }
}
