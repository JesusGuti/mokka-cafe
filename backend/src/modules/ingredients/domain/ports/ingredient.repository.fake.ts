import { Ingredient } from '../entities/ingredient.entity';
import { IngredientRepository } from './ingredient.repository';

export class InMemoryIngredientRepository implements IngredientRepository {
  private readonly ingredients = new Map<string, Ingredient>();

  save(ingredient: Ingredient): Promise<void> {
    this.ingredients.set(ingredient.id, ingredient);
    return Promise.resolve();
  }

  findAll(): Promise<Ingredient[]> {
    return Promise.resolve([...this.ingredients.values()]);
  }

  findById(id: string): Promise<Ingredient | null> {
    return Promise.resolve(this.ingredients.get(id) ?? null);
  }

  findByName(name: string): Promise<Ingredient | null> {
    const ingredient = [...this.ingredients.values()].find(
      (ingredient) => ingredient.name === name,
    );
    return Promise.resolve(ingredient ?? null);
  }
}
