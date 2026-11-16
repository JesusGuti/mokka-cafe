import { UserRole } from '@generated/prisma/enums';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProductCategoryUseCase } from '../../application/use-cases/create-product-category.use-case';
import { DeleteProductCategoryUseCase } from '../../application/use-cases/delete-product-category.use-case';
import { EditProductCategoryUseCase } from '../../application/use-cases/edit-product-category.use-case';
import { ListProductCategoryUseCase } from '../../application/use-cases/list-product-category.use-case';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import {
  ProductCategoryResponseDto,
  ProductCategoryWithCountResponseDto,
} from './dto/product-category.response.dto';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/product-category.dto';
import { DuplicatedProductCategoryNameError } from '../../domain/errors/duplicated-product-category-name.error';
import { InvalidProductCategoryError } from '../../domain/errors/invalid-product-category.error';
import { ProductCategoryNotFoundError } from '../../domain/errors/product-category-not-found.error';
import { ProductCategoryHasProductsError } from '../../domain/errors/product-category-has-products.error';

@Controller('product-categories')
export class ProductCategoryController {
  constructor(
    private readonly createProductCategory: CreateProductCategoryUseCase,
    private readonly deleteProductCategory: DeleteProductCategoryUseCase,
    private readonly editProductCategory: EditProductCategoryUseCase,
    private readonly listProductCategories: ListProductCategoryUseCase,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateProductCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    try {
      const productCategory = await this.createProductCategory.execute(dto);
      return ProductCategoryResponseDto.fromDomain(productCategory);
    } catch (error) {
      if (error instanceof DuplicatedProductCategoryNameError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof InvalidProductCategoryError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      await this.deleteProductCategory.execute(id);
    } catch (error) {
      if (error instanceof ProductCategoryNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ProductCategoryHasProductsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async edit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductCategoryDto,
  ): Promise<ProductCategoryResponseDto> {
    try {
      const updatedProductCategory = await this.editProductCategory.execute({
        ...dto,
        id,
      });
      return ProductCategoryResponseDto.fromDomain(updatedProductCategory);
    } catch (error) {
      if (error instanceof ProductCategoryNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof DuplicatedProductCategoryNameError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof InvalidProductCategoryError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ProductCategoryWithCountResponseDto[]> {
    const productCategories = await this.listProductCategories.execute();
    return productCategories.map((productCategory) =>
      ProductCategoryWithCountResponseDto.fromReadModel({
        category: productCategory.category,
        productCount: productCategory.productCount,
      }),
    );
  }
}
