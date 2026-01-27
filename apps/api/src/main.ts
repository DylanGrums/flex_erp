import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const apiPrefix = process.env.API_PREFIX ?? 'api';
  const clientOrigin = process.env.CLIENT_URL ?? 'http://localhost:4200';

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Store-Id'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `API listening on http://localhost:${port}/${apiPrefix} (CORS origin ${clientOrigin}, credentials enabled)`
  );
}

bootstrap();
