import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@generated/prisma/enums';
import { FakeTokenGenerator } from '../../domain/ports/token-generator.fake';
import { TokenGenerator } from '../../domain/ports/token-generator';
import { JwtAuthGuard } from './jwt-auth.guard';

class ThrowingTokenGenerator extends TokenGenerator {
  sign(): string {
    throw new Error('not used in this test');
  }
  verify(): never {
    throw new Error('token inválido o expirado');
  }
  signRefreshToken(): string {
    throw new Error('not used in this test');
  }
  verifyRefreshToken(): never {
    throw new Error('not used in this test');
  }
}

function createContext(headers: Record<string, string> = {}): {
  context: ExecutionContext;
  request: { headers: Record<string, string>; user?: unknown };
} {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers,
  };
  const context = {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  return { context, request };
}

describe('JwtAuthGuard', () => {
  it('deja pasar sin validar nada si la ruta es pública', () => {
    const reflector = { getAllAndOverride: () => true } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector, new FakeTokenGenerator());
    const { context } = createContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rechaza la request si no hay header Authorization', () => {
    const reflector = {
      getAllAndOverride: () => false,
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector, new FakeTokenGenerator());
    const { context } = createContext();

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza la request si el header no tiene el esquema Bearer', () => {
    const reflector = {
      getAllAndOverride: () => false,
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector, new FakeTokenGenerator());
    const { context } = createContext({ authorization: 'Basic abc123' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza la request si el token es inválido o expiró', () => {
    const reflector = {
      getAllAndOverride: () => false,
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector, new ThrowingTokenGenerator());
    const { context } = createContext({
      authorization: 'Bearer token-invalido',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deja pasar y cuelga el payload en request.user si el token es válido', () => {
    const reflector = {
      getAllAndOverride: () => false,
    } as unknown as Reflector;
    const tokenGenerator = new FakeTokenGenerator();
    const guard = new JwtAuthGuard(reflector, tokenGenerator);
    const token = tokenGenerator.sign({
      sub: 'user-id',
      role: UserRole.ADMIN,
    });
    const { context, request } = createContext({
      authorization: `Bearer ${token}`,
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ sub: 'user-id', role: UserRole.ADMIN });
  });
});
