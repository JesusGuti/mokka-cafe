import { apiClient } from "@/shared/lib/api/client";
import type { IngredientCategoryPayload } from "../schemas/ingredient-categories.schema";
import { IngredientCategoryResponse } from "../types/ingredient-categories.types";

export async function createIngredientCategory(
  payload: IngredientCategoryPayload,
): Promise<IngredientCategoryResponse> {
  const { data } = await apiClient.post<IngredientCategoryResponse>(
    "/ingredient-categories",
    payload,
  );
  return data;
}
