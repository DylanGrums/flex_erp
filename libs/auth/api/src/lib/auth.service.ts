import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { AUTH_USER_SERVICE, AuthUserService } from './auth-api.tokens';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AUTH_USER_SERVICE) private user: AuthUserService,
    private tokens: TokensService,
    private refresh: RefreshTokensService,
  ) {}

  async login(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ) {
    const user = await this.user.validatePassword(email, password);
    if (!user) {
      this.logger.warn(`Login failed for ${email} from ${ip ?? 'unknown ip'}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    const access = this.tokens.signAccess({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
    const refresh = this.tokens.signRefresh(user.id);
    await this.refresh.persist(
      user.id,
      user.tenantId,
      refresh.token,
      refresh.jti,
      refresh.expiresAt,
    );
    await this.user.updateUser({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    this.logger.log(`Login success for ${user.email} (${user.id})`);
    return { user, access, refresh };
  }

  async refreshTokens(
    userId: string,
    jti: string,
    rawRefreshToken: string,
    ip?: string,
    userAgent?: string,
  ) {
    const validation = await this.refresh.validateAndGet(jti, rawRefreshToken);
    if (
      validation.status !== 'valid' ||
      !validation.token ||
      validation.token.userId !== userId
    ) {
      if (validation.status === 'mismatch') {
        await this.refresh.revokeAllUserTokens(userId, 'token-reuse', ip);
        this.logger.warn(
          `Detected refresh token reuse for user ${userId} from ${ip ?? 'unknown ip'}`,
        );
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
    const rt = validation.token;
    const user = await this.user.findById(userId);
    if (!user || !user.isActive) {
      this.logger.warn(`Inactive or missing user ${userId} attempted refresh`);
      throw new UnauthorizedException('User not active');
    }

    const access = this.tokens.signAccess({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
    const next = this.tokens.signRefresh(user.id);
    await this.refresh.rotate(jti, {
      token: next.token,
      jti: next.jti,
      expiresAt: next.expiresAt,
    });
    this.logger.log(`Rotated refresh token for user ${user.id}`);
    return { user, access, refresh: next };
  }

  async logout(userId: string, ip?: string) {
    await this.refresh.revokeAllUserTokens(userId, 'logout', ip);
    this.logger.log(`Logout for user ${userId} from ${ip ?? 'unknown ip'}`);
    return { ok: true };
  }
}
