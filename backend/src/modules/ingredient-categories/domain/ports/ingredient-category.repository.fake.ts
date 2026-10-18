import { IngredientCategory } from '../entities/ingredient-category.entity';
import { DuplicatedIngredientCategoryNameError } from '../errors/duplicated-ingredient-category-name.error';
import { IngredientCategoryRepository } from './ingredient-category.repository';

export class InMemoryIngredientCategoryRepository implements IngredientCategoryRepository {
  private readonly ingredientCategories = new Map<string, IngredientCategory>();

  create(ingredientCategory: IngredientCategory): Promise<void> {
    const nameTaken = [...this.ingredientCategories.values()].some(
      (existing) => existing.name === ingredientCategory.name,
    );
    if (nameTaken) {
      return Promise.reject(new DuplicatedIngredientCategoryNameError());
    }
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
