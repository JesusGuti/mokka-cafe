import { BaseEntityProps } from '@shared/domain/entities/base.entity';
import { InvalidIngredientCategoryError } from '../errors/invalid-ingredient-category.error';

export interface IngredientCategoryProps extends BaseEntityProps {
  name: string;
}

/**
 * Entidad de dominio. No conoce Prisma, HTTP, ni Nest.
 */
export class IngredientCategory {
  private constructor(private readonly props: IngredientCategoryProps) {}

  static create(props: { id: string; name: string }): IngredientCategory {
    const name = props.name?.trim();
    if (!name) {
      throw new InvalidIngredientCategoryError(
        'El nombre de la categoría es obligatorio',
      );
    }

    const now = new Date();
    return new IngredientCategory({
      id: props.id,
      name,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Reconstruye la entidad desde persistencia, sin re-validar invariantes de creación. */
  static reconstitute(props: IngredientCategoryProps): IngredientCategory {
    return new IngredientCategory(props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): IngredientCategoryProps {
    return { ...this.props };
  }
}
