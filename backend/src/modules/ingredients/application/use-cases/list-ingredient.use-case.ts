import { Injectable } from '@nestjs/common';
import { Ingredient } from '../../domain/entities/ingredient.entity';
import { IngredientRepository } from '../../domain/ports/ingredient.repository';

@Injectable()
export class ListIngredientUseCase {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  execute(): Promise<Ingredient[]> {
    return this.ingredientRepository.findAll();
  }
}
