import { Product } from '../../../domain/entities/product.entity';

export class ProductResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  priceCents!: number;
  category!: string;
  isAvailable!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    Object.assign(dto, product.toPrimitives());
    return dto;
  }
}
