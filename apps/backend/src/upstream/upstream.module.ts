import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { ApiKeyAuthProvider, AUTH_PROVIDER } from './auth.provider.js';
import { RateLimiter } from './rate-limiter.js';
import { UpstreamClient } from './upstream.client.js';
import { UPSTREAM_CONFIG } from './upstream.constants.js';
import type { UpstreamConfig } from './upstream.constants.js';

type Config = ConfigService<EnvironmentVariables, true>;

@Module({
  providers: [
    {
      provide: AUTH_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: Config) =>
        new ApiKeyAuthProvider(config.get('UPSTREAM_API_KEY', { infer: true })),
    },
    {
      provide: UPSTREAM_CONFIG,
      inject: [ConfigService],
      useFactory: (config: Config): UpstreamConfig => ({
        baseUrl: config.get('UPSTREAM_API_BASE_URL', { infer: true }),
        timeoutMs: config.get('UPSTREAM_TIMEOUT_MS', { infer: true }),
      }),
    },
    {
      provide: RateLimiter,
      inject: [ConfigService],
      useFactory: (config: Config) =>
        new RateLimiter(
          config.get('UPSTREAM_RATE_LIMIT_REQUESTS', { infer: true }),
          config.get('UPSTREAM_RATE_LIMIT_WINDOW_MS', { infer: true }),
          config.get('UPSTREAM_RATE_LIMIT_MAX_WAIT_MS', { infer: true }),
        ),
    },
    UpstreamClient,
  ],
  exports: [UpstreamClient],
})
export class UpstreamModule {}
