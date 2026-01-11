import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { RefreshJwtGuard } from './refresh.guard';

describe('JwtAuthGuard', () => {
  const makeContext = (req: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext);

  it('throws when no user is present on request', async () => {
    const prisma = { user: { findUnique: jest.fn() } };
    const guard = new JwtAuthGuard(prisma as any);
    await expect(guard.canActivate(makeContext({}))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when user is not active or missing', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ isActive: false }) } };
    const guard = new JwtAuthGuard(prisma as any);
    const req = { user: { userId: 'u1' } };

    await expect(guard.canActivate(makeContext(req))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('attaches sanitized user data on success', async () => {
    const dbUser = { id: 'u1', email: 'a@test.com', role: 'ADMIN', avatar: 'av', isActive: true };
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(dbUser) } };
    const guard = new JwtAuthGuard(prisma as any);
    const req: any = { user: { userId: 'u1' } };

    const result = await guard.canActivate(makeContext(req));

    expect(result).toBe(true);
    expect(req.user).toEqual({ id: 'u1', email: 'a@test.com', roles: 'ADMIN', avatar: 'av', isActive: true });
    expect(req.fullUser).toEqual(dbUser);
  });

  it('constructs other passport guards', () => {
    expect(() => new LocalAuthGuard()).not.toThrow();
    expect(() => new RefreshJwtGuard()).not.toThrow();
  });
});
