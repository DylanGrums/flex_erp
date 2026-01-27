import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      algorithms: ['HS512'],
    });
  }
  async validate(payload: any) {
    if (payload.type !== 'access') return false;
    const role = payload.role ?? payload.roles;
    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: role,
      role,
    };
  }
}
