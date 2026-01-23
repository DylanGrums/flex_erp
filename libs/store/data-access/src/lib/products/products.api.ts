import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';
import { Product } from '@flex-erp/store/util';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  list(storeId: string) {
    return this.unwrap(
      this.http.get<Product[]>(this.buildUrl(`/stores/${storeId}/products`), {
        observe: 'response',
      }),
    );
  }

  getById(storeId: string, id: string) {
    return this.unwrap(
      this.http.get<Product | null>(
        this.buildUrl(`/stores/${storeId}/products/${id}`),
        {
          observe: 'response',
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
