import { Ingredient } from '../../../domain/entities/ingredient.entity';

export class IngredientResponseDto {
  id!: string;
  name!: string;
  unit!: string;
  categoryId!: string;
  currentStockQty!: number;
  minStockThreshold!: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(ingredient: Ingredient): IngredientResponseDto {
    const dto = new IngredientResponseDto();
    dto.id = ingredient.id;
    dto.name = ingredient.name;
    dto.unit = ingredient.unit;
    dto.categoryId = ingredient.categoryId;
    dto.currentStockQty = ingredient.currentStockQty;
    dto.minStockThreshold = ingredient.minStockThreshold;
    dto.createdAt = ingredient.createdAt;
    dto.updatedAt = ingredient.updatedAt;
    return dto;
  }
}
