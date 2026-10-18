import { UserRole } from '@generated/prisma/enums';
import {
  BadRequestException,
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
import { CreateIngredientUseCase } from '../../application/use-cases/create-ingredient.use-case';
import { GetIngredientUseCase } from '../../application/use-cases/get-ingredient.use-case';
import { ListIngredientUseCase } from '../../application/use-cases/list-ingredient.use-case';
import { DuplicatedIngredientNameError } from '../../domain/errors/duplicated-ingredient.error';
import { IngredientNotFoundError } from '../../domain/errors/ingredient-not-found.error';
import { IngredientCategoryNotFoundError } from '../../../ingredient-categories/domain/errors/ingredient-category-not-found.error';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientResponseDto } from './dto/ingredient-response.dto';
import { InvalidUnitError } from '../../domain/errors/invalid-unit.error';
import { InvalidIngredientError } from '../../domain/errors/invalid-ingredient.error';
import { InvalidMinStockThresholdError } from '../../domain/errors/invalid-min-stock-threshold.error';
import { InvalidIngredientCategoryError } from '../../../ingredient-categories/domain/errors/invalid-ingredient-category.error';

@Controller('ingredients')
export class IngredientController {
  constructor(
    private readonly createIngredientUseCase: CreateIngredientUseCase,
    private readonly getIngredientUseCase: GetIngredientUseCase,
    private readonly listIngredientsUseCase: ListIngredientUseCase,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateIngredientDto,
  ): Promise<IngredientResponseDto> {
    try {
      const ingredient = await this.createIngredientUseCase.execute({
        ...dto,
        minStockThreshold: dto.minStockThreshold ?? null,
      });

      return IngredientResponseDto.fromDomain(ingredient);
    } catch (error) {
      if (error instanceof DuplicatedIngredientNameError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof IngredientCategoryNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof InvalidIngredientError ||
        error instanceof InvalidIngredientCategoryError ||
        error instanceof InvalidMinStockThresholdError ||
        error instanceof InvalidUnitError
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<IngredientResponseDto[]> {
    const ingredients = await this.listIngredientsUseCase.execute();
    return ingredients.map((ingredient) =>
      IngredientResponseDto.fromDomain(ingredient),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IngredientResponseDto> {
    try {
      const ingredient = await this.getIngredientUseCase.execute(id);
      return IngredientResponseDto.fromDomain(ingredient);
    } catch (error) {
      if (error instanceof IngredientNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
