import { inject, Injectable } from '@angular/core';
import { ApiHelperService } from '../../../shared/services/api-helper.service';
import { User } from 'generated/prisma/client';

@Injectable({ providedIn: 'root' })
export class AuthManagerService {
  private _apiHelper = inject(ApiHelperService);

  login(email: string, password: string) {
    return this._apiHelper.post<{
      accessToken: string;
      accessTokenExpiresAt: string;
      user: User;
    }>(`/auth/login`, { email, password });
  }

  refresh() {
    return this._apiHelper.post<{
      accessToken: string;
      accessTokenExpiresAt: string;
      user: User;
    }>(`/auth/refresh`, {});
  }

  me() {
    return this._apiHelper.get<{ userId?: string; email?: string; role?: string; id?: string }>(`/auth/me`);
  }

  logout() {
    return this._apiHelper.post<{ ok: true }>(`/auth/logout`, {});
  }


}
