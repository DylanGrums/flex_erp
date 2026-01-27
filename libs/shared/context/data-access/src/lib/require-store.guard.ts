import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { HydrateFromStorage } from './context.actions';
import { ContextState } from './context.state';

const DEFAULT_SHELL_ROUTE = '/orders';

export const requireStoreGuard: CanActivateFn = (_route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const hydrated = store.selectSnapshot(ContextState.hydrated);

  if (!hydrated) {
    store.dispatch(new HydrateFromStorage());
    return true;
  }

  const storeId = store.selectSnapshot(ContextState.storeId);
  if (storeId) {
    return true;
  }

  if (
    state.url.startsWith(DEFAULT_SHELL_ROUTE) &&
    state.url.includes('missingStore=1')
  ) {
    return true;
  }

  return router.createUrlTree([DEFAULT_SHELL_ROUTE], {
    queryParams: { missingStore: 1, returnUrl: state.url },
  });
};
