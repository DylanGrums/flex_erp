import { inject, Injectable, OnDestroy } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, tap, of } from 'rxjs';
import { AuthStateModel } from './auth.models';
import { Refresh, Login, LoadMe, Logout, LoginSuccess, LoginFailed, ClearError } from './auth.actions';
import { AuthApiService } from './auth-api.service';
import { ClearContext, SetTenantId } from '@flex-erp/shared/context/data-access';

const DEFAULT_STATE: AuthStateModel = {
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  loading: false,
  error: null,
};

@State<AuthStateModel>({
  name: 'auth',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class AuthState implements OnDestroy {
  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;
  private api = inject(AuthApiService);

  ngOnDestroy(): void {
    if (this.refreshTimerId) globalThis.clearTimeout?.(this.refreshTimerId);
  }

  // ----------------- Selectors -----------------
  @Selector() static user(s: AuthStateModel) { return s.user; }
  @Selector() static accessToken(s: AuthStateModel) { return s.accessToken; }
  @Selector() static isAuthenticated(s: AuthStateModel) { return !!s.accessToken && !!s.user; }
  @Selector() static loading(s: AuthStateModel) { return s.loading; }
  @Selector() static error(s: AuthStateModel) { return s.error; }

  // ----------------- Helpers -----------------
  private scheduleSilentRefresh(ctx: StateContext<AuthStateModel>, isoExp: string | null) {
    if (this.refreshTimerId) { clearTimeout(this.refreshTimerId); this.refreshTimerId = null; }
    if (!isoExp) return;

    const expMs = new Date(isoExp).getTime();
    const delay = Math.max(1_000, expMs - Date.now() - 30_000); // refresh 30s early
    this.refreshTimerId = setTimeout(() => ctx.dispatch(new Refresh()), delay);
  }

  // ----------------- Actions -----------------
  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, { payload }: Login) {
    ctx.patchState({ loading: true, error: null });
    return this.api.login(payload.email, payload.password).pipe(
      tap(res => {
        if (!res || !res.accessToken) {
          throw new Error('Invalid login response');
        }
        ctx.patchState({
          user: res.user,
          accessToken: res.accessToken,
          accessTokenExpiresAt: res.accessTokenExpiresAt,
          loading: false,
          error: null,
        });
        ctx.dispatch(new SetTenantId(res.user.tenantId ?? null));
        this.scheduleSilentRefresh(ctx, res.accessTokenExpiresAt);
      }),
      catchError(err => {
        const msg = err?.error?.message ?? 'Login failed';
        ctx.patchState({ loading: false, error: Array.isArray(msg) ? msg.join(', ') : msg });
        return of(null);
      })
    );
  }

  @Action(Refresh)
  refresh(ctx: StateContext<AuthStateModel>) {
    return this.api.refresh().pipe(
      tap(res => {
        if (!res || !res.accessToken) {
          throw new Error('Invalid refresh response');
        }
        ctx.patchState({
          user: res.user,
          accessToken: res.accessToken,
          accessTokenExpiresAt: res.accessTokenExpiresAt,
          error: null,
        });
        ctx.dispatch(new SetTenantId(res.user.tenantId ?? null));
        this.scheduleSilentRefresh(ctx, res.accessTokenExpiresAt);
      }),
      catchError(() => {
        ctx.setState({ ...DEFAULT_STATE });
        ctx.dispatch(new ClearContext());
        if (this.refreshTimerId) { globalThis.clearTimeout?.(this.refreshTimerId); this.refreshTimerId = null; }
        return of(null);
      })
    );
  }

  @Action(LoadMe)
  me(_ctx: StateContext<AuthStateModel>) {
    return this.api.me().pipe(
      tap(() => {
        // No-op for now
      }),
      catchError(() => of(null))
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    return this.api.logout().pipe(
      tap(() => {
        if (this.refreshTimerId) { clearTimeout(this.refreshTimerId); this.refreshTimerId = null; }
        ctx.setState({ ...DEFAULT_STATE });
        ctx.dispatch(new ClearContext());
      }),
      catchError(() => {
        if (this.refreshTimerId) { clearTimeout(this.refreshTimerId); this.refreshTimerId = null; }
        ctx.setState({ ...DEFAULT_STATE });
        ctx.dispatch(new ClearContext());
        return of(null);
      })
    );
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, { payload }: LoginSuccess) {
    ctx.patchState({
      user: payload.user,
      accessToken: payload.accessToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      loading: false,
      error: null,
    });
    ctx.dispatch(new SetTenantId(payload.user.tenantId ?? null));
    this.scheduleSilentRefresh(ctx, payload.accessTokenExpiresAt);
  }

  @Action(LoginFailed)
  loginFailed(ctx: StateContext<AuthStateModel>, { error }: LoginFailed) {
    ctx.patchState({ loading: false, error });
  }

  @Action(ClearError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }
}
