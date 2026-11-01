import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsUrl({ require_tld: false })
  UPSTREAM_API_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  UPSTREAM_API_KEY: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  API_PORT?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  UPSTREAM_RATE_LIMIT_REQUESTS: number = 15;

  @IsOptional()
  @IsInt()
  @Min(1000)
  UPSTREAM_RATE_LIMIT_WINDOW_MS: number = 60_000;

  @IsOptional()
  @IsInt()
  @Min(0)
  UPSTREAM_RATE_LIMIT_MAX_WAIT_MS: number = 8_000;

  @IsOptional()
  @IsInt()
  @Min(1)
  UPSTREAM_TIMEOUT_MS: number = 8_000;

  @IsOptional()
  @IsInt()
  @Min(0)
  CATALOG_CACHE_TTL_MS: number = 5 * 60_000;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env);

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return env;
}
