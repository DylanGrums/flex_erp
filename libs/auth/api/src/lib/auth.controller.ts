import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response, Request, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { parseDuration } from './utils/duration';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';


@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('Email and password are required');
    }
    const ua = String(req.headers['user-agent'] ?? '');
    const ip = req.ip;
    const { user, access, refresh } = await this.auth.login(body.email, body.password, ip, ua);
    this.setRefreshCookie(res, refresh.token);
    return {
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
      user: { id: user.id, email: user.email, role: user.role, avatar: user.avatar },
    };
  }

  @Post('refresh')
  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { userId, jti, token } = (req as any).refresh;
    if (!token) throw new UnauthorizedException('Missing refresh token');
    const ua = String(req.headers['user-agent'] ?? '');
    const { user, access, refresh } = await this.auth.refreshTokens(userId, jti, token, req.ip, ua);
    this.setRefreshCookie(res, refresh.token);
    return {
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
      user: { id: user.id, email: user.email, role: user.role, avatar: user.avatar },
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser() user: any, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
    await this.auth.logout(user.id, req.ip);
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@GetUser() user: any) {
    return { id: user.id, email: user.email, role: user.roles, avatar: user.avatar };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, this.refreshCookieOptions);
  }
  
  private clearRefreshCookie(res: Response) {
    const opts = this.refreshCookieOptions;
    res.clearCookie('refresh_token', opts);
  }

  private get refreshCookieOptions(): CookieOptions {
    const ttl = process.env.JWT_REFRESH_TTL ?? '30d';
    const maxAge = parseDuration(ttl);
    const prefix = process.env.API_PREFIX ?? 'api';
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict',
      path: `/${prefix}/auth/refresh`,
      maxAge,
    };
  }
}
