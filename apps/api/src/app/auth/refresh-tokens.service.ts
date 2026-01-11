import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshToken } from 'generated/prisma/client';

@Injectable()
export class RefreshTokensService {
  constructor(private prisma: PrismaService) { }

  async persist(userId: string, token: string, jti: string, expiresAt: Date, createdByIp?: string, userAgent?: string) {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const hashedToken = await bcrypt.hash(token, rounds);
    return this.prisma.refreshToken.create({
      data: { userId, jti, hashedToken, expiresAt, createdByIp, userAgent },
    });
  }

  async validateAndGet(jti: string, rawToken: string): Promise<{ status: 'valid' | 'revoked' | 'expired' | 'mismatch' | 'not_found'; token?: RefreshToken }> {
    const rt = await this.prisma.refreshToken.findUnique({ where: { jti } });
    if (!rt) return { status: 'not_found' };
    if (rt.revokedAt) return { status: 'revoked', token: rt };
    if (rt.expiresAt < new Date()) return { status: 'expired', token: rt };
    const ok = await bcrypt.compare(rawToken, rt.hashedToken);
    return ok ? { status: 'valid', token: rt } : { status: 'mismatch', token: rt };
  }

  async rotate(oldJti: string, newToken: { token: string; jti: string; expiresAt: Date }, ip?: string, userAgent?: string) {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const hashedToken = await bcrypt.hash(newToken.token, rounds);
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.refreshToken.findUnique({ where: { jti: oldJti } });
      if (!old || old.revokedAt) throw new Error('Refresh token already used or invalid');
      await tx.refreshToken.update({
        where: { jti: oldJti },
        data: { revokedAt: new Date(), revokedByIp: ip, replacedByToken: newToken.jti, reasonRevoked: 'rotated' },
      });
      return tx.refreshToken.create({
        data: {
          userId: old.userId,
          jti: newToken.jti,
          hashedToken,
          expiresAt: newToken.expiresAt,
          createdByIp: ip,
          userAgent,
        },
      });
    });
  }

  async revokeAllUserTokens(userId: string, reason = 'logout', ip?: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp: ip, reasonRevoked: reason },
    });
  }
}
