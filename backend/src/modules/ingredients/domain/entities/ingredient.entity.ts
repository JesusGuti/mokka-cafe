import { BaseEntityProps } from '@shared/domain/entities/base.entity';
import { InvalidIngredientError } from '../errors/invalid-ingredient.error';
import { InvalidUnitError } from '../errors/invalid-unit.error';
import { InvalidMinStockThresholdError } from '../errors/invalid-min-stock-threshold.error';
import { InvalidIngredientCategoryError } from '../../../ingredient-categories/domain/errors/invalid-ingredient-category.error';

export interface IngredientProps extends BaseEntityProps {
  name: string;
  unit: string;
  categoryId: string;
  currentStockQty: number;
  minStockThreshold: number | null;
}

export class Ingredient {
  private constructor(private readonly props: IngredientProps) {}

  static create(props: {
    id: string;
    name: string;
    unit: string;
    categoryId: string;
    minStockThreshold: number | null;
  }): Ingredient {
    const name = props.name?.trim();
    if (!name) {
      throw new InvalidIngredientError('El nombre es obligatorio');
    }

    const unit = props.unit?.trim();
    if (!unit) {
      throw new InvalidUnitError('La unidad es obligatoria');
    }

    if (!props.categoryId) {
      throw new InvalidIngredientCategoryError(
        'La categoria de ingrediente es obligatoria',
      );
    }

    if (
      typeof props.minStockThreshold === 'number' &&
      props.minStockThreshold < 0
    ) {
      throw new InvalidMinStockThresholdError('El stock minimo es inválido');
    }

    const now = new Date();

    return new Ingredient({
      id: props.id,
      name,
      unit,
      categoryId: props.categoryId,
      currentStockQty: 0,
      minStockThreshold: props.minStockThreshold,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: IngredientProps): Ingredient {
    return new Ingredient(props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get unit(): string {
    return this.props.unit;
  }
  get categoryId(): string {
    return this.props.categoryId;
  }
  get currentStockQty(): number {
    return this.props.currentStockQty;
  }
  get minStockThreshold(): number | null {
    return this.props.minStockThreshold;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): IngredientProps {
    return { ...this.props };
  }
}
