export class IngredientNotFoundError extends Error {
  constructor(id: string) {
    super(`Ingrediente con id "${id}" no encontrado`);
    this.name = 'IngredientNotFoundError';
  }
}
