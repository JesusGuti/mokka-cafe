import { Module } from '@nestjs/common';
import { IngredientCategoriesModule } from '../ingredient-categories/ingredient-categories.module';
import { CreateIngredientUseCase } from './application/use-cases/create-ingredient.use-case';
import { GetIngredientUseCase } from './application/use-cases/get-ingredient.use-case';
import { ListIngredientUseCase } from './application/use-cases/list-ingredient.use-case';
import { IngredientRepository } from './domain/ports/ingredient.repository';
import { IngredientController } from './infrastructure/http/ingredient.controller';
import { PrismaIngredientRepository } from './infrastructure/persistence/prisma-ingredient.repository';

@Module({
  imports: [IngredientCategoriesModule],
  controllers: [IngredientController],
  providers: [
    {
      provide: IngredientRepository,
      useClass: PrismaIngredientRepository,
    },
    CreateIngredientUseCase,
    GetIngredientUseCase,
    ListIngredientUseCase,
  ],
  exports: [IngredientRepository],
})
export class IngredientsModule {}
