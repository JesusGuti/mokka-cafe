import { ProductCategory } from '../entities/product-category.entity';
import { DuplicatedProductCategoryNameError } from '../errors/duplicated-product-category-name.error';
import { ProductCategoryHasProductsError } from '../errors/product-category-has-products.error';
import { ProductCategoryNotFoundError } from '../errors/product-category-not-found.error';
import {
  ProductCategoryRepository,
  ProductCategoryWithCount,
} from './product-category.repository';

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Copia para que mutar una entidad no cambie lo "persistido" sin pasar por update(). */
const clone = (category: ProductCategory) =>
  ProductCategory.reconstitute(category.toPrimitives());

export class InMemoryProductCategoryRepository implements ProductCategoryRepository {
  private readonly productCategories = new Map<string, ProductCategory>();
  private readonly productCounts = new Map<string, number>();

  /** Solo para tests: simula cuántos productos tiene una categoría. */
  setProductCount(categoryId: string, count: number): void {
    this.productCounts.set(categoryId, count);
  }

  private isNameTaken(name: string, exceptId?: string): boolean {
    return [...this.productCategories.values()].some(
      (existing) => existing.id !== exceptId && sameName(existing.name, name),
    );
  }

  create(productCategory: ProductCategory): Promise<void> {
    if (this.isNameTaken(productCategory.name)) {
      return Promise.reject(new DuplicatedProductCategoryNameError());
    }

    this.productCategories.set(productCategory.id, clone(productCategory));
    return Promise.resolve();
  }

  update(productCategory: ProductCategory): Promise<void> {
    if (!this.productCategories.has(productCategory.id)) {
      return Promise.reject(
        new ProductCategoryNotFoundError(productCategory.id),
      );
    }

    if (this.isNameTaken(productCategory.name, productCategory.id)) {
      return Promise.reject(new DuplicatedProductCategoryNameError());
    }

    this.productCategories.set(productCategory.id, clone(productCategory));
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    if (!this.productCategories.has(id)) {
      return Promise.reject(new ProductCategoryNotFoundError(id));
    }

    const productCount = this.productCounts.get(id) ?? 0;
    if (productCount > 0) {
      return Promise.reject(new ProductCategoryHasProductsError(productCount));
    }

    this.productCategories.delete(id);
    return Promise.resolve();
  }

  findById(id: string): Promise<ProductCategory | null> {
    const category = this.productCategories.get(id);
    return Promise.resolve(category ? clone(category) : null);
  }

  findAllWithProductCount(): Promise<ProductCategoryWithCount[]> {
    const rows = [...this.productCategories.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((category) => ({
        category: clone(category),
        productCount: this.productCounts.get(category.id) ?? 0,
      }));
    return Promise.resolve(rows);
  }

  countProducts(id: string): Promise<number> {
    return Promise.resolve(this.productCounts.get(id) ?? 0);
  }

  getNextSortOrder(): Promise<number> {
    const orders = [...this.productCategories.values()].map((c) => c.sortOrder);
    return Promise.resolve(orders.length ? Math.max(...orders) + 1 : 0);
  }
}
