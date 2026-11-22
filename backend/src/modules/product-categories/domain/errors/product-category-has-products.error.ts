export class ProductCategoryHasProductsError extends Error {
  constructor(readonly productCount: number) {
    super(
      productCount === 1
        ? 'Tiene 1 producto. Muévelo o archívalo primero'
        : `Tiene ${productCount} productos. Muévelos o archívalos primero`,
    );
    this.name = 'ProductCategoryHasProductsError';
  }
}
