import type { IngredientCategory as PrismaIngredientCategory } from '@generated/prisma/client';
import { IngredientCategory } from '../../domain/entities/ingredient-category.entity';

export class IngredientCategoryMapper {
  static toDomain(raw: PrismaIngredientCategory): IngredientCategory {
    return IngredientCategory.reconstitute({
      id: raw.id,
      name: raw.name,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(ingredientCategory: IngredientCategory) {
    return ingredientCategory.toPrimitives();
  }
}
