import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';
import {
  CampaignCreatePayload,
  CampaignDetail,
  CampaignUpdatePayload,
} from '@flex-erp/store/util';
import { CampaignsListParams, CampaignsListResponse } from './campaigns.models';

@Injectable({ providedIn: 'root' })
export class CampaignsApi {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  list(params: CampaignsListParams = {}) {
    const httpParams = this.buildListParams(params);
    return this.unwrap(
      this.http.get<CampaignsListResponse>(this.buildUrl('/store/campaigns'), {
        observe: 'response',
        params: httpParams,
        withCredentials: true,
      }),
    );
  }

  getById(id: string) {
    return this.unwrap(
      this.http.get<CampaignDetail>(this.buildUrl(`/store/campaigns/${id}`), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  create(payload: CampaignCreatePayload) {
    return this.unwrap(
      this.http.post<CampaignDetail>(this.buildUrl('/store/campaigns'), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  update(id: string, payload: CampaignUpdatePayload) {
    return this.unwrap(
      this.http.patch<CampaignDetail>(
        this.buildUrl(`/store/campaigns/${id}`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  attachPromotion(campaignId: string, promotionId: string) {
    return this.unwrap(
      this.http.post<CampaignDetail>(
        this.buildUrl(`/store/campaigns/${campaignId}/promotions/${promotionId}`),
        {},
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  detachPromotion(campaignId: string, promotionId: string) {
    return this.unwrap(
      this.http.delete<CampaignDetail>(
        this.buildUrl(`/store/campaigns/${campaignId}/promotions/${promotionId}`),
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  private buildListParams(params: CampaignsListParams) {
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
    if (params.isActive !== undefined && params.isActive !== null) {
      httpParams = httpParams.set('isActive', String(params.isActive));
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
