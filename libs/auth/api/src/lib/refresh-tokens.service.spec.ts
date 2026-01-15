import * as bcrypt from 'bcrypt';
import { RefreshTokensService } from './refresh-tokens.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn((value: string) => Promise.resolve(`hashed-${value}`)),
  compare: jest.fn((value: string, hashed: string) => Promise.resolve(hashed === `hashed-${value}`)),
}));

describe('RefreshTokensService', () => {
  const originalEnv = process.env;
  const now = new Date('2024-01-01T00:00:00Z').getTime();
  let prisma: any;
  let service: RefreshTokensService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.useFakeTimers().setSystemTime(now);
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new RefreshTokensService(prisma as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('persists hashed refresh tokens', async () => {
    process.env.BCRYPT_ROUNDS = '8';
    const expiresAt = new Date(now + 1_000);
    prisma.refreshToken.create.mockResolvedValue({ id: 'rt1' });

    const result = await service.persist('user-1', 'raw-token', 'jti-1', expiresAt, '1.1.1.1', 'UA');

    expect(bcrypt.hash).toHaveBeenCalledWith('raw-token', 8);
    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        jti: 'jti-1',
        hashedToken: 'hashed-raw-token',
        expiresAt,
        createdByIp: '1.1.1.1',
        userAgent: 'UA',
      },
    });
    expect(result).toEqual({ id: 'rt1' });
  });

  it('returns proper status for validation outcomes', async () => {
    prisma.refreshToken.findUnique.mockResolvedValueOnce(null);
    expect(await service.validateAndGet('missing', 'token')).toEqual({ status: 'not_found' });

    const revoked = { jti: 'j1', userId: 'u1', hashedToken: 'hashed-a', expiresAt: new Date(now + 1_000), revokedAt: new Date() };
    prisma.refreshToken.findUnique.mockResolvedValueOnce(revoked);
    expect(await service.validateAndGet('revoked', 'token')).toEqual({ status: 'revoked', token: revoked });

    const expired = { jti: 'j2', userId: 'u2', hashedToken: 'hashed-b', expiresAt: new Date(now - 1_000), revokedAt: null };
    prisma.refreshToken.findUnique.mockResolvedValueOnce(expired);
    expect(await service.validateAndGet('expired', 'token')).toEqual({ status: 'expired', token: expired });

    const mismatch = { jti: 'j3', userId: 'u3', hashedToken: 'hashed-other', expiresAt: new Date(now + 10_000), revokedAt: null };
    prisma.refreshToken.findUnique.mockResolvedValueOnce(mismatch);
    jest.mocked(bcrypt.compare).mockResolvedValueOnce(false);
    expect(await service.validateAndGet('j3', 'token')).toEqual({ status: 'mismatch', token: mismatch });

    const valid = { jti: 'j4', userId: 'u4', hashedToken: 'hashed-token', expiresAt: new Date(now + 10_000), revokedAt: null };
    prisma.refreshToken.findUnique.mockResolvedValueOnce(valid);
    jest.mocked(bcrypt.compare).mockResolvedValueOnce(true);
    expect(await service.validateAndGet('j4', 'token')).toEqual({ status: 'valid', token: valid });
  });

  it('rotates tokens atomically', async () => {
    const tx = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({ userId: 'u1', revokedAt: null }),
        update: jest.fn(),
        create: jest.fn().mockResolvedValue({ jti: 'new-jti' }),
      },
    };
    prisma.$transaction.mockImplementation((cb: any) => cb(tx));
    const expiresAt = new Date(now + 20_000);

    const result = await service.rotate('old-jti', { token: 'new-token', jti: 'new-jti', expiresAt }, '2.2.2.2', 'UA2');

    expect(bcrypt.hash).toHaveBeenCalledWith('new-token', 12);
    expect(tx.refreshToken.update).toHaveBeenCalledWith({
      where: { jti: 'old-jti' },
      data: {
        revokedAt: expect.any(Date),
        revokedByIp: '2.2.2.2',
        replacedByToken: 'new-jti',
        reasonRevoked: 'rotated',
      },
    });
    expect(tx.refreshToken.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        jti: 'new-jti',
        hashedToken: 'hashed-new-token',
        expiresAt,
        createdByIp: '2.2.2.2',
        userAgent: 'UA2',
      },
    });
    expect(result).toEqual({ jti: 'new-jti' });
  });

  it('throws when rotating an already used token', async () => {
    const tx = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({ revokedAt: new Date() }),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
    prisma.$transaction.mockImplementation((cb: any) => cb(tx));

    await expect(
      service.rotate('old', { token: 'n', jti: 'next', expiresAt: new Date(now + 1000) }),
    ).rejects.toThrow('Refresh token already used or invalid');
  });

  it('revokes all user tokens', async () => {
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

    await service.revokeAllUserTokens('user-1', 'logout', '3.3.3.3');

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date), revokedByIp: '3.3.3.3', reasonRevoked: 'logout' },
    });
  });
});
