import { IngredientCategory } from '../entities/ingredient-category.entity';
import { IngredientCategoryRepository } from './ingredient-category.repository';

export class InMemoryIngredientCategoryRepository implements IngredientCategoryRepository {
  private readonly ingredientCategories = new Map<string, IngredientCategory>();

  save(ingredientCategory: IngredientCategory): Promise<void> {
    this.ingredientCategories.set(ingredientCategory.id, ingredientCategory);
    return Promise.resolve();
  }

  findAll(): Promise<IngredientCategory[]> {
    return Promise.resolve([...this.ingredientCategories.values()]);
  }

  findById(id: string): Promise<IngredientCategory | null> {
    return Promise.resolve(this.ingredientCategories.get(id) ?? null);
  }
  findByName(name: string): Promise<IngredientCategory | null> {
    const ingredientCategory = [...this.ingredientCategories.values()].find(
      (ic) => ic.name === name,
    );
    return Promise.resolve(ingredientCategory ?? null);
  }
}
