import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
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
  @Max(9999999.999)
  @IsNumber({ maxDecimalPlaces: 3 })
  minStockThreshold?: number;
}
