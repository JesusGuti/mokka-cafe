import { InMemoryUserRepository } from '../../domain/ports/user.repository.fake';
import { FakePasswordHasher } from '@shared/domain/ports/password-hasher.fake';
import { CreateUserUseCase } from './create-user.use-case';
import { UserRole } from '@generated/prisma/enums';

describe('CreateUserUseCase', () => {
  it('crea y persiste un usuario sin depender de infraestructura real', async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repository, new FakePasswordHasher());

    const user = await useCase.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'supersecret',
      role: UserRole.ADMIN,
    });

    expect(user.name).toBe('John Doe');
    expect(user.passwordHash).toBe('hashed:supersecret');
    await expect(repository.findById(user.id)).resolves.toBe(user);
  });

  it('no permite crear dos usuarios con el mismo email', async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repository, new FakePasswordHasher());

    await useCase.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'supersecret',
      role: UserRole.ADMIN,
    });

    await expect(
      useCase.execute({
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        password: 'otherpassword',
        role: UserRole.CAJERO,
      }),
    ).rejects.toThrow('El email ya está en uso');
  });

  it('propaga el error de dominio si los datos son inválidos', async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repository, new FakePasswordHasher());

    await expect(
      useCase.execute({
        name: '',
        email: 'john.doe@example.com',
        password: 'supersecret',
        role: UserRole.ADMIN,
      }),
    ).rejects.toThrow('El nombre es obligatorio');
  });
});
