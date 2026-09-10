import { Module } from '@nestjs/common';
import { CreateIngredientCategoryUseCase } from './application/use-cases/create-ingredient-category.use-case';
import { GetIngredientCategoryUseCase } from './application/use-cases/get-ingredient-category.use-case';
import { IngredientCategoryRepository } from './domain/ports/ingredient-category.repository';
import { IngredientCategoryController } from './infrastructure/http/ingredient-category.controller';
import { ListIngredientCategoryUseCase } from './application/use-cases/list-ingredient-category.use-case';
import { PrismaIngredientCategoryRepository } from './infrastructure/persistence/prisma-ingredient-category.repository';

@Module({
  controllers: [IngredientCategoryController],
  providers: [
    {
      provide: IngredientCategoryRepository,
      useClass: PrismaIngredientCategoryRepository,
    },
    CreateIngredientCategoryUseCase,
    GetIngredientCategoryUseCase,
    ListIngredientCategoryUseCase,
  ],
  exports: [IngredientCategoryRepository],
})
export class IngredientCategoriesModule {}
