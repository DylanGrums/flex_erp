import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../tokens';

@Injectable({
  providedIn: 'root'
})
export class ApiHelperService {

  private _apiUrl: string = inject(API_BASE_URL);
  private _http = inject(HttpClient);
  private get jsonHeaders() {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  public get<T>(route: string, urlParams?: string): Observable<T | null> {
    const args: HttpArgument = this.preloadArguments(route, urlParams);
    const obs: Observable<T | null> = this._http.get<T>(
      args.url,
      { observe: 'response', withCredentials: true })
      .pipe(
        map((res: HttpResponse<T>) => res.body),
      );
    return obs;
  }

  public post<T>(route: string, body: any, urlParams?: string): Observable<T | null> {
    const args: HttpArgument = this.preloadArguments(route, urlParams);
    const obs: Observable<T | null> = this._http.post<T>(
      args.url, body,
      { observe: 'response', withCredentials: true, headers: this.jsonHeaders })
      .pipe(
        map((res: HttpResponse<T>) => res.body as T),
      );
    return obs;
  }

  public put<T>(route: string, body: any, urlParams?: string): Observable<T | null> {
    const args: HttpArgument = this.preloadArguments(route, urlParams);
    const obs: Observable<T | null> = this._http.put<T>(
      args.url,
      body,
      { observe: 'response', withCredentials: true, headers: this.jsonHeaders })
      .pipe(
        map((res: HttpResponse<T>) => res.body as T),
      );
    return obs;
  }

  public delete<T>(route: string, urlParams?: string): Observable<T | null> {
    const args: HttpArgument = this.preloadArguments(route, urlParams);
    const obs: Observable<T | null> = this._http.delete<T>(
      args.url,
      { observe: 'response', withCredentials: true })
      .pipe(
        map((res: HttpResponse<T>) => res.body),
      );
    return obs;
  }

  private preloadArguments(route: string, urlParams?: string): HttpArgument {
    const Objectarguments: HttpArgument = {
      url: this.reconstituteUrl(route, urlParams)
    };
    return Objectarguments;
  }


  private reconstituteUrl(route: string, params?: string): string {
    const base = this._apiUrl.replace(/\/+$/, '');
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
    let url = `${base}${normalizedRoute}`;
    if (params) {
      url += `${params}`; // Ensure query parameters are appended correctly
    }
    return url;
  }

  public getApiURlString(): string {
    return this._apiUrl;
  }
}


export type HttpArgument = {
  url: string;
};
