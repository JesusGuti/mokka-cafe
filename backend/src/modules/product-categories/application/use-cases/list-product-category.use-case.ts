import { Injectable } from '@nestjs/common';
import {
  ProductCategoryRepository,
  ProductCategoryWithCount,
} from '../../domain/ports/product-category.repository';

@Injectable()
export class ListProductCategoryUseCase {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  execute(): Promise<ProductCategoryWithCount[]> {
    return this.productCategoryRepository.findAllWithProductCount();
  }
}
