import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { Role } from 'generated/prisma/enums';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
  const originalEnv = process.env;
  const now = new Date('2024-01-01T00:00:00Z').getTime();
  let jwt: any;
  let service: TokensService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.spyOn(Date, 'now').mockReturnValue(now);
    jwt = { sign: jest.fn() };
    service = new TokensService(jwt as unknown as JwtService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('signs access tokens with defaults and role fallback', () => {
    process.env.JWT_ACCESS_TTL = '10s';
    process.env.JWT_ACCESS_SECRET = 'access-secret';
    process.env.JWT_AUDIENCE = 'aud';
    process.env.JWT_ISSUER = 'issuer';
    jwt.sign.mockReturnValue('access-token');

    const result = service.signAccess({ sub: '1', email: 'a@test.com', role: undefined as any });

    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: '1', email: 'a@test.com', role: Role.USER, type: 'access' },
      expect.objectContaining({
        secret: 'access-secret',
        expiresIn: 10,
        audience: 'aud',
        issuer: 'issuer',
        algorithm: 'HS512',
      }),
    );
    expect(result.token).toBe('access-token');
    expect(result.expiresAt.toISOString()).toBe(new Date(now + 10_000).toISOString());
  });

  it('signs refresh tokens with generated jti', () => {
    process.env.JWT_REFRESH_TTL = '2h';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
    process.env.JWT_AUDIENCE = 'aud';
    process.env.JWT_ISSUER = 'issuer';
    jwt.sign.mockReturnValue('refresh-token');

    const result = service.signRefresh('user-1');

    const [payload, options] = jwt.sign.mock.calls[0];
    expect(payload).toEqual({ sub: 'user-1', jti: result.jti, type: 'refresh' });
    expect(options).toEqual(
      expect.objectContaining({
        secret: 'refresh-secret',
        expiresIn: 7200,
        audience: 'aud',
        issuer: 'issuer',
        algorithm: 'HS512',
      }),
    );
    expect(result.jti).toMatch(/^[a-f0-9-]{36}$/i);
    expect(result.token).toBe('refresh-token');
    expect(result.expiresAt.toISOString()).toBe(new Date(now + 7_200_000).toISOString());
  });
});
