export interface ProductCategoryResponse {
  id: string;
  name: string;
  sortOrder: number;
  /** Instante ISO (el JSON no tiene tipo fecha). Se muestra con `formatDate`. */
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryWithCountResponse extends ProductCategoryResponse {
  productCount: number;
}
