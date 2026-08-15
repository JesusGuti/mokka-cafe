import type { Product as PrismaProduct } from '@generated/prisma/client';
import { Product } from '../../domain/entities/product.entity';

export class ProductMapper {
  static toDomain(raw: PrismaProduct): Product {
    return Product.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      priceCents: raw.priceCents,
      category: raw.category,
      isAvailable: raw.isAvailable,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(product: Product) {
    return product.toPrimitives();
  }
}
