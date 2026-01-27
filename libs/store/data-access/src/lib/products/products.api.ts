import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';
import { Product } from '@flex-erp/store/util';
import { ProductUpsertPayload } from './products.actions';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  list() {
    return this.unwrap(
      this.http.get<Product[]>(this.buildUrl('/products'), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  getById(id: string) {
    return this.unwrap(
      this.http.get<Product | null>(
        this.buildUrl(`/products/${id}`),
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  create(payload: ProductUpsertPayload) {
    return this.unwrap(
      this.http.post<Product>(
        this.buildUrl('/products'),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  update(id: string, payload: ProductUpsertPayload) {
    return this.unwrap(
      this.http.patch<Product>(
        this.buildUrl(`/products/${id}`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
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
