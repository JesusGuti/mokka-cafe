export class DuplicatedIngredientCategoryNameError extends Error {
  constructor() {
    super('El nombre de la categoría ya está en uso');
    this.name = 'DuplicatedIngredientCategoryNameError';
  }
}
