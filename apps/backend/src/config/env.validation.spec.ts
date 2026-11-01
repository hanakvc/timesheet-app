import 'reflect-metadata';
import { validateEnv } from './env.validation.js';

const required = {
  UPSTREAM_API_BASE_URL: 'http://upstream.test/api/v1',
  UPSTREAM_API_KEY: 'test-key',
};

describe('validateEnv', () => {
  it('uses the default limits when they are not set', () => {
    expect(validateEnv(required)).toMatchObject({
      UPSTREAM_RATE_LIMIT_REQUESTS: 15,
      UPSTREAM_RATE_LIMIT_WINDOW_MS: 60_000,
      UPSTREAM_RATE_LIMIT_MAX_WAIT_MS: 8_000,
      UPSTREAM_TIMEOUT_MS: 8_000,
      CATALOG_CACHE_TTL_MS: 300_000,
    });
  });

  it('reads a limit from its text value', () => {
    expect(
      validateEnv({ ...required, UPSTREAM_TIMEOUT_MS: '2500' })
        .UPSTREAM_TIMEOUT_MS,
    ).toBe(2500);
  });

  it('refuses to start with an invalid value', () => {
    expect(() =>
      validateEnv({ ...required, UPSTREAM_RATE_LIMIT_REQUESTS: 'many' }),
    ).toThrow('Invalid environment configuration');
  });
});
