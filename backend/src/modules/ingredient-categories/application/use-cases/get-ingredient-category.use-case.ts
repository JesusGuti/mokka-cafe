import { Injectable } from '@nestjs/common';
import { IngredientCategory } from '../../domain/entities/ingredient-category.entity';
import { IngredientCategoryNotFoundError } from '../../domain/errors/ingredient-category-not-found.error';
import { IngredientCategoryRepository } from '../../domain/ports/ingredient-category.repository';

@Injectable()
export class GetIngredientCategoryUseCase {
  constructor(
    private readonly ingredientCategoryRepository: IngredientCategoryRepository,
  ) {}

  async execute(id: string): Promise<IngredientCategory> {
    const ingredientCategory =
      await this.ingredientCategoryRepository.findById(id);

    if (!ingredientCategory) {
      throw new IngredientCategoryNotFoundError(id);
    }

    return ingredientCategory;
  }
}
