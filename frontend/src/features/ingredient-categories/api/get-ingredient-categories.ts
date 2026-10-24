import { apiClient } from "@/shared/lib/api/client";
import { IngredientCategoryResponse } from "../types/ingredient-categories.types";

export async function getIngredientCategories(): Promise<
  IngredientCategoryResponse[]
> {
  const { data } = await apiClient.get<IngredientCategoryResponse[]>(
    "/ingredient-categories",
  );
  return data;
}
