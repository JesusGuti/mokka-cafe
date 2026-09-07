import { Injectable } from '@nestjs/common';
import { IngredientCategory } from '../../domain/entities/ingredient-category.entity';
import { DuplicatedIngredientCategoryNameError } from '../../domain/errors/duplicated-ingredient-category-name.error';
import { IngredientCategoryRepository } from '../../domain/ports/ingredient-category.repository';
import { randomUUID } from 'node:crypto';

export interface CreateIngredientCategoryCommand {
  name: string;
}

@Injectable()
export class CreateIngredientCategoryUseCase {
  constructor(
    private readonly ingredientCategoryRepository: IngredientCategoryRepository,
  ) {}

  async execute(
    command: CreateIngredientCategoryCommand,
  ): Promise<IngredientCategory> {
    const ingredientCategory = IngredientCategory.create({
      id: randomUUID(),
      name: command.name,
    });

    const existingIngredientCategory =
      await this.ingredientCategoryRepository.findByName(
        ingredientCategory.name,
      );

    if (existingIngredientCategory) {
      throw new DuplicatedIngredientCategoryNameError();
    }

    await this.ingredientCategoryRepository.save(ingredientCategory);

    return ingredientCategory;
  }
}
