import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_PRISMA, AuthPrismaClient } from '../auth-api.tokens';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_PRISMA) private prisma: AuthPrismaClient) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const ident = req.user as { userId: string } | undefined;
    if (!ident?.userId) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({
      where: { id: ident.userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException();
    if (!user.tenantId) throw new UnauthorizedException();
    const role = user.roles?.[0]?.role?.key ?? 'USER';
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles: role,
      role,
      avatar: null,
      isActive: true,
    };
    (req as any).fullUser = user;
    return true;
  }
}
