export class IngredientCategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Categoría de ingrediente con id "${id}" no encontrada`);
    this.name = 'IngredientCategoryNotFoundError';
  }
}
