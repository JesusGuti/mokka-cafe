import { Injectable } from '@nestjs/common';
import { IngredientNotFoundError } from '../../domain/errors/ingredient-not-found.error';
import { Ingredient } from '../../domain/entities/ingredient.entity';
import { IngredientRepository } from '../../domain/ports/ingredient.repository';

@Injectable()
export class GetIngredientUseCase {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async execute(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findById(id);

    if (!ingredient) {
      throw new IngredientNotFoundError(id);
    }

    return ingredient;
  }
}
