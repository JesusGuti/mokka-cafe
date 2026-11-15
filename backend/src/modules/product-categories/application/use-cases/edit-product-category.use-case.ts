import { Injectable } from '@nestjs/common';
import { ProductCategory } from '../../domain/entities/product-category.entity';
import { ProductCategoryNotFoundError } from '../../domain/errors/product-category-not-found.error';
import { ProductCategoryRepository } from '../../domain/ports/product-category.repository';

export interface EditProductCategoryCommand {
  id: string;
  name: string;
}

@Injectable()
export class EditProductCategoryUseCase {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute(command: EditProductCategoryCommand): Promise<ProductCategory> {
    const productCategory = await this.productCategoryRepository.findById(
      command.id,
    );

    if (!productCategory) {
      throw new ProductCategoryNotFoundError(command.id);
    }

    productCategory.rename(command.name);

    await this.productCategoryRepository.update(productCategory);

    return productCategory;
  }
}
