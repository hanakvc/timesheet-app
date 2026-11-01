import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { APP_OPTIONS, configureApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    APP_OPTIONS,
  );
  configureApp(app);
  app.enableShutdownHooks();

  const port = app.get(ConfigService).get<number>('API_PORT') ?? 3001;
  await app.listen(port);
}
await bootstrap();
