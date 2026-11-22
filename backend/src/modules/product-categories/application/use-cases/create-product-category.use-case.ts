import { Injectable } from '@nestjs/common';
import { ProductCategoryRepository } from '../../domain/ports/product-category.repository';
import { ProductCategory } from '../../domain/entities/product-category.entity';
import { randomUUID } from 'node:crypto';

export interface CreateProductCategoryCommand {
  name: string;
}

@Injectable()
export class CreateProductCategoryUseCase {
  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute(
    command: CreateProductCategoryCommand,
  ): Promise<ProductCategory> {
    const nextSortOrder =
      await this.productCategoryRepository.getNextSortOrder();

    const productCategory = ProductCategory.create({
      id: randomUUID(),
      name: command.name,
      sortOrder: nextSortOrder,
    });

    await this.productCategoryRepository.create(productCategory);

    return productCategory;
  }
}
