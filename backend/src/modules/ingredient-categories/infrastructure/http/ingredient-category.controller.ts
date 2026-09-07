import { UserRole } from '@generated/prisma/enums';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CreateIngredientCategoryUseCase } from '../../application/use-cases/create-ingredient-category.use-case';
import { DuplicatedIngredientCategoryNameError } from '../../domain/errors/duplicated-ingredient-category-name.error';
import { CreateIngredientCategoryDto } from './dto/create-ingredient-category.dto';
import { IngredientCategoryResponseDto } from './dto/ingredient-category-response.dto';
import { GetIngredientCategoryUseCase } from '../../application/use-cases/get-ingredient-category.use-case';
import { ListIngredientCategoryUseCase } from '../../application/use-cases/list-ingredient-category.use-case';
import { IngredientCategoryNotFoundError } from '../../domain/errors/ingredient-category-not-found.error';

@Controller('ingredient-categories')
export class IngredientCategoryController {
  constructor(
    private readonly createIngredientCategory: CreateIngredientCategoryUseCase,
    private readonly getIngredientCategory: GetIngredientCategoryUseCase,
    private readonly listIngredientCategories: ListIngredientCategoryUseCase,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateIngredientCategoryDto,
  ): Promise<IngredientCategoryResponseDto> {
    try {
      const ingredientCategory =
        await this.createIngredientCategory.execute(dto);
      return IngredientCategoryResponseDto.fromDomain(ingredientCategory);
    } catch (error) {
      if (error instanceof DuplicatedIngredientCategoryNameError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<IngredientCategoryResponseDto[]> {
    const ingredientCategories = await this.listIngredientCategories.execute();
    return ingredientCategories.map((category) =>
      IngredientCategoryResponseDto.fromDomain(category),
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<IngredientCategoryResponseDto> {
    try {
      const ingredientCategory = await this.getIngredientCategory.execute(id);
      return IngredientCategoryResponseDto.fromDomain(ingredientCategory);
    } catch (error) {
      if (error instanceof IngredientCategoryNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
