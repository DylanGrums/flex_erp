import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_PRISMA, JwtAuthGuard } from '@flex-erp/auth/api';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    JwtService,
    { provide: AUTH_PRISMA, useExisting: PrismaService },
    JwtAuthGuard,
  ],
  exports: [UserService, PrismaService],
})
export class UserModule { }
