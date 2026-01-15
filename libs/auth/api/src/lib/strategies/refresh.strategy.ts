import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

function cookieExtractor(req: Request) {
  return req.cookies?.['refresh_token'] ?? null;
}
function bodyExtractor(req: Request) {
  return (req.body && req.body.refresh_token) || null;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, bodyExtractor]),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      passReqToCallback: true,
      algorithms: ['HS512'],
    });
  }

  async validate(req: Request, payload: any) {
    // payload: { sub, jti, type:'refresh' }
    if (payload.type !== 'refresh') return false;
    const token = cookieExtractor(req) ?? bodyExtractor(req);
    // attach to request so controller can call AuthService.refreshTokens(...)
    (req as any).refresh = { token, jti: payload.jti, userId: payload.sub };
    return { userId: payload.sub };
  }
}
