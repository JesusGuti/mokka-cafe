import { ProductCategory } from '../entities/product-category.entity';

/** Modelo de lectura: la entidad no conoce cuántos productos tiene. */
export interface ProductCategoryWithCount {
  category: ProductCategory;
  productCount: number;
}

export abstract class ProductCategoryRepository {
  /** @throws DuplicatedProductCategoryNameError si el nombre ya existe (sin importar mayúsculas). */
  abstract create(productCategory: ProductCategory): Promise<void>;

  /**
   * @throws ProductCategoryNotFoundError si la categoría ya no existe.
   * @throws DuplicatedProductCategoryNameError si el nombre choca con otra categoría.
   */
  abstract update(productCategory: ProductCategory): Promise<void>;

  /**
   * @throws ProductCategoryNotFoundError si la categoría ya no existe.
   * @throws ProductCategoryHasProductsError si todavía tiene productos.
   */
  abstract delete(id: string): Promise<void>;

  abstract findById(id: string): Promise<ProductCategory | null>;

  /** Ordenadas por `sortOrder` y luego por nombre. */
  abstract findAllWithProductCount(): Promise<ProductCategoryWithCount[]>;

  abstract countProducts(id: string): Promise<number>;

  /** `max(sortOrder) + 1`, o 0 si todavía no hay categorías. */
  abstract getNextSortOrder(): Promise<number>;
}
