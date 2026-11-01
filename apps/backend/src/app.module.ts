import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from './catalog/catalog.module.js';
import { validateEnv } from './config/env.validation.js';
import { HealthController } from './health/health.controller.js';
import { TimeEntriesModule } from './time-entries/time-entries.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    CatalogModule,
    TimeEntriesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
