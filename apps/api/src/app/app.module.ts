import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthApiModule } from '@flex-erp/auth/api';
import { StoreApiModule } from '@flex-erp/store/api';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthApiModule.register({
      imports: [UserModule],
      userServiceToken: UserService,
      prismaServiceToken: PrismaService,
    }),
    StoreApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
