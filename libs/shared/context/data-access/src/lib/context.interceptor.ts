import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';

import { AuthState } from '@flex-erp/auth/data-access';
import { SetTenantId } from './context.actions';
import { ContextState } from './context.state';

export const contextInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const storeId = store.selectSnapshot(ContextState.storeId);
  let tenantId = store.selectSnapshot(ContextState.tenantId);

  if (!tenantId) {
    const authUser = store.selectSnapshot(AuthState.user);
    tenantId = authUser?.tenantId ?? null;
    if (tenantId) {
      store.dispatch(new SetTenantId(tenantId));
    }
  }
  console.log('Context Interceptor - Store ID:', storeId, 'Tenant ID:', tenantId);
  if (!storeId && !tenantId) {
    return next(req);
  }

  let headers = req.headers;
  if (storeId) {
    headers = headers.set('X-Store-Id', storeId);
  }
  if (tenantId) {
    headers = headers.set('X-Tenant-Id', tenantId);
  }

  return next(req.clone({ headers }));
};
