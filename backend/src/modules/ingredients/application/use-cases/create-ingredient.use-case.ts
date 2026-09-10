import { Injectable } from '@nestjs/common';
import { DuplicatedIngredientNameError } from '../../domain/errors/duplicated-ingredient.error';
import { Ingredient } from '../../domain/entities/ingredient.entity';
import { IngredientRepository } from '../../domain/ports/ingredient.repository';
import { IngredientCategoryRepository } from '../../../ingredient-categories/domain/ports/ingredient-category.repository';
import { IngredientCategoryNotFoundError } from '../../../ingredient-categories/domain/errors/ingredient-category-not-found.error';
import { randomUUID } from 'node:crypto';

export interface CreateIngredientCommand {
  name: string;
  unit: string;
  categoryId: string;
  minStockThreshold: number | null;
}

@Injectable()
export class CreateIngredientUseCase {
  constructor(
    private readonly ingredientRepository: IngredientRepository,
    private readonly ingredientCategoryRepository: IngredientCategoryRepository,
  ) {}

  async execute(command: CreateIngredientCommand): Promise<Ingredient> {
    const ingredient = Ingredient.create({
      id: randomUUID(),
      name: command.name,
      categoryId: command.categoryId,
      unit: command.unit,
      minStockThreshold: command.minStockThreshold,
    });

    const ingredientCategory = await this.ingredientCategoryRepository.findById(
      command.categoryId,
    );

    if (!ingredientCategory) {
      throw new IngredientCategoryNotFoundError(command.categoryId);
    }

    const existingIngredientName = await this.ingredientRepository.findByName(
      ingredient.name,
    );

    if (existingIngredientName) {
      throw new DuplicatedIngredientNameError();
    }

    await this.ingredientRepository.save(ingredient);

    return ingredient;
  }
}
