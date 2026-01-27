import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const originalEnv = process.env;
  let auth: any;
  let controller: AuthController;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_REFRESH_TTL: '10s',
      API_PREFIX: 'api',
      NODE_ENV: 'production',
    };
    auth = {
      login: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
    } as unknown as AuthService;
    controller = new AuthController(auth as AuthService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('rejects login without email or password', async () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
    const req = { headers: {}, ip: '1.1.1.1' } as any;

    await expect(
      controller.login({ email: '', password: '' } as any, req, res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs in and sets refresh cookie', async () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
    const req = { headers: { 'user-agent': 'UA' }, ip: '1.1.1.1' } as any;
    const expiresAt = new Date('2024-01-01T00:00:00Z');
    auth.login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'u@test.com',
        tenantId: 't1',
        role: 'ADMIN',
        avatar: null,
      },
      access: { token: 'at', expiresAt },
      refresh: { token: 'rt' },
    });

    const result = await controller.login(
      { email: 'u@test.com', password: 'pass' },
      req,
      res,
    );

    expect(auth.login).toHaveBeenCalledWith(
      'u@test.com',
      'pass',
      '1.1.1.1',
      'UA',
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'rt',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/api/auth/refresh',
        maxAge: 10_000,
      }),
    );
    expect(result).toEqual({
      accessToken: 'at',
      accessTokenExpiresAt: expiresAt,
      user: {
        id: 'u1',
        email: 'u@test.com',
        tenantId: 't1',
        role: 'ADMIN',
        avatar: null,
      },
    });
  });

  it('rejects refresh when token missing', async () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
    const req = {
      refresh: { token: undefined },
      headers: {},
      ip: '1.1.1.1',
    } as any;

    await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refreshes tokens and updates cookie', async () => {
    process.env.NODE_ENV = 'development';
    const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
    const req = {
      refresh: { token: 'rt', jti: 'j1', userId: 'u1' },
      headers: { 'user-agent': 'UA2' },
      ip: '2.2.2.2',
    } as any;
    const expiresAt = new Date('2024-02-02T00:00:00Z');
    auth.refreshTokens.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'u@test.com',
        tenantId: 't1',
        role: 'USER',
        avatar: null,
      },
      access: { token: 'new-at', expiresAt },
      refresh: { token: 'new-rt' },
    });

    const result = await controller.refresh(req, res);

    expect(auth.refreshTokens).toHaveBeenCalledWith(
      'u1',
      'j1',
      'rt',
      '2.2.2.2',
      'UA2',
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'new-rt',
      expect.objectContaining({
        secure: false,
        sameSite: 'strict',
        path: '/api/auth/refresh',
      }),
    );
    expect(result).toEqual({
      accessToken: 'new-at',
      accessTokenExpiresAt: expiresAt,
      user: {
        id: 'u1',
        email: 'u@test.com',
        tenantId: 't1',
        role: 'USER',
        avatar: null,
      },
    });
  });

  it('logs out and clears refresh cookie', async () => {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;
    const req = { ip: '3.3.3.3' } as any;
    auth.logout.mockResolvedValue({ ok: true });

    const result = await controller.logout({ id: 'u1' } as any, res, req);

    expect(auth.logout).toHaveBeenCalledWith('u1', '3.3.3.3');
    expect(res.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.objectContaining({ httpOnly: true, path: '/api/auth/refresh' }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('returns current user from me route', () => {
    const user = {
      id: 'u1',
      email: 'u@test.com',
      tenantId: 't1',
      roles: 'ADMIN',
      avatar: 'a',
    };
    expect(controller.me(user as any)).toEqual({
      id: 'u1',
      email: 'u@test.com',
      tenantId: 't1',
      role: 'ADMIN',
      avatar: 'a',
    });
  });
});
