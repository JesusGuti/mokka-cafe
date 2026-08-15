import { Module } from '@nestjs/common';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { ProductRepository } from './domain/ports/product.repository';
import { ProductController } from './infrastructure/http/product.controller';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';

@Module({
  controllers: [ProductController],
  providers: [
    { provide: ProductRepository, useClass: PrismaProductRepository },
    CreateProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
