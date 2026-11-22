import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ProductCategoryRepository,
  ProductCategoryWithCount,
} from '../../domain/ports/product-category.repository';
import { ProductCategory } from '../../domain/entities/product-category.entity';
import { DuplicatedProductCategoryNameError } from '../../domain/errors/duplicated-product-category-name.error';
import { ProductCategoryMapper } from './product-category.mapper';
import { ProductCategoryNotFoundError } from '../../domain/errors/product-category-not-found.error';
import { ProductCategoryHasProductsError } from '../../domain/errors/product-category-has-products.error';

const UNIQUE_VIOLATION = 'P2002';
const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';

const hasCode = (error: unknown, code: string): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;

@Injectable()
export class PrismaProductCategoryRepository implements ProductCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(productCategory: ProductCategory): Promise<void> {
    const data = ProductCategoryMapper.toPersistence(productCategory);

    try {
      await this.prisma.productCategory.create({ data });
    } catch (error) {
      if (hasCode(error, UNIQUE_VIOLATION)) {
        throw new DuplicatedProductCategoryNameError();
      }
      throw error;
    }
  }

  async update(productCategory: ProductCategory): Promise<void> {
    const { name, sortOrder, updatedAt } =
      ProductCategoryMapper.toPersistence(productCategory);

    try {
      await this.prisma.productCategory.update({
        where: { id: productCategory.id },
        data: { name, sortOrder, updatedAt },
      });
    } catch (error) {
      if (hasCode(error, RECORD_NOT_FOUND)) {
        throw new ProductCategoryNotFoundError(productCategory.id);
      }
      if (hasCode(error, UNIQUE_VIOLATION)) {
        throw new DuplicatedProductCategoryNameError();
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.productCategory.delete({ where: { id } });
    } catch (error) {
      if (hasCode(error, RECORD_NOT_FOUND)) {
        throw new ProductCategoryNotFoundError(id);
      }
      if (hasCode(error, FOREIGN_KEY_VIOLATION)) {
        throw new ProductCategoryHasProductsError(await this.countProducts(id));
      }
      throw error;
    }
  }

  async findById(id: string): Promise<ProductCategory | null> {
    const raw = await this.prisma.productCategory.findUnique({ where: { id } });

    return raw ? ProductCategoryMapper.toDomain(raw) : null;
  }

  async findAllWithProductCount(): Promise<ProductCategoryWithCount[]> {
    const rows = await this.prisma.productCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });

    return rows.map((row) => ({
      category: ProductCategoryMapper.toDomain(row),
      productCount: row._count.products,
    }));
  }

  countProducts(id: string): Promise<number> {
    return this.prisma.product.count({ where: { categoryId: id } });
  }

  async getNextSortOrder(): Promise<number> {
    const { _max } = await this.prisma.productCategory.aggregate({
      _max: { sortOrder: true },
    });

    return _max.sortOrder === null ? 0 : _max.sortOrder + 1;
  }
}
