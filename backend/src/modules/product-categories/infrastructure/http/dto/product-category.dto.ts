import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PRODUCT_CATEGORY_NAME_MAX_LENGTH } from '../../../domain/entities/product-category.entity';

export class CreateProductCategoryDto {
  /** Se recorta antes de validar: "  Calientes  " cuenta como 9 caracteres, no 13. */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(PRODUCT_CATEGORY_NAME_MAX_LENGTH)
  name!: string;
}

/** El id viaja en la ruta (`PATCH /product-categories/:id`), no en el body. */
export class UpdateProductCategoryDto extends CreateProductCategoryDto {}
