import { apiClient } from "@/shared/lib/api/client";
import { IngredientResponse } from "../types/ingredients.types";

export async function getIngredients(): Promise<IngredientResponse[]> {
  const { data } = await apiClient.get<IngredientResponse[]>("/ingredients");
  return data;
}
