import { UserRole } from '@generated/prisma/enums';
import { InvalidEmailError } from '@shared/domain/errors/invalid-email.error';
import { InvalidUserError } from '../errors/invalid-user.error';
import { User } from './user.entity';

describe('User entity', () => {
  it('crea un usuario válido, recorta el nombre, normaliza el email y nace activo', () => {
    const user = User.create({
      id: '1',
      name: '  Ana  ',
      email: 'Ana@Mokka.com',
      passwordHash: 'hash-1',
      role: UserRole.MESERO,
    });

    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@mokka.com');
    expect(user.isActive).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    expect(() =>
      User.create({
        id: '1',
        name: '   ',
        email: 'ana@mokka.com',
        passwordHash: 'hash-1',
        role: UserRole.MESERO,
      }),
    ).toThrow(InvalidUserError);
  });

  it('rechaza email con formato inválido', () => {
    expect(() =>
      User.create({
        id: '1',
        name: 'Ana',
        email: 'no-es-un-email',
        passwordHash: 'hash-1',
        role: UserRole.MESERO,
      }),
    ).toThrow(InvalidEmailError);
  });

  it('rechaza hash de contraseña vacío', () => {
    expect(() =>
      User.create({
        id: '1',
        name: 'Ana',
        email: 'ana@mokka.com',
        passwordHash: '',
        role: UserRole.MESERO,
      }),
    ).toThrow(InvalidUserError);
  });

  it('deactivate() desactiva al usuario y activate() lo reactiva', () => {
    const user = User.create({
      id: '1',
      name: 'Ana',
      email: 'ana@mokka.com',
      passwordHash: 'hash-1',
      role: UserRole.MESERO,
    });

    user.deactivate();
    expect(user.isActive).toBe(false);

    user.activate();
    expect(user.isActive).toBe(true);
  });

  it('updateLastLogin() actualiza la fecha de último login', () => {
    const user = User.create({
      id: '1',
      name: 'Ana',
      email: 'ana@mokka.com',
      passwordHash: 'hash-1',
      role: UserRole.MESERO,
    });

    user.updateLastLogin();
    expect(user.lastLoginAt).toBeInstanceOf(Date);
  });
});
