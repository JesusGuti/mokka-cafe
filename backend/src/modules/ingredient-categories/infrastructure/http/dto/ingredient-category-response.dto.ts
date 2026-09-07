import { IngredientCategory } from '../../../domain/entities/ingredient-category.entity';

export class IngredientCategoryResponseDto {
  id!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(
    ingredientCategory: IngredientCategory,
  ): IngredientCategoryResponseDto {
    const dto = new IngredientCategoryResponseDto();
    dto.id = ingredientCategory.id;
    dto.name = ingredientCategory.name;
    dto.createdAt = ingredientCategory.createdAt;
    dto.updatedAt = ingredientCategory.updatedAt;
    return dto;
  }
}
