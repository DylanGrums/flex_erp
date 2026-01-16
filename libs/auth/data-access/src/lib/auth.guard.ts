import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '@flex-erp/auth/data-access';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const authed = store.selectSnapshot(AuthState.isAuthenticated);
  return authed ? true : router.createUrlTree(['/login']);
};
