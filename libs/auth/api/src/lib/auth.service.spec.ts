import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let userService: any;
  let tokensService: any;
  let refreshService: any;
  let service: AuthService;

  beforeEach(() => {
    userService = {
      validatePassword: jest.fn(),
      updateUser: jest.fn(),
      findById: jest.fn(),
    };
    tokensService = {
      signAccess: jest.fn(),
      signRefresh: jest.fn(),
    };
    refreshService = {
      persist: jest.fn(),
      validateAndGet: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      rotate: jest.fn(),
    };
    service = new AuthService(
      userService as any,
      tokensService as any,
      refreshService as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs in a user with valid credentials', async () => {
    const user = {
      id: 'u1',
      email: 'user@test.com',
      tenantId: 't1',
      role: 'ADMIN',
      isActive: true,
    };
    userService.validatePassword.mockResolvedValue(user);
    tokensService.signAccess.mockReturnValue({
      token: 'at',
      expiresAt: new Date(1_000),
    });
    tokensService.signRefresh.mockReturnValue({
      token: 'rt',
      jti: 'j1',
      expiresAt: new Date(2_000),
    });

    const result = await service.login(
      'user@test.com',
      'pass',
      '1.1.1.1',
      'UA',
    );

    expect(userService.validatePassword).toHaveBeenCalledWith(
      'user@test.com',
      'pass',
    );
    expect(refreshService.persist).toHaveBeenCalledWith(
      'u1',
      't1',
      'rt',
      'j1',
      new Date(2_000),
    );
    expect(userService.updateUser).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { lastLoginAt: expect.any(Date) },
    });
    expect(result).toEqual({
      user,
      access: { token: 'at', expiresAt: new Date(1_000) },
      refresh: { token: 'rt', jti: 'j1', expiresAt: new Date(2_000) },
    });
  });

  it('rejects invalid login', async () => {
    userService.validatePassword.mockResolvedValue(null);
    const warnSpy = jest.spyOn(service['logger'], 'warn').mockImplementation();

    await expect(service.login('bad@test.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(refreshService.persist).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('rejects refresh with mismatched token and revokes all tokens', async () => {
    refreshService.validateAndGet.mockResolvedValue({
      status: 'mismatch',
      token: { userId: 'u1' },
    });
    const warnSpy = jest.spyOn(service['logger'], 'warn').mockImplementation();

    await expect(
      service.refreshTokens('u1', 'j1', 'rt', '2.2.2.2', 'UA2'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(refreshService.revokeAllUserTokens).toHaveBeenCalledWith(
      'u1',
      'token-reuse',
      '2.2.2.2',
    );
    expect(warnSpy).toHaveBeenCalled();
  });

  it('rejects refresh for expired token without revoking others', async () => {
    refreshService.validateAndGet.mockResolvedValue({
      status: 'expired',
      token: { userId: 'u1' },
    });

    await expect(
      service.refreshTokens('u1', 'j1', 'rt'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(refreshService.revokeAllUserTokens).not.toHaveBeenCalled();
  });

  it('rejects refresh when user is inactive', async () => {
    refreshService.validateAndGet.mockResolvedValue({
      status: 'valid',
      token: { userId: 'u1' },
    });
    userService.findById.mockResolvedValue({ id: 'u1', isActive: false });
    const warnSpy = jest.spyOn(service['logger'], 'warn').mockImplementation();

    await expect(
      service.refreshTokens('u1', 'j1', 'rt'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('refreshes tokens and rotates stored refresh token', async () => {
    const user = {
      id: 'u1',
      email: 'a@test.com',
      tenantId: 't1',
      role: 'USER',
      isActive: true,
      avatar: null,
    };
    refreshService.validateAndGet.mockResolvedValue({
      status: 'valid',
      token: { userId: 'u1' },
    });
    userService.findById.mockResolvedValue(user);
    tokensService.signAccess.mockReturnValue({
      token: 'new-at',
      expiresAt: new Date(1_000),
    });
    tokensService.signRefresh.mockReturnValue({
      token: 'new-rt',
      jti: 'new-jti',
      expiresAt: new Date(2_000),
    });

    const result = await service.refreshTokens(
      'u1',
      'old-jti',
      'old-rt',
      '3.3.3.3',
      'UA3',
    );

    expect(tokensService.signAccess).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'a@test.com',
      tenantId: 't1',
      role: 'USER',
    });
    expect(refreshService.rotate).toHaveBeenCalledWith('old-jti', {
      token: 'new-rt',
      jti: 'new-jti',
      expiresAt: new Date(2_000),
    });
    expect(result).toEqual({
      user,
      access: { token: 'new-at', expiresAt: new Date(1_000) },
      refresh: { token: 'new-rt', jti: 'new-jti', expiresAt: new Date(2_000) },
    });
  });

  it('logs out users by revoking tokens', async () => {
    refreshService.revokeAllUserTokens.mockResolvedValue({ count: 1 });

    const result = await service.logout('u1', '4.4.4.4');

    expect(refreshService.revokeAllUserTokens).toHaveBeenCalledWith(
      'u1',
      'logout',
      '4.4.4.4',
    );
    expect(result).toEqual({ ok: true });
  });
});
