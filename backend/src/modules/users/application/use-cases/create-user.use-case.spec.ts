import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/ports/user.repository';
import { PasswordHasher } from '@shared/domain/ports/password-hasher';
import { CreateUserUseCase } from './create-user.use-case';
import { UserRole } from '@generated/prisma/enums';

class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  save(user: User): Promise<void> {
    this.users.set(user.id, user);
    return Promise.resolve();
  }
  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }
  findByEmail(email: string): Promise<User | null> {
    const user = [...this.users.values()].find((u) => u.email === email);
    return Promise.resolve(user ?? null);
  }
  findAll(): Promise<User[]> {
    return Promise.resolve([...this.users.values()]);
  }
  delete(id: string): Promise<void> {
    this.users.delete(id);
    return Promise.resolve();
  }
}

class FakePasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return Promise.resolve(`hashed:${password}`);
  }
  compare(password: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${password}`);
  }
}

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
