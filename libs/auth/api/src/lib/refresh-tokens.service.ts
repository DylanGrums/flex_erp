import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthSession } from 'generated/prisma/client';
import { AUTH_PRISMA, AuthPrismaClient } from './auth-api.tokens';

@Injectable()
export class RefreshTokensService {
  constructor(@Inject(AUTH_PRISMA) private prisma: AuthPrismaClient) {}

  async persist(
    userId: string,
    tenantId: string,
    token: string,
    jti: string,
    expiresAt: Date,
  ) {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const hashedToken = await bcrypt.hash(token, rounds);
    return this.prisma.authSession.create({
      data: {
        id: jti,
        tenantId,
        userId,
        refreshTokenHash: hashedToken,
        expiresAt,
      },
    });
  }

  async validateAndGet(
    jti: string,
    rawToken: string,
  ): Promise<{
    status: 'valid' | 'expired' | 'mismatch' | 'not_found';
    token?: AuthSession;
  }> {
    const session = await this.prisma.authSession.findUnique({
      where: { id: jti },
    });
    if (!session) return { status: 'not_found' };
    if (session.expiresAt < new Date())
      return { status: 'expired', token: session };
    const ok = await bcrypt.compare(rawToken, session.refreshTokenHash);
    return ok
      ? { status: 'valid', token: session }
      : { status: 'mismatch', token: session };
  }

  async rotate(
    oldJti: string,
    newToken: { token: string; jti: string; expiresAt: Date },
  ) {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const hashedToken = await bcrypt.hash(newToken.token, rounds);
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.authSession.findUnique({ where: { id: oldJti } });
      if (!old) throw new Error('Refresh token already used or invalid');
      await tx.authSession.delete({ where: { id: oldJti } });
      return tx.authSession.create({
        data: {
          id: newToken.jti,
          tenantId: old.tenantId,
          userId: old.userId,
          refreshTokenHash: hashedToken,
          expiresAt: newToken.expiresAt,
        },
      });
    });
  }

  async revokeAllUserTokens(userId: string, reason = 'logout', ip?: string) {
    await this.prisma.authSession.deleteMany({
      where: { userId },
    });
  }
}
