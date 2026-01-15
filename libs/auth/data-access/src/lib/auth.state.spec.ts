import { TestBed } from '@angular/core/testing';
import { StateContext } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { AuthState } from './auth.state';
import { AuthApiService } from './auth-api.service';
import {
  ClearError,
  LoadMe,
  Login,
  LoginFailed,
  LoginSuccess,
  Logout,
  Refresh,
} from './auth.actions';
import { AuthStateModel } from './auth.models';

type TestContext = StateContext<AuthStateModel> & { dispatch: jest.Mock };

const initialAuthState: AuthStateModel = {
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  loading: false,
  error: null,
};

if (!(global as any).clearTimeout) {
  (global as any).clearTimeout = () => undefined;
}
const originalClearTimeout = (global as any).clearTimeout;

const createContext = (
  override: Partial<AuthStateModel> = {},
): { ctx: TestContext; latest: () => AuthStateModel } => {
  let current: AuthStateModel = { ...initialAuthState, ...override };
  const ctx: TestContext = {
    getState: () => current,
    setState: (val: any) => {
      current = typeof val === 'function' ? val(current) : val;
    },
    patchState: (val: Partial<AuthStateModel>) => {
      current = { ...current, ...val };
    },
    dispatch: jest.fn(),
  };

  return { ctx, latest: () => current };
};

describe('AuthState', () => {
  let api: {
    login: jest.Mock;
    refresh: jest.Mock;
    me: jest.Mock;
    logout: jest.Mock;
  };
  let state: AuthState;

  beforeAll(() => {
    if (!(global as any).clearTimeout) {
      (global as any).clearTimeout = () => undefined;
    }
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    api = {
      login: jest.fn(),
      refresh: jest.fn(),
      me: jest.fn(),
      logout: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthState,
        { provide: AuthApiService, useValue: api },
      ],
    });

    state = TestBed.inject(AuthState);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    (global as any).clearTimeout = originalClearTimeout;
  });

  it('should expose selectors', () => {
    const testState: AuthStateModel = {
      user: { id: '1' } as any,
      accessToken: 'token',
      accessTokenExpiresAt: '2024-01-01T00:05:00Z',
      loading: true,
      error: 'bad',
    };

    expect(AuthState.user(testState)).toEqual({ id: '1' } as any);
    expect(AuthState.accessToken(testState)).toBe('token');
    expect(AuthState.isAuthenticated(testState)).toBe(true);
    expect(AuthState.loading(testState)).toBe(true);
    expect(AuthState.error(testState)).toBe('bad');
  });

  it('login success updates state and schedules refresh', () => {
    const { ctx, latest } = createContext();
    const expiration = new Date(Date.now() + 60_000).toISOString();
    api.login.mockReturnValue(
      of({
        accessToken: 'abc',
        accessTokenExpiresAt: expiration,
        user: { id: 'user-1' } as any,
      }),
    );

    state.login(ctx, new Login({ email: 'a', password: 'b' })).subscribe();

    expect(latest()).toMatchObject({
      accessToken: 'abc',
      accessTokenExpiresAt: expiration,
      user: { id: 'user-1' },
      loading: false,
      error: null,
    });

    jest.runOnlyPendingTimers();
    expect(ctx.dispatch).toHaveBeenCalledWith(new Refresh());
  });

  it('login handles errors and stores message', () => {
    const { ctx, latest } = createContext({ loading: true });
    api.login.mockReturnValue(
      throwError(() => ({ error: { message: ['Bad credentials'] } })),
    );

    state.login(ctx, new Login({ email: 'x', password: 'y' })).subscribe();

    expect(latest()).toMatchObject({
      loading: false,
      error: 'Bad credentials',
    });
  });

  it('login error maps string messages', () => {
    const { ctx, latest } = createContext({ loading: true });
    api.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Bad credentials' } })),
    );

    state.login(ctx, new Login({ email: 'x', password: 'y' })).subscribe();
    expect(latest().error).toBe('Bad credentials');
  });

  it('login fallback message handles missing error payload', () => {
    const { ctx, latest } = createContext({ loading: true });
    api.login.mockReturnValue(throwError(() => undefined));

    state.login(ctx, new Login({ email: 'x', password: 'y' })).subscribe();
    expect(latest().error).toBe('Login failed');
  });

  it('login with missing token triggers error path', () => {
    const { ctx, latest } = createContext();
    api.login.mockReturnValue(
      of({ user: { id: 'user-1' }, accessToken: null } as any),
    );

    state.login(ctx, new Login({ email: 'a', password: 'b' })).subscribe();
    expect(latest().error).toBe('Login failed');
    expect(latest().loading).toBe(false);
  });

  it('refresh success patches state and reschedules', () => {
    const { ctx, latest } = createContext({
      user: { id: 'old' } as any,
      accessToken: 'oldToken',
    });
    const expiration = new Date(Date.now() + 120_000).toISOString();
    api.refresh.mockReturnValue(
      of({
        accessToken: 'newToken',
        accessTokenExpiresAt: expiration,
        user: { id: 'new' } as any,
      }),
    );

    state.refresh(ctx).subscribe();
    expect(latest()).toMatchObject({
      user: { id: 'new' },
      accessToken: 'newToken',
      accessTokenExpiresAt: expiration,
      error: null,
    });
    jest.runOnlyPendingTimers();
    expect(ctx.dispatch).toHaveBeenCalledWith(new Refresh());
  });

  it('refresh failure resets state and clears timer', () => {
    const { ctx, latest } = createContext({
      user: { id: 'existing' } as any,
      accessToken: 't',
      accessTokenExpiresAt: '2024-01-01T00:01:00Z',
    });
    (state as any).refreshTimerId = setTimeout(() => {}, 1_000);
    api.refresh.mockReturnValue(throwError(() => new Error('boom')));

    state.refresh(ctx).subscribe();
    expect(latest()).toEqual(initialAuthState);
    expect((state as any).refreshTimerId).toBeNull();
  });

  it('refresh failure without timer still resets state', () => {
    const { ctx, latest } = createContext({
      user: { id: 'existing' } as any,
      accessToken: 't',
    });
    (state as any).refreshTimerId = null;
    api.refresh.mockReturnValue(throwError(() => new Error('boom')));

    state.refresh(ctx).subscribe();
    expect(latest()).toEqual(initialAuthState);
  });

  it('refresh catch handles missing clearTimeout', () => {
    const { ctx, latest } = createContext({
      user: { id: 'existing' } as any,
      accessToken: 't',
    });
    const originalClear = (globalThis as any).clearTimeout;
    (state as any).refreshTimerId = setTimeout(() => {}, 500);
    (globalThis as any).clearTimeout = undefined;
    api.refresh.mockReturnValue(throwError(() => new Error('boom')));

    state.refresh(ctx).subscribe();
    expect(latest()).toEqual(initialAuthState);
    (globalThis as any).clearTimeout = originalClear;
  });

  it('refresh with invalid payload resets state', () => {
    const { ctx, latest } = createContext({
      user: { id: 'existing' } as any,
      accessToken: 't',
    });
    api.refresh.mockReturnValue(of({ user: { id: 'existing' } } as any));

    state.refresh(ctx).subscribe();
    expect(latest()).toEqual(initialAuthState);
  });

  it('me handles success and error without throwing', () => {
    api.me
      .mockReturnValueOnce(of({ userId: '1' }))
      .mockReturnValueOnce(throwError(() => new Error('fail')));

    expect(() =>
      state.me(createContext().ctx as any).subscribe(),
    ).not.toThrow();

    expect(() =>
      state.me(createContext().ctx as any).subscribe(),
    ).not.toThrow();

    expect(api.me).toHaveBeenCalledTimes(2);
  });

  it('logout clears state on success and failure', () => {
    const timersCleared = jest.spyOn(global, 'clearTimeout');
    const { ctx, latest } = createContext({
      user: { id: 'user' } as any,
      accessToken: 'token',
    });
    (state as any).refreshTimerId = setTimeout(() => {}, 5_000);
    api.logout.mockReturnValueOnce(of({ ok: true }));

    state.logout(ctx).subscribe();
    expect(latest()).toEqual(initialAuthState);
    expect((state as any).refreshTimerId).toBeNull();

    (state as any).refreshTimerId = setTimeout(() => {}, 5_000);
    api.logout.mockReturnValueOnce(throwError(() => new Error('fail')));
    state.logout(ctx).subscribe();
    expect(latest()).toEqual(initialAuthState);
    expect(timersCleared).toHaveBeenCalled();
  });

  it('handles loginSuccess, loginFailed and clearError helpers', () => {
    const { ctx, latest } = createContext();
    const expiration = new Date(Date.now() + 45_000).toISOString();

    (state as any).refreshTimerId = setTimeout(() => {}, 1_000);
    state.loginSuccess(
      ctx,
      new LoginSuccess({
        accessToken: 'abc',
        accessTokenExpiresAt: expiration,
        user: { id: '1' } as any,
      }),
    );
    expect(latest()).toMatchObject({
      accessToken: 'abc',
      accessTokenExpiresAt: expiration,
      user: { id: '1' },
      loading: false,
      error: null,
    });
    expect((state as any).refreshTimerId).not.toBeNull();

    state.loginFailed(ctx, new LoginFailed('nope'));
    expect(latest().error).toBe('nope');
    expect(latest().loading).toBe(false);

    // call again with no expiration to cover early return branch
    (state as any).refreshTimerId = setTimeout(() => {}, 1_000);
    state.loginSuccess(
      ctx,
      new LoginSuccess({
        accessToken: 'abc',
        accessTokenExpiresAt: null as any,
        user: { id: '1' } as any,
      }),
    );
    expect((state as any).refreshTimerId).toBeNull();

    state.clearError(ctx, new ClearError());
    expect(latest().error).toBeNull();
  });

  it('ngOnDestroy clears active refresh timers', () => {
    const originalClear = (global as any).clearTimeout;
    const timersCleared = jest.fn();
    (global as any).clearTimeout = timersCleared as any;
    (state as any).refreshTimerId = setTimeout(() => {}, 1_000);
    state.ngOnDestroy();
    expect(timersCleared).toHaveBeenCalled();
    (global as any).clearTimeout = originalClear;
  });
});
