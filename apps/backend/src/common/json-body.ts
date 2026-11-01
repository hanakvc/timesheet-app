import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { apiErrorBody } from './api-error.js';

export const jsonBodyParser = express.json({ limit: '100kb' });

export const jsonBodyErrorHandler: ErrorRequestHandler = (
  error: { type?: string },
  _request,
  response,
  next,
) => {
  if (error.type === 'entity.parse.failed') {
    response
      .status(400)
      .json(apiErrorBody('INVALID_JSON', "The request body isn't valid JSON."));
    return;
  }
  if (error.type === 'entity.too.large') {
    response
      .status(413)
      .json(
        apiErrorBody('PAYLOAD_TOO_LARGE', 'The request body is too large.'),
      );
    return;
  }
  next(error);
};
