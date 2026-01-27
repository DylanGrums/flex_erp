import { JwtStrategy } from './jwt.strategy';
import { RefreshStrategy } from './refresh.strategy';

describe('Passport strategies', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_AUDIENCE: 'aud',
      JWT_ISSUER: 'iss',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('validates access tokens in JwtStrategy', async () => {
    const strategy = new JwtStrategy();
    await expect(strategy.validate({ type: 'unknown' } as any)).resolves.toBe(false);

    const payload = await strategy.validate({
      type: 'access',
      sub: 'u1',
      email: 'a@test.com',
      tenantId: 't1',
      roles: 'ADMIN',
      role: 'ADMIN',
    } as any);
    expect(payload).toEqual({
      userId: 'u1',
      email: 'a@test.com',
      tenantId: 't1',
      roles: 'ADMIN',
      role: 'ADMIN',
    });
  });

  it('validates refresh tokens in RefreshStrategy using cookies', async () => {
    const strategy = new RefreshStrategy();
    const req: any = { cookies: { refresh_token: 'cookie-rt' }, body: { refresh_token: 'body-rt' } };

    const payload = await strategy.validate(req, { type: 'refresh', sub: 'u1', jti: 'j1' } as any);

    expect(payload).toEqual({ userId: 'u1' });
    expect(req.refresh).toEqual({ token: 'cookie-rt', jti: 'j1', userId: 'u1' });
  });

  it('falls back to body refresh token when cookie missing', async () => {
    const strategy = new RefreshStrategy();
    const req: any = { cookies: {}, body: { refresh_token: 'body-rt' } };

    const payload = await strategy.validate(req, { type: 'refresh', sub: 'u2', jti: 'j2' } as any);

    expect(payload).toEqual({ userId: 'u2' });
    expect(req.refresh).toEqual({ token: 'body-rt', jti: 'j2', userId: 'u2' });
  });

  it('rejects non-refresh payloads in RefreshStrategy', async () => {
    const strategy = new RefreshStrategy();
    const result = await strategy.validate({ cookies: {}, body: {} } as any, { type: 'access' } as any);
    expect(result).toBe(false);
  });

  it('handles refresh payload when no token present', async () => {
    const strategy = new RefreshStrategy();
    const req: any = { cookies: {}, body: {} };

    const payload = await strategy.validate(req, { type: 'refresh', sub: 'u3', jti: 'j3' } as any);

    expect(payload).toEqual({ userId: 'u3' });
    expect(req.refresh).toEqual({ token: null, jti: 'j3', userId: 'u3' });
  });
});
