import { Module } from '@nestjs/common';
import { ProductCategoryController } from './infrastructure/http/product-category.controller';
import { ProductCategoryRepository } from './domain/ports/product-category.repository';
import { PrismaProductCategoryRepository } from './infrastructure/persistence/prisma-product-category.repository';
import { CreateProductCategoryUseCase } from './application/use-cases/create-product-category.use-case';
import { EditProductCategoryUseCase } from './application/use-cases/edit-product-category.use-case';
import { DeleteProductCategoryUseCase } from './application/use-cases/delete-product-category.use-case';
import { ListProductCategoryUseCase } from './application/use-cases/list-product-category.use-case';

@Module({
  controllers: [ProductCategoryController],
  providers: [
    {
      provide: ProductCategoryRepository,
      useClass: PrismaProductCategoryRepository,
    },
    CreateProductCategoryUseCase,
    EditProductCategoryUseCase,
    DeleteProductCategoryUseCase,
    ListProductCategoryUseCase,
  ],
  exports: [ProductCategoryRepository],
})
export class ProductCategoriesModule {}
