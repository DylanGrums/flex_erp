import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';
import {
  PromotionCreatePayload,
  PromotionDetail,
  PromotionRulesReplacePayload,
  PromotionStatusUpdatePayload,
  PromotionUpdatePayload,
} from '@flex-erp/store/util';
import { PromotionsListParams, PromotionsListResponse } from './promotions.models';

@Injectable({ providedIn: 'root' })
export class PromotionsApi {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  list(params: PromotionsListParams = {}) {
    const httpParams = this.buildListParams(params);
    return this.unwrap(
      this.http.get<PromotionsListResponse>(this.buildUrl('/store/promotions'), {
        observe: 'response',
        params: httpParams,
        withCredentials: true,
      }),
    );
  }

  getById(id: string) {
    return this.unwrap(
      this.http.get<PromotionDetail>(this.buildUrl(`/store/promotions/${id}`), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  create(payload: PromotionCreatePayload) {
    return this.unwrap(
      this.http.post<PromotionDetail>(this.buildUrl('/store/promotions'), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  update(id: string, payload: PromotionUpdatePayload) {
    return this.unwrap(
      this.http.patch<PromotionDetail>(
        this.buildUrl(`/store/promotions/${id}`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  updateStatus(id: string, payload: PromotionStatusUpdatePayload) {
    return this.unwrap(
      this.http.patch<PromotionDetail>(
        this.buildUrl(`/store/promotions/${id}/status`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  replaceRules(id: string, payload: PromotionRulesReplacePayload) {
    return this.unwrap(
      this.http.put<PromotionDetail>(
        this.buildUrl(`/store/promotions/${id}/rules`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  delete(id: string) {
    return this.unwrap(
      this.http.delete<PromotionDetail>(
        this.buildUrl(`/store/promotions/${id}`),
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  private buildListParams(params: PromotionsListParams) {
    let httpParams = new HttpParams();

    if (params.limit !== undefined && params.limit !== null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    if (params.offset !== undefined && params.offset !== null) {
      httpParams = httpParams.set('offset', String(params.offset));
    }
    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.isActive !== undefined && params.isActive !== null) {
      httpParams = httpParams.set('isActive', String(params.isActive));
    }
    if (params.campaignId) {
      httpParams = httpParams.set('campaignId', params.campaignId);
    }

    return httpParams;
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
