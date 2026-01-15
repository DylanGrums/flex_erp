import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_PRISMA, AuthPrismaClient } from '../auth-api.tokens';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_PRISMA) private prisma: AuthPrismaClient) { }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const ident = req.user as { userId: string } | undefined;
    if (!ident?.userId) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: ident.userId } });
    if (!user || !user.isActive) throw new UnauthorizedException();
    req.user = { id: user.id, email: user.email, roles: user.role, avatar: user.avatar, isActive: user.isActive };
    (req as any).fullUser = user;
    return true;
  }
}
