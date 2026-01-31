import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@flex-erp/auth/util';
import {
  CmsAsset,
  CmsAssetCreatePayload,
  CmsCollection,
  CmsMenu,
  CmsMenuCreatePayload,
  CmsMenuItemCreatePayload,
  CmsMenuItemReorderPayload,
  CmsMenuItemTree,
  CmsMenuItemUpdatePayload,
  CmsMenuUpdatePayload,
  CmsPage,
  CmsPageCreatePayload,
  CmsPagePublishPayload,
  CmsPageUpdatePayload,
  CmsPageVersion,
  CmsPageVersionCreatePayload,
  CmsSite,
  CmsSiteCreatePayload,
  CmsSiteUpdatePayload,
} from './cms-api.models';

@Injectable({ providedIn: 'root' })
export class CmsApi {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_BASE_URL);

  getCurrentSite() {
    return this.unwrap(
      this.http.get<CmsSite | null>(this.buildUrl('/cms/sites/current'), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  listSites() {
    return this.unwrap(
      this.http.get<CmsSite[]>(this.buildUrl('/cms/sites'), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  createSite(payload: CmsSiteCreatePayload) {
    return this.unwrap(
      this.http.post<CmsSite>(this.buildUrl('/cms/sites'), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  updateSite(id: string, payload: CmsSiteUpdatePayload) {
    return this.unwrap(
      this.http.patch<CmsSite>(this.buildUrl(`/cms/sites/${id}`), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  listPages(params: {
    siteId: string;
    status?: string | null;
    search?: string | null;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
    slug?: string | null;
  }) {
    let httpParams = new HttpParams().set('siteId', params.siteId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.direction) httpParams = httpParams.set('direction', params.direction);
    if (params.slug) httpParams = httpParams.set('slug', params.slug);

    return this.unwrap(
      this.http.get<CmsPage[]>(this.buildUrl('/cms/pages'), {
        observe: 'response',
        withCredentials: true,
        params: httpParams,
      }),
    );
  }

  getPageById(id: string) {
    return this.unwrap(
      this.http.get<CmsPage | null>(this.buildUrl(`/cms/pages/${id}`), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  getPageBySlug(siteId: string, slug: string) {
    return this.listPages({ siteId, slug }).pipe(
      map((pages) => pages?.[0] ?? null),
    );
  }

  createPage(payload: CmsPageCreatePayload) {
    return this.unwrap(
      this.http.post<CmsPage>(this.buildUrl('/cms/pages'), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  updatePage(id: string, payload: CmsPageUpdatePayload) {
    return this.unwrap(
      this.http.patch<CmsPage>(this.buildUrl(`/cms/pages/${id}`), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  publishPage(id: string, payload: CmsPagePublishPayload = {}) {
    return this.unwrap(
      this.http.post<CmsPage>(
        this.buildUrl(`/cms/pages/${id}/publish`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  unpublishPage(id: string) {
    return this.unwrap(
      this.http.post<CmsPage>(this.buildUrl(`/cms/pages/${id}/unpublish`), {}, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  listPageVersions(pageId: string) {
    return this.unwrap(
      this.http.get<CmsPageVersion[]>(
        this.buildUrl(`/cms/pages/${pageId}/versions`),
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  getPageVersionById(id: string) {
    return this.unwrap(
      this.http.get<CmsPageVersion | null>(
        this.buildUrl(`/cms/page-versions/${id}`),
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  createPageVersion(pageId: string, payload: CmsPageVersionCreatePayload) {
    return this.unwrap(
      this.http.post<CmsPageVersion>(
        this.buildUrl(`/cms/pages/${pageId}/versions`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  restorePageVersion(id: string) {
    return this.unwrap(
      this.http.post<CmsPageVersion>(
        this.buildUrl(`/cms/page-versions/${id}/restore`),
        {},
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  listAssets(params?: { siteId?: string | null; kind?: string | null; skip?: number; take?: number }) {
    let httpParams = new HttpParams();
    if (params?.siteId) httpParams = httpParams.set('siteId', params.siteId);
    if (params?.kind) httpParams = httpParams.set('kind', params.kind);
    if (typeof params?.skip === 'number') httpParams = httpParams.set('skip', String(params.skip));
    if (typeof params?.take === 'number') httpParams = httpParams.set('take', String(params.take));

    return this.unwrap(
      this.http.get<CmsAsset[]>(this.buildUrl('/cms/assets'), {
        observe: 'response',
        withCredentials: true,
        params: httpParams,
      }),
    );
  }

  createAsset(payload: CmsAssetCreatePayload) {
    return this.unwrap(
      this.http.post<CmsAsset>(this.buildUrl('/cms/assets'), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  deleteAsset(id: string) {
    return this.unwrap(
      this.http.delete<CmsAsset>(this.buildUrl(`/cms/assets/${id}`), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  uploadAsset(siteId: string, file: File) {
    const formData = new FormData();
    formData.append('siteId', siteId);
    formData.append('file', file, file.name);

    return this.unwrap(
      this.http.post<CmsAsset>(this.buildUrl('/cms/assets/upload'), formData, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  listMenus(siteId: string) {
    const params = new HttpParams().set('siteId', siteId);
    return this.unwrap(
      this.http.get<CmsMenu[]>(this.buildUrl('/cms/menus'), {
        observe: 'response',
        withCredentials: true,
        params,
      }),
    );
  }

  createMenu(payload: CmsMenuCreatePayload) {
    return this.unwrap(
      this.http.post<CmsMenu>(this.buildUrl('/cms/menus'), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  updateMenu(id: string, payload: CmsMenuUpdatePayload) {
    return this.unwrap(
      this.http.patch<CmsMenu>(this.buildUrl(`/cms/menus/${id}`), payload, {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  deleteMenu(id: string) {
    return this.unwrap(
      this.http.delete<CmsMenu>(this.buildUrl(`/cms/menus/${id}`), {
        observe: 'response',
        withCredentials: true,
      }),
    );
  }

  listMenuItems(menuId: string) {
    return this.unwrap(
      this.http.get<CmsMenuItemTree[]>(
        this.buildUrl(`/cms/menus/${menuId}/items`),
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  createMenuItem(menuId: string, payload: CmsMenuItemCreatePayload) {
    return this.unwrap(
      this.http.post<CmsMenuItemTree>(
        this.buildUrl(`/cms/menus/${menuId}/items`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  updateMenuItem(menuId: string, itemId: string, payload: CmsMenuItemUpdatePayload) {
    return this.unwrap(
      this.http.patch<CmsMenuItemTree>(
        this.buildUrl(`/cms/menus/${menuId}/items/${itemId}`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  deleteMenuItem(menuId: string, itemId: string) {
    return this.unwrap(
      this.http.delete<CmsMenuItemTree>(
        this.buildUrl(`/cms/menus/${menuId}/items/${itemId}`),
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  reorderMenuItems(menuId: string, payload: CmsMenuItemReorderPayload) {
    return this.unwrap(
      this.http.post<CmsMenuItemTree[]>(
        this.buildUrl(`/cms/menus/${menuId}/items/reorder`),
        payload,
        {
          observe: 'response',
          withCredentials: true,
        },
      ),
    );
  }

  listCollections() {
    return this.unwrap(
      this.http.get<CmsCollection[]>(this.buildUrl('/cms/collections'), {
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
