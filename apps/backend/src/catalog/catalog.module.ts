import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TtlCache } from '../common/ttl-cache.js';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { UpstreamModule } from '../upstream/upstream.module.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';

@Module({
  imports: [UpstreamModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    {
      provide: TtlCache,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        new TtlCache(config.get('CATALOG_CACHE_TTL_MS', { infer: true })),
    },
  ],
})
export class CatalogModule {}
