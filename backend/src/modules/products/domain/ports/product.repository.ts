import { Product } from '../entities/product.entity';

/**
 * Puerto (contrato) que define cómo la capa de aplicación accede a la
 * persistencia de productos, sin saber que por debajo hay Prisma/Postgres.
 * La implementación concreta vive en infrastructure/persistence.
 */
export abstract class ProductRepository {
  abstract save(product: Product): Promise<void>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findAll(): Promise<Product[]>;
  abstract delete(id: string): Promise<void>;
}
