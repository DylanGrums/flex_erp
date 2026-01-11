import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from './auth.state';
import { API_BASE_URL } from '../../../../../tokens';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const apiBaseUrl = inject(API_BASE_URL);
  const token = store.selectSnapshot(AuthState.accessToken);

  const isApiRequest = !!apiBaseUrl && req.url.startsWith(apiBaseUrl);

  if (isApiRequest) {
    req = req.clone({
      setHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      withCredentials: true,
    });
  }
  return next(req);
};
