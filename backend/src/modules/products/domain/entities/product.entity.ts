import { InvalidProductError } from '../errors/invalid-product.error';

export interface ProductProps {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  categoryId: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de dominio. No conoce Prisma, HTTP, ni Nest.
 * Encapsula las reglas de negocio e invariantes de un producto.
 */
export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: {
    id: string;
    name: string;
    description?: string | null;
    priceCents: number;
    categoryId: string;
    isAvailable?: boolean;
  }): Product {
    const name = props.name?.trim();
    if (!name) {
      throw new InvalidProductError('El nombre del producto es obligatorio');
    }
    if (!Number.isInteger(props.priceCents) || props.priceCents < 0) {
      throw new InvalidProductError(
        'El precio debe ser un entero positivo expresado en centavos',
      );
    }
    if (!props.categoryId?.trim()) {
      throw new InvalidProductError('La categoría del producto es obligatoria');
    }

    const now = new Date();
    return new Product({
      id: props.id,
      name,
      description: props.description ?? null,
      priceCents: props.priceCents,
      categoryId: props.categoryId.trim(),
      isAvailable: props.isAvailable ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Reconstruye la entidad desde persistencia, sin re-validar invariantes de creación. */
  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  markUnavailable(): void {
    this.props.isAvailable = false;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | null {
    return this.props.description;
  }
  get priceCents(): number {
    return this.props.priceCents;
  }
  get categoryId(): string {
    return this.props.categoryId;
  }
  get isAvailable(): boolean {
    return this.props.isAvailable;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPrimitives(): ProductProps {
    return { ...this.props };
  }
}
