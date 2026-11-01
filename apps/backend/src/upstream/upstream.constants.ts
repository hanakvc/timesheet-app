export const UPSTREAM_CONFIG = Symbol('UPSTREAM_CONFIG');

export interface UpstreamConfig {
  baseUrl: string;
  timeoutMs: number;
}
