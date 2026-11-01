export interface AuthProvider {
  getAuthHeader(): Promise<string>;
  onUnauthorized?(): Promise<void>;
}

export const AUTH_PROVIDER = Symbol('AUTH_PROVIDER');

export class ApiKeyAuthProvider implements AuthProvider {
  constructor(private readonly apiKey: string) {}

  getAuthHeader(): Promise<string> {
    return Promise.resolve(`Bearer ${this.apiKey}`);
  }
}
