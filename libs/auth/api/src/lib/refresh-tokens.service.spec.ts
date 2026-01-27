import * as bcrypt from 'bcrypt';
import { RefreshTokensService } from './refresh-tokens.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn((value: string) => Promise.resolve(`hashed-${value}`)),
  compare: jest.fn((value: string, hashed: string) =>
    Promise.resolve(hashed === `hashed-${value}`),
  ),
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
      authSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
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
    prisma.authSession.create.mockResolvedValue({ id: 'jti-1' });

    const result = await service.persist(
      'user-1',
      'tenant-1',
      'raw-token',
      'jti-1',
      expiresAt,
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('raw-token', 8);
    expect(prisma.authSession.create).toHaveBeenCalledWith({
      data: {
        id: 'jti-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        refreshTokenHash: 'hashed-raw-token',
        expiresAt,
      },
    });
    expect(result).toEqual({ id: 'jti-1' });
  });

  it('returns proper status for validation outcomes', async () => {
    prisma.authSession.findUnique.mockResolvedValueOnce(null);
    expect(await service.validateAndGet('missing', 'token')).toEqual({
      status: 'not_found',
    });

    const expired = {
      id: 'j2',
      userId: 'u2',
      refreshTokenHash: 'hashed-b',
      expiresAt: new Date(now - 1_000),
    };
    prisma.authSession.findUnique.mockResolvedValueOnce(expired);
    expect(await service.validateAndGet('expired', 'token')).toEqual({
      status: 'expired',
      token: expired,
    });

    const mismatch = {
      id: 'j3',
      userId: 'u3',
      refreshTokenHash: 'hashed-other',
      expiresAt: new Date(now + 10_000),
    };
    prisma.authSession.findUnique.mockResolvedValueOnce(mismatch);
    jest.mocked(bcrypt.compare).mockResolvedValueOnce(false);
    expect(await service.validateAndGet('j3', 'token')).toEqual({
      status: 'mismatch',
      token: mismatch,
    });

    const valid = {
      id: 'j4',
      userId: 'u4',
      refreshTokenHash: 'hashed-token',
      expiresAt: new Date(now + 10_000),
    };
    prisma.authSession.findUnique.mockResolvedValueOnce(valid);
    jest.mocked(bcrypt.compare).mockResolvedValueOnce(true);
    expect(await service.validateAndGet('j4', 'token')).toEqual({
      status: 'valid',
      token: valid,
    });
  });

  it('rotates tokens atomically', async () => {
    const tx = {
      authSession: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ userId: 'u1', tenantId: 't1' }),
        delete: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'new-jti' }),
      },
    };
    prisma.$transaction.mockImplementation((cb: any) => cb(tx));
    const expiresAt = new Date(now + 20_000);

    const result = await service.rotate('old-jti', {
      token: 'new-token',
      jti: 'new-jti',
      expiresAt,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('new-token', 12);
    expect(tx.authSession.delete).toHaveBeenCalledWith({
      where: { id: 'old-jti' },
    });
    expect(tx.authSession.create).toHaveBeenCalledWith({
      data: {
        id: 'new-jti',
        tenantId: 't1',
        userId: 'u1',
        refreshTokenHash: 'hashed-new-token',
        expiresAt,
      },
    });
    expect(result).toEqual({ id: 'new-jti' });
  });

  it('throws when rotating an already used token', async () => {
    const tx = {
      authSession: {
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
        create: jest.fn(),
      },
    };
    prisma.$transaction.mockImplementation((cb: any) => cb(tx));

    await expect(
      service.rotate('old', {
        token: 'n',
        jti: 'next',
        expiresAt: new Date(now + 1000),
      }),
    ).rejects.toThrow('Refresh token already used or invalid');
  });

  it('revokes all user tokens', async () => {
    prisma.authSession.deleteMany.mockResolvedValue({ count: 3 });

    await service.revokeAllUserTokens('user-1', 'logout', '3.3.3.3');

    expect(prisma.authSession.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });
});
