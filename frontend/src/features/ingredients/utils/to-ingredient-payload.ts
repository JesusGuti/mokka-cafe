import type { IngredientFormValues } from "../schemas/ingredients.schema";
import type { IngredientPayload } from "../types/ingredients.types";

export const toIngredientPayload = (
  v: IngredientFormValues,
): IngredientPayload => ({
  name: v.name,
  unit: v.unit,
  categoryId: v.categoryId,
  minStockThreshold:
    v.minStockThreshold === "" ? undefined : Number(v.minStockThreshold),
});
