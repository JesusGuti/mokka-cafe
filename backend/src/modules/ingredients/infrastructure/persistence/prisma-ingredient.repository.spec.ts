import { randomUUID } from 'node:crypto';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Ingredient } from '../../domain/entities/ingredient.entity';
import { DuplicatedIngredientNameError } from '../../domain/errors/duplicated-ingredient.error';
import { PrismaIngredientRepository } from './prisma-ingredient.repository';

const buildRepository = (create: jest.Mock) => {
  const prisma = { ingredient: { create } } as unknown as PrismaService;
  return new PrismaIngredientRepository(prisma);
};

const buildIngredient = () =>
  Ingredient.create({
    id: randomUUID(),
    name: 'Café',
    unit: 'Kilo',
    categoryId: randomUUID(),
    minStockThreshold: null,
  });

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: 'test',
  });

describe('PrismaIngredientRepository.create', () => {
  it('traduce la violación de unicidad (P2002) a DuplicatedIngredientNameError', async () => {
    const repository = buildRepository(
      jest.fn().mockRejectedValue(prismaError('P2002')),
    );

    await expect(repository.create(buildIngredient())).rejects.toThrow(
      DuplicatedIngredientNameError,
    );
  });

  it('relanza cualquier otro error de Prisma sin traducirlo', async () => {
    const error = prismaError('P2003');
    const repository = buildRepository(jest.fn().mockRejectedValue(error));

    await expect(repository.create(buildIngredient())).rejects.toBe(error);
  });

  it('relanza errores que no son de Prisma', async () => {
    const error = new Error('conexión caída');
    const repository = buildRepository(jest.fn().mockRejectedValue(error));

    await expect(repository.create(buildIngredient())).rejects.toBe(error);
  });
});
