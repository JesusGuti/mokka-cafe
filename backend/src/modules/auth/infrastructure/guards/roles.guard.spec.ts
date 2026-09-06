import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@generated/prisma/enums';
import { AuthTokenPayload } from '../../domain/ports/token-generator';
import { RolesGuard } from './roles.guard';

function createContext(user?: AuthTokenPayload): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('deja pasar si la ruta no tiene @Roles()', () => {
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('rechaza si hay roles requeridos pero no hay request.user', () => {
    const reflector = {
      getAllAndOverride: () => [UserRole.ADMIN],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('rechaza si el rol del usuario no está entre los requeridos', () => {
    const reflector = {
      getAllAndOverride: () => [UserRole.ADMIN],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = createContext({ sub: 'user-id', role: UserRole.MESERO });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('deja pasar si el rol del usuario está entre los requeridos', () => {
    const reflector = {
      getAllAndOverride: () => [UserRole.ADMIN],
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = createContext({ sub: 'user-id', role: UserRole.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });
});
