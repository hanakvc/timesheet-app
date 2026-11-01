export type UpstreamErrorKind =
  'bad_request' | 'not_found' | 'unauthorized' | 'rate_limited' | 'unavailable';

export class UpstreamError extends Error {
  constructor(
    readonly kind: UpstreamErrorKind,
    message: string,
    readonly options: {
      upstreamMessage?: string;
      retryAfterSeconds?: number;
    } = {},
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}

export function fromUpstreamStatus(
  status: number,
  upstreamMessage: string | undefined,
): UpstreamError {
  const options = { upstreamMessage };

  if (status === 400 || status === 422) {
    return new UpstreamError(
      'bad_request',
      upstreamMessage ?? 'The request was rejected',
      options,
    );
  }
  if (status === 404) {
    return new UpstreamError(
      'not_found',
      upstreamMessage ?? 'Not found',
      options,
    );
  }
  if (status === 401 || status === 403) {
    return new UpstreamError(
      'unauthorized',
      'The upstream API rejected our credentials',
      options,
    );
  }
  return new UpstreamError(
    'unavailable',
    `The upstream API answered with status ${status}`,
    options,
  );
}
