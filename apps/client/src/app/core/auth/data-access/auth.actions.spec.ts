import {
  Login,
  LoginSuccess,
  LoginFailed,
  LoadMe,
  Refresh,
  Logout,
  ClearError,
} from './auth.actions';

describe('Auth Actions', () => {
  it('should create login related actions with correct payloads', () => {
    const login = new Login({ email: 'user@test.com', password: 'pass' });
    expect(Login.type).toBe('[Auth] Login');
    expect(login.payload).toEqual({ email: 'user@test.com', password: 'pass' });

    const success = new LoginSuccess({
      accessToken: 't',
      accessTokenExpiresAt: '2024-01-01T00:00:00Z',
      user: { id: '1' } as any,
    });
    expect(LoginSuccess.type).toBe('[Auth] Login Success');
    expect(success.payload.user).toEqual({ id: '1' });

    const failed = new LoginFailed('oops');
    expect(LoginFailed.type).toBe('[Auth] Login Failed');
    expect(failed.error).toBe('oops');
  });

  it('should create auxiliary actions with correct static types', () => {
    expect(new LoadMe()).toBeInstanceOf(LoadMe);
    expect(LoadMe.type).toBe('[Auth] Load Me');

    expect(new Refresh()).toBeInstanceOf(Refresh);
    expect(Refresh.type).toBe('[Auth] Refresh');

    expect(new Logout()).toBeInstanceOf(Logout);
    expect(Logout.type).toBe('[Auth] Logout');

    expect(new ClearError()).toBeInstanceOf(ClearError);
    expect(ClearError.type).toBe('[Auth] Clear Error');
  });
});
