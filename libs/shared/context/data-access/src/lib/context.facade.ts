import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';

import {
  ClearContext,
  HydrateFromStorage,
  LoadStores,
  SetStoreId,
  SetTenantId,
} from './context.actions';
import { ContextState } from './context.state';

@Injectable({ providedIn: 'root' })
export class ContextFacade {
  private store = inject(Store);

  readonly storeId$ = this.store.select(ContextState.storeId);
  readonly tenantId$ = this.store.select(ContextState.tenantId);
  readonly hydrated$ = this.store.select(ContextState.hydrated);
  readonly hasStore$ = this.store.select(ContextState.hasStore);
  readonly stores$ = this.store.select(ContextState.stores);
  readonly storesLoading$ = this.store.select(ContextState.storesLoading);
  readonly storesError$ = this.store.select(ContextState.storesError);

  get storeIdSnapshot() {
    return this.store.selectSnapshot(ContextState.storeId);
  }

  get tenantIdSnapshot() {
    return this.store.selectSnapshot(ContextState.tenantId);
  }

  get hasStoreSnapshot() {
    return this.store.selectSnapshot(ContextState.hasStore);
  }

  get storesSnapshot() {
    return this.store.selectSnapshot(ContextState.stores);
  }

  hydrate() {
    return this.store.dispatch(new HydrateFromStorage());
  }

  setStoreId(storeId: string | null) {
    return this.store.dispatch(new SetStoreId(storeId));
  }

  setTenantId(tenantId: string | null) {
    return this.store.dispatch(new SetTenantId(tenantId));
  }

  loadStores() {
    return this.store.dispatch(new LoadStores());
  }

  clear() {
    return this.store.dispatch(new ClearContext());
  }
}
