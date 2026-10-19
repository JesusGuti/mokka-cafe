export class InvalidIngredientCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIngredientCategoryError';
  }
}
