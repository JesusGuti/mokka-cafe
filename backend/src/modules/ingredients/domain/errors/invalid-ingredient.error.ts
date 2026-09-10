export class InvalidIngredientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIngredientError';
  }
}
