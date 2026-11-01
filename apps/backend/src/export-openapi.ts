import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import {
  APP_OPTIONS,
  configureApp,
  createOpenApiDocument,
} from './app.setup.js';

process.env.UPSTREAM_API_BASE_URL ??= 'http://localhost/api/v1';
process.env.UPSTREAM_API_KEY ??= 'not-needed-for-export';

const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  ...APP_OPTIONS,
  logger: false,
});
configureApp(app);

const document = createOpenApiDocument(app);
writeFileSync(
  new URL('../openapi.json', import.meta.url),
  `${JSON.stringify(document, null, 2)}\n`,
);
await app.close();
