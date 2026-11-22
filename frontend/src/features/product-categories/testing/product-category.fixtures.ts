import type { ProductCategoryWithCountResponse } from "../types/product-category.types";

export const buildProductCategory = (
  overrides: Partial<ProductCategoryWithCountResponse> = {},
): ProductCategoryWithCountResponse => ({
  id: "cat-1",
  name: "Calientes",
  sortOrder: 0,
  productCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});
