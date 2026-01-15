import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { AUTH_PRISMA, AUTH_USER_SERVICE } from './auth-api.tokens';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh.guard';

export type AuthApiModuleOptions = {
  imports?: ModuleMetadata['imports'];
  userServiceToken: unknown;
  prismaServiceToken: unknown;
};

@Module({})
export class AuthApiModule {
  static register(options: AuthApiModuleOptions): DynamicModule {
    return {
      module: AuthApiModule,
      imports: [JwtModule.register({}), ...(options.imports ?? [])],
      controllers: [AuthController],
      providers: [
        AuthService,
        TokensService,
        RefreshTokensService,
        JwtStrategy,
        RefreshStrategy,
        JwtAuthGuard,
        RefreshJwtGuard,
        { provide: AUTH_USER_SERVICE, useExisting: options.userServiceToken },
        { provide: AUTH_PRISMA, useExisting: options.prismaServiceToken },
      ],
    };
  }
}
