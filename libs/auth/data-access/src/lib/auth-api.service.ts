import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthMeResponse,
  AuthRefreshResponse,
} from '@flex-erp/auth/types';
import { API_BASE_URL } from '@flex-erp/auth/util';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  private get jsonHeaders() {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  login(email: string, password: string) {
    return this.unwrap(
      this.http.post<AuthLoginResponse>(
        this.buildUrl('/auth/login'),
        { email, password },
        { observe: 'response', withCredentials: true, headers: this.jsonHeaders }
      )
    );
  }

  refresh() {
    return this.unwrap(
      this.http.post<AuthRefreshResponse>(
        this.buildUrl('/auth/refresh'),
        {},
        { observe: 'response', withCredentials: true, headers: this.jsonHeaders }
      )
    );
  }

  me() {
    return this.unwrap(
      this.http.get<AuthMeResponse>(this.buildUrl('/auth/me'), {
        observe: 'response',
        withCredentials: true,
      })
    );
  }

  logout() {
    return this.unwrap(
      this.http.post<AuthLogoutResponse>(
        this.buildUrl('/auth/logout'),
        {},
        { observe: 'response', withCredentials: true, headers: this.jsonHeaders }
      )
    );
  }

  private unwrap<T>(obs: Observable<HttpResponse<T>>) {
    return obs.pipe(map((res) => res.body));
  }

  private buildUrl(route: string): string {
    const base = this.apiBaseUrl.replace(/\/+$/, '');
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
    return `${base}${normalizedRoute}`;
  }
}
