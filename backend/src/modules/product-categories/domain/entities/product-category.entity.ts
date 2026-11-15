import { BaseEntityProps } from '@shared/domain/entities/base.entity';
import { InvalidProductCategoryError } from '../errors/invalid-product-category.error';

export const PRODUCT_CATEGORY_NAME_MAX_LENGTH = 50;

export interface ProductCategoryProps extends BaseEntityProps {
  name: string;
  sortOrder: number;
}

export class ProductCategory {
  private constructor(private readonly props: ProductCategoryProps) {}

  static create(props: {
    id: string;
    name: string;
    sortOrder: number;
  }): ProductCategory {
    const name = ProductCategory.validateName(props.name);

    if (!Number.isInteger(props.sortOrder) || props.sortOrder < 0) {
      throw new InvalidProductCategoryError(
        'El orden de la categoría debe ser un entero mayor o igual a 0.',
      );
    }

    const now = new Date();
    return new ProductCategory({
      id: props.id,
      name,
      sortOrder: props.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Reconstruye la entidad desde persistencia, sin re-validar invariantes de creación. */
  static reconstitute(props: ProductCategoryProps): ProductCategory {
    return new ProductCategory(props);
  }

  private static validateName(rawName: string): string {
    const name = rawName?.trim();

    if (!name) {
      throw new InvalidProductCategoryError(
        'El nombre de la categoría es obligatorio.',
      );
    }

    if (name.length > PRODUCT_CATEGORY_NAME_MAX_LENGTH) {
      throw new InvalidProductCategoryError(
        `El nombre de la categoría no puede superar ${PRODUCT_CATEGORY_NAME_MAX_LENGTH} caracteres.`,
      );
    }

    return name;
  }

  rename(name: string): void {
    this.props.name = ProductCategory.validateName(name);
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): ProductCategoryProps {
    return { ...this.props };
  }
}
