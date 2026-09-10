export class DuplicatedIngredientNameError extends Error {
  constructor() {
    super('El nombre del ingrediente ya está en uso');
    this.name = 'DuplicatedIngredientNameError';
  }
}
