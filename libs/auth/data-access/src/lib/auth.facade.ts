import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthCredentials, AuthTokenResponse } from '@flex-erp/auth/types';
import {
  ClearError,
  LoadMe,
  Login,
  LoginFailed,
  LoginSuccess,
  Logout,
  Refresh,
} from './auth.actions';
import { AuthState } from './auth.state';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private store = inject(Store);

  readonly user$ = this.store.select(AuthState.user);
  readonly accessToken$ = this.store.select(AuthState.accessToken);
  readonly isAuthenticated$ = this.store.select(AuthState.isAuthenticated);
  readonly loading$ = this.store.select(AuthState.loading);
  readonly error$ = this.store.select(AuthState.error);

  login(payload: AuthCredentials) {
    return this.store.dispatch(new Login(payload));
  }

  refresh() {
    return this.store.dispatch(new Refresh());
  }

  loadMe() {
    return this.store.dispatch(new LoadMe());
  }

  logout() {
    return this.store.dispatch(new Logout());
  }

  loginSuccess(payload: AuthTokenResponse) {
    return this.store.dispatch(new LoginSuccess(payload));
  }

  loginFailed(error: string) {
    return this.store.dispatch(new LoginFailed(error));
  }

  clearError() {
    return this.store.dispatch(new ClearError());
  }
}
