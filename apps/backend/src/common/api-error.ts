import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
} from '@nestjs/swagger';

export class ApiErrorDetails {
  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code: string;

  @ApiProperty({ example: 'Some fields need attention' })
  message: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { end: 'End must be after start.' },
    description: 'One message per invalid field',
  })
  fields?: Record<string, string>;
}

export class ApiErrorBody {
  @ApiProperty({ type: () => ApiErrorDetails })
  error: ApiErrorDetails;
}

export function apiErrorBody(
  code: string,
  message: string,
  fields?: Record<string, string>,
): ApiErrorBody {
  return { error: { code, message, ...(fields ? { fields } : {}) } };
}

export function ApiCommonErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ApiErrorBody,
      description: 'Invalid input or JSON',
    }),
    ApiResponse({
      status: 502,
      type: ApiErrorBody,
      description: 'The upstream API failed',
    }),
    ApiResponse({
      status: 503,
      type: ApiErrorBody,
      description: 'Upstream rate limit reached; see the Retry-After header',
    }),
  );
}
