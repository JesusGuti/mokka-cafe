export class DuplicatedProductCategoryNameError extends Error {
  constructor() {
    super('Ya existe una categoría con ese nombre');
    this.name = 'DuplicatedProductCategoryNameError';
  }
}
