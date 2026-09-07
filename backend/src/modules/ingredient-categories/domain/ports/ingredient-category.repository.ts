import { IngredientCategory } from '../entities/ingredient-category.entity';

export abstract class IngredientCategoryRepository {
  abstract save(ingredientCategory: IngredientCategory): Promise<void>;
  abstract findAll(): Promise<IngredientCategory[]>;
  abstract findById(id: string): Promise<IngredientCategory | null>;
  abstract findByName(name: string): Promise<IngredientCategory | null>;
}
