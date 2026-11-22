export class ProductCategoryNotFoundError extends Error {
  constructor(readonly id: string) {
    super('Esta categoría ya no existe');
    this.name = 'ProductCategoryNotFoundError';
  }
}
