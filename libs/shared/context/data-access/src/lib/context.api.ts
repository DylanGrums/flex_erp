import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';

import { TenantStore } from './context.models';

@Injectable({ providedIn: 'root' })
export class ContextApi {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  listStores() {
    return this.unwrap(
      this.http.get<TenantStore[]>(this.buildUrl('/stores'), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  private unwrap<T>(obs: Observable<{ body: T }>) {
    return obs.pipe(map((res) => res.body));
  }

  private buildUrl(route: string): string {
    const base = this.apiBaseUrl.replace(/\/+$/, '');
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
    return `${base}${normalizedRoute}`;
  }
}
