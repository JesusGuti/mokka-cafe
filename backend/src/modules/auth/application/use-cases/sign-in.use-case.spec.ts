import { randomUUID } from 'node:crypto';
import { UserRole } from '@generated/prisma/enums';
import { FakePasswordHasher } from '@shared/domain/ports/password-hasher.fake';
import { FakeTokenGenerator } from '../../domain/ports/token-generator.fake';
import { SignInUseCase } from './sign-in.use-case';
import { User } from '../../../users/domain/entities/user.entity';
import { InMemoryUserRepository } from '../../../users/domain/ports/user.repository.fake';

async function createUser(
  repository: InMemoryUserRepository,
  passwordHasher: FakePasswordHasher,
  overrides: { email?: string; password?: string } = {},
): Promise<User> {
  const password = overrides.password ?? 'supersecret';
  const user = User.create({
    id: randomUUID(),
    name: 'John Doe',
    email: overrides.email ?? 'john.doe@example.com',
    passwordHash: await passwordHasher.hash(password),
    role: UserRole.ADMIN,
  });
  await repository.save(user);
  return user;
}

describe('SignInUseCase', () => {
  it('al hacer login se genera un token de acceso y se actualiza el último login', async () => {
    const repository = new InMemoryUserRepository();
    const passwordHasher = new FakePasswordHasher();
    const useCase = new SignInUseCase(
      repository,
      passwordHasher,
      new FakeTokenGenerator(),
    );
    const user = await createUser(repository, passwordHasher);

    const result = await useCase.execute({
      email: user.email,
      password: 'supersecret',
    });

    expect(typeof result.accessToken).toBe('string');
    const updatedUser = await repository.findById(user.id);
    expect(updatedUser?.lastLoginAt).toBeInstanceOf(Date);
  });

  it('rechaza el login si el usuario no existe', async () => {
    const repository = new InMemoryUserRepository();
    const passwordHasher = new FakePasswordHasher();
    const useCase = new SignInUseCase(
      repository,
      passwordHasher,
      new FakeTokenGenerator(),
    );

    await expect(
      useCase.execute({
        email: 'no-existe@example.com',
        password: 'supersecret',
      }),
    ).rejects.toThrow('El usuario no existe');
  });

  it('rechaza el login si la contraseña es incorrecta', async () => {
    const repository = new InMemoryUserRepository();
    const passwordHasher = new FakePasswordHasher();
    const useCase = new SignInUseCase(
      repository,
      passwordHasher,
      new FakeTokenGenerator(),
    );
    const user = await createUser(repository, passwordHasher);

    await expect(
      useCase.execute({ email: user.email, password: 'wrong-password' }),
    ).rejects.toThrow('La contraseña es incorrecta');
  });

  it('rechaza el login de un usuario desactivado', async () => {
    const repository = new InMemoryUserRepository();
    const passwordHasher = new FakePasswordHasher();
    const useCase = new SignInUseCase(
      repository,
      passwordHasher,
      new FakeTokenGenerator(),
    );
    const user = await createUser(repository, passwordHasher);
    user.deactivate();
    await repository.update(user);

    await expect(
      useCase.execute({ email: user.email, password: 'supersecret' }),
    ).rejects.toThrow('El usuario no existe');
  });
});
