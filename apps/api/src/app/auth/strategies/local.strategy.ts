// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { User } from '@prisma/client';
// import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly authService: AuthService, private configService: ConfigService) {
//     super({
//       usernameField: 'email',
//       secretOrKey: configService.get<string>('JWT_SECRET'),
//     });
//   }

//   async validate(email: string, password: string): Promise<User> {
//     const user = await this.authService.getAuthenticatedUser(email, password);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }
