import type { Ingredient as PrismaIngredient } from '@generated/prisma/client';
import { Ingredient } from '../../domain/entities/ingredient.entity';

export class IngredientMapper {
  static toDomain(raw: PrismaIngredient): Ingredient {
    return Ingredient.reconstitute({
      id: raw.id,
      name: raw.name,
      unit: raw.unit,
      categoryId: raw.categoryId,
      currentStockQty: raw.currentStockQty.toNumber(),
      minStockThreshold: raw.minStockThreshold?.toNumber() ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(ingredient: Ingredient) {
    return ingredient.toPrimitives();
  }
}
