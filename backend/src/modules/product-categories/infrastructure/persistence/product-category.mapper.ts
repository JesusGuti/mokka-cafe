import type { ProductCategory as PrismaProductCategory } from '@generated/prisma/client';
import { ProductCategory } from '../../domain/entities/product-category.entity';

export class ProductCategoryMapper {
  static toDomain(raw: PrismaProductCategory): ProductCategory {
    return ProductCategory.reconstitute({
      id: raw.id,
      name: raw.name,
      sortOrder: raw.sortOrder,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(productCategory: ProductCategory) {
    return productCategory.toPrimitives();
  }
}
