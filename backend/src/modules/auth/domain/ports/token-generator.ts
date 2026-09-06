import { UserRole } from '@generated/prisma/enums';

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export abstract class TokenGenerator {
  abstract sign(payload: AuthTokenPayload): string;
  abstract verify(token: string): AuthTokenPayload;
  abstract signRefreshToken(payload: AuthTokenPayload): string;
  abstract verifyRefreshToken(token: string): AuthTokenPayload;
}
