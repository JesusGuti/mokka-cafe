export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Producto con id "${id}" no encontrado`);
    this.name = 'ProductNotFoundError';
  }
}
