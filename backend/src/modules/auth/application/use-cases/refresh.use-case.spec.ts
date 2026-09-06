import { randomUUID } from 'node:crypto';
import { UserRole } from '@generated/prisma/enums';
import { FakeTokenGenerator } from '../../domain/ports/token-generator.fake';
import { RefreshUseCase } from './refresh.use-case';
import { User } from '../../../users/domain/entities/user.entity';
import { InMemoryUserRepository } from '../../../users/domain/ports/user.repository.fake';

async function createUser(
  repository: InMemoryUserRepository,
  overrides: { email?: string } = {},
): Promise<User> {
  const user = User.create({
    id: randomUUID(),
    name: 'John Doe',
    email: overrides.email ?? 'john.doe@example.com',
    passwordHash: 'irrelevant-hash',
    role: UserRole.ADMIN,
  });
  await repository.save(user);
  return user;
}

describe('RefreshUseCase', () => {
  it('devuelve un access token nuevo para un refresh token válido', async () => {
    const repository = new InMemoryUserRepository();
    const tokenGenerator = new FakeTokenGenerator();
    const useCase = new RefreshUseCase(repository, tokenGenerator);
    const user = await createUser(repository);
    const refreshToken = tokenGenerator.signRefreshToken({
      sub: user.id,
      role: user.role,
    });

    const result = await useCase.execute({ refreshToken });

    expect(typeof result.accessToken).toBe('string');
  });

  it('rechaza un refresh token inválido', async () => {
    const repository = new InMemoryUserRepository();
    const tokenGenerator = new FakeTokenGenerator();
    const useCase = new RefreshUseCase(repository, tokenGenerator);

    await expect(
      useCase.execute({ refreshToken: 'not-a-real-token' }),
    ).rejects.toThrow(
      'El refresh token es inválido, expiró, o el usuario ya no existe',
    );
  });

  it('rechaza el refresh si el usuario ya no existe', async () => {
    const repository = new InMemoryUserRepository();
    const tokenGenerator = new FakeTokenGenerator();
    const useCase = new RefreshUseCase(repository, tokenGenerator);
    const refreshToken = tokenGenerator.signRefreshToken({
      sub: randomUUID(),
      role: UserRole.ADMIN,
    });

    await expect(useCase.execute({ refreshToken })).rejects.toThrow(
      'El refresh token es inválido, expiró, o el usuario ya no existe',
    );
  });

  it('rechaza el refresh de un usuario desactivado', async () => {
    const repository = new InMemoryUserRepository();
    const tokenGenerator = new FakeTokenGenerator();
    const useCase = new RefreshUseCase(repository, tokenGenerator);
    const user = await createUser(repository);
    user.deactivate();
    await repository.update(user);
    const refreshToken = tokenGenerator.signRefreshToken({
      sub: user.id,
      role: user.role,
    });

    await expect(useCase.execute({ refreshToken })).rejects.toThrow(
      'El refresh token es inválido, expiró, o el usuario ya no existe',
    );
  });
});
