import { ProductCategory } from '../../../domain/entities/product-category.entity';
import { ProductCategoryWithCount } from '../../../domain/ports/product-category.repository';

export class ProductCategoryResponseDto {
  id!: string;
  name!: string;
  sortOrder!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(
    productCategory: ProductCategory,
  ): ProductCategoryResponseDto {
    const dto = new ProductCategoryResponseDto();
    dto.id = productCategory.id;
    dto.name = productCategory.name;
    dto.sortOrder = productCategory.sortOrder;
    dto.createdAt = productCategory.createdAt;
    dto.updatedAt = productCategory.updatedAt;
    return dto;
  }
}

export class ProductCategoryWithCountResponseDto extends ProductCategoryResponseDto {
  productCount!: number;

  static fromReadModel({ category, productCount }: ProductCategoryWithCount) {
    const dto = new ProductCategoryWithCountResponseDto();
    Object.assign(dto, ProductCategoryResponseDto.fromDomain(category));
    dto.productCount = productCount;
    return dto;
  }
}
