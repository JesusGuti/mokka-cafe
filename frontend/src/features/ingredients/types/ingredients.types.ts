export interface IngredientResponse {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
  currentStockQty: number;
  minStockThreshold: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Forma que espera POST /ingredients (ver CreateIngredientDto en el backend). */
export interface IngredientPayload {
  name: string;
  unit: string;
  categoryId: string;
  minStockThreshold?: number;
}
