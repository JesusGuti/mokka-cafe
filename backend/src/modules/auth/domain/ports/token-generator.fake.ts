import { AuthTokenPayload, TokenGenerator } from './token-generator';

export class FakeTokenGenerator implements TokenGenerator {
  sign(payload: AuthTokenPayload): string {
    return `fake-token.${payload.sub}.${payload.role}`;
  }

  verify(token: string): AuthTokenPayload {
    const [, sub, role] = token.split('.');
    return { sub, role: role as AuthTokenPayload['role'] };
  }
}
