import { randomUUID } from 'node:crypto';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IngredientCategory } from '../../domain/entities/ingredient-category.entity';
import { DuplicatedIngredientCategoryNameError } from '../../domain/errors/duplicated-ingredient-category-name.error';
import { PrismaIngredientCategoryRepository } from './prisma-ingredient-category.repository';

const buildRepository = (create: jest.Mock) => {
  const prisma = { ingredientCategory: { create } } as unknown as PrismaService;
  return new PrismaIngredientCategoryRepository(prisma);
};

const buildCategory = () =>
  IngredientCategory.create({ id: randomUUID(), name: 'Lácteos' });

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: 'test',
  });

describe('PrismaIngredientCategoryRepository.create', () => {
  it('traduce la violación de unicidad (P2002) a DuplicatedIngredientCategoryNameError', async () => {
    const repository = buildRepository(
      jest.fn().mockRejectedValue(prismaError('P2002')),
    );

    await expect(repository.create(buildCategory())).rejects.toThrow(
      DuplicatedIngredientCategoryNameError,
    );
  });

  it('relanza cualquier otro error de Prisma sin traducirlo', async () => {
    const error = prismaError('P2003');
    const repository = buildRepository(jest.fn().mockRejectedValue(error));

    await expect(repository.create(buildCategory())).rejects.toBe(error);
  });
});
