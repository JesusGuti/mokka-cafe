import { randomUUID } from 'node:crypto';
import type { TestingModule } from '@nestjs/testing';
import { UserRole } from '@generated/prisma/enums';
import { TokenGenerator } from '../../src/modules/auth/domain/ports/token-generator';

/**
 * Genera un header Authorization con un access token válido firmado por el
 * TokenGenerator real de la app (mismo secreto que valida JwtAuthGuard), para
 * que los e2e de otros módulos no dependan del flujo de /auth/sign-in.
 */
export function authHeader(
  moduleFixture: TestingModule,
  overrides: { sub?: string; role?: UserRole } = {},
): string {
  const tokenGenerator = moduleFixture.get(TokenGenerator);
  const token = tokenGenerator.sign({
    sub: overrides.sub ?? randomUUID(),
    role: overrides.role ?? UserRole.ADMIN,
  });
  return `Bearer ${token}`;
}
