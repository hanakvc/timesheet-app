import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { jsonBodyErrorHandler, jsonBodyParser } from './common/json-body.js';
import { ValidationFailedException } from './common/validation-failed.exception.js';

export const API_PREFIX = 'api/v1';

export const APP_OPTIONS = { bodyParser: false } as const;

export function configureApp(app: NestExpressApplication): void {
  app.use(jsonBodyParser);
  app.use(jsonBodyErrorHandler);
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        ValidationFailedException.fromValidationErrors(errors),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  SwaggerModule.setup('docs', app, () => createOpenApiDocument(app));
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Timesheet app API')
    .setDescription(
      'Backend for the timesheet UI. Wraps the upstream time-tracking API. ' +
        'Errors always have the shape { error: { code, message, fields? } }.',
    )
    .setVersion('1.0')
    .build();

  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });
}
