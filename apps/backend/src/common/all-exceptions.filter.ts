import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { UpstreamError } from '../upstream/upstream.errors.js';
import { apiErrorBody } from './api-error.js';
import type { ApiErrorBody } from './api-error.js';
import { ValidationFailedException } from './validation-failed.exception.js';

interface MappedError {
  status: number;
  body: ApiErrorBody;
  retryAfterSeconds?: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body, retryAfterSeconds } = this.map(exception);

    if (status >= 500) {
      this.logger.error(
        `${body.error.code}: ${body.error.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }
    if (retryAfterSeconds !== undefined) {
      response.setHeader('Retry-After', String(retryAfterSeconds));
    }
    response.status(status).json(body);
  }

  private map(exception: unknown): MappedError {
    if (exception instanceof ValidationFailedException) {
      return error(
        400,
        'VALIDATION_FAILED',
        exception.message,
        exception.fields,
      );
    }

    if (exception instanceof UpstreamError) {
      return this.mapUpstream(exception);
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return error(status, codeForStatus(status), exception.message);
    }

    return error(500, 'INTERNAL_ERROR', 'Something went wrong on our side.');
  }

  private mapUpstream(exception: UpstreamError): MappedError {
    switch (exception.kind) {
      case 'bad_request':
        return error(400, 'UPSTREAM_REJECTED', exception.message);
      case 'not_found':
        return error(404, 'NOT_FOUND', exception.message);
      case 'unauthorized':
        return error(
          502,
          'UPSTREAM_AUTH',
          "We couldn't connect to the time-tracking service. Please try again later.",
        );
      case 'rate_limited': {
        const retryAfterSeconds = exception.options.retryAfterSeconds ?? 60;
        return {
          ...error(
            503,
            'RATE_LIMITED',
            `Too many requests right now. Try again in ${retryAfterSeconds} seconds.`,
          ),
          retryAfterSeconds,
        };
      }
      case 'unavailable':
        return error(502, 'UPSTREAM_UNAVAILABLE', exception.message);
    }
  }
}

function error(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): MappedError {
  return { status, body: apiErrorBody(code, message, fields) };
}

function codeForStatus(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    default:
      return status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED';
  }
}
