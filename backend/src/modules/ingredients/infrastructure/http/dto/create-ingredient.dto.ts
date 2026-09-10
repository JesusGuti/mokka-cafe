import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  unit!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @Min(0)
  @IsNumber()
  minStockThreshold?: number;
}
