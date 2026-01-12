import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { parseDuration } from '../../common/utils/duration';
import { Role } from 'generated/prisma/enums';
export type AccessPayload = { sub: string; email: string; role: Role; type: 'access' };
export type RefreshPayload = { sub: string; jti: string; type: 'refresh' };

@Injectable()
export class TokensService {
  constructor(private jwt: JwtService) { }

  signAccess(payload: { sub: string; email: string; role: Role }) {
    const primaryRole = payload.role ?? Role.USER;
    const p: AccessPayload = { ...payload, role: primaryRole, type: 'access' };

    const accessTtl = process.env.JWT_ACCESS_TTL ?? '15m';
    const accessMs = parseDuration(accessTtl);
    const accessSec = Math.max(1, Math.floor(accessMs / 1000));

    const token = this.jwt.sign(p, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: accessSec,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      algorithm: 'HS512',
    });

    return {
      token,
      expiresAt: new Date(Date.now() + accessMs),
    };
  }

  signRefresh(sub: string) {
    const jti = randomUUID();
    const payload: RefreshPayload = { sub, jti, type: 'refresh' };

    const refreshTtl = process.env.JWT_REFRESH_TTL ?? '30d';
    const refreshMs = parseDuration(refreshTtl);
    const refreshSec = Math.max(1, Math.floor(refreshMs / 1000));

    const token = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: refreshSec,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      algorithm: 'HS512',
    });

    return {
      jti,
      token,
      expiresAt: new Date(Date.now() + refreshMs),
    };
  }
}
