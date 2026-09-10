import { Ingredient } from '../entities/ingredient.entity';

export abstract class IngredientRepository {
  abstract save(ingredient: Ingredient): Promise<void>;
  abstract findAll(): Promise<Ingredient[]>;
  abstract findById(id: string): Promise<Ingredient | null>;
  abstract findByName(name: string): Promise<Ingredient | null>;
}
