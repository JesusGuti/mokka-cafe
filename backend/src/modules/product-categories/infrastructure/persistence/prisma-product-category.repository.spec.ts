import { randomUUID } from 'node:crypto';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ProductCategory } from '../../domain/entities/product-category.entity';
import { DuplicatedProductCategoryNameError } from '../../domain/errors/duplicated-product-category-name.error';
import { ProductCategoryHasProductsError } from '../../domain/errors/product-category-has-products.error';
import { ProductCategoryNotFoundError } from '../../domain/errors/product-category-not-found.error';
import { PrismaProductCategoryRepository } from './prisma-product-category.repository';

interface PrismaMock {
  productCategory: {
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
    findMany?: jest.Mock;
    aggregate?: jest.Mock;
  };
  product: { count?: jest.Mock };
}

const buildRepository = (mock: Partial<PrismaMock>) => {
  const prisma = {
    productCategory: {},
    product: {},
    ...mock,
  } as unknown as PrismaService;
  return new PrismaProductCategoryRepository(prisma);
};

const buildCategory = () =>
  ProductCategory.create({ id: randomUUID(), name: 'Calientes', sortOrder: 0 });

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: 'test',
  });

describe('PrismaProductCategoryRepository', () => {
  describe('create', () => {
    it('traduce la violación de unicidad (P2002) a DuplicatedProductCategoryNameError', async () => {
      const repository = buildRepository({
        productCategory: {
          create: jest.fn().mockRejectedValue(prismaError('P2002')),
        },
      });

      await expect(repository.create(buildCategory())).rejects.toThrow(
        DuplicatedProductCategoryNameError,
      );
    });

    it('relanza cualquier otro error sin traducirlo', async () => {
      const error = prismaError('P2003');
      const repository = buildRepository({
        productCategory: { create: jest.fn().mockRejectedValue(error) },
      });

      await expect(repository.create(buildCategory())).rejects.toBe(error);
    });
  });

  describe('update', () => {
    it('traduce P2025 a ProductCategoryNotFoundError', async () => {
      const repository = buildRepository({
        productCategory: {
          update: jest.fn().mockRejectedValue(prismaError('P2025')),
        },
      });

      await expect(repository.update(buildCategory())).rejects.toThrow(
        ProductCategoryNotFoundError,
      );
    });

    it('traduce P2002 a DuplicatedProductCategoryNameError', async () => {
      const repository = buildRepository({
        productCategory: {
          update: jest.fn().mockRejectedValue(prismaError('P2002')),
        },
      });

      await expect(repository.update(buildCategory())).rejects.toThrow(
        DuplicatedProductCategoryNameError,
      );
    });

    it('solo envía los campos editables, no id ni createdAt', async () => {
      const update = jest.fn().mockResolvedValue({});
      const repository = buildRepository({ productCategory: { update } });
      const category = buildCategory();

      await repository.update(category);

      expect(update).toHaveBeenCalledWith({
        where: { id: category.id },
        data: {
          name: category.name,
          sortOrder: category.sortOrder,
          updatedAt: category.updatedAt,
        },
      });
    });
  });

  describe('delete', () => {
    it('traduce P2025 a ProductCategoryNotFoundError', async () => {
      const repository = buildRepository({
        productCategory: {
          delete: jest.fn().mockRejectedValue(prismaError('P2025')),
        },
      });

      await expect(repository.delete('id')).rejects.toThrow(
        ProductCategoryNotFoundError,
      );
    });

    it('traduce la violación de FK (P2003) a ProductCategoryHasProductsError con la cantidad', async () => {
      const repository = buildRepository({
        productCategory: {
          delete: jest.fn().mockRejectedValue(prismaError('P2003')),
        },
        product: { count: jest.fn().mockResolvedValue(3) },
      });

      const attempt = repository.delete('id');

      await expect(attempt).rejects.toThrow(ProductCategoryHasProductsError);
      await expect(attempt).rejects.toMatchObject({ productCount: 3 });
    });
  });

  describe('findAllWithProductCount', () => {
    it('ordena por sortOrder y nombre, y mapea el conteo de productos', async () => {
      const now = new Date();
      const findMany = jest.fn().mockResolvedValue([
        {
          id: 'a',
          name: 'Calientes',
          sortOrder: 0,
          createdAt: now,
          updatedAt: now,
          _count: { products: 4 },
        },
      ]);
      const repository = buildRepository({ productCategory: { findMany } });

      const result = await repository.findAllWithProductCount();

      expect(findMany).toHaveBeenCalledWith({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { products: true } } },
      });
      expect(result).toHaveLength(1);
      expect(result[0].category.name).toBe('Calientes');
      expect(result[0].productCount).toBe(4);
    });
  });

  describe('getNextSortOrder', () => {
    const withMax = (max: number | null) =>
      buildRepository({
        productCategory: {
          aggregate: jest.fn().mockResolvedValue({ _max: { sortOrder: max } }),
        },
      });

    it('devuelve 0 si todavía no hay categorías', async () => {
      await expect(withMax(null).getNextSortOrder()).resolves.toBe(0);
    });

    it('devuelve el máximo + 1, incluso si el máximo es 0', async () => {
      await expect(withMax(0).getNextSortOrder()).resolves.toBe(1);
      await expect(withMax(7).getNextSortOrder()).resolves.toBe(8);
    });
  });
});
