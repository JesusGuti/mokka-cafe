import { Injectable } from '@nestjs/common';
import { IngredientCategoryRepository } from '../../domain/ports/ingredient-category.repository';
import { IngredientCategory } from '../../domain/entities/ingredient-category.entity';

@Injectable()
export class ListIngredientCategoryUseCase {
  constructor(
    private readonly ingredientCategoryRepository: IngredientCategoryRepository,
  ) {}

  execute(): Promise<IngredientCategory[]> {
    return this.ingredientCategoryRepository.findAll();
  }
}
