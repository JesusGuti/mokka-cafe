import { Injectable } from '@nestjs/common';
import { ProductCategoryHasProductsError } from '../../domain/errors/product-category-has-products.error';
import { ProductCategoryNotFoundError } from '../../domain/errors/product-category-not-found.error';
import { ProductCategoryRepository } from '../../domain/ports/product-category.repository';

@Injectable()
export class DeleteProductCategoryUseCase {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const productCategory = await this.productCategoryRepository.findById(id);

    if (!productCategory) {
      throw new ProductCategoryNotFoundError(id);
    }

    const productCount = await this.productCategoryRepository.countProducts(id);

    if (productCount > 0) {
      throw new ProductCategoryHasProductsError(productCount);
    }

    await this.productCategoryRepository.delete(id);
  }
}
