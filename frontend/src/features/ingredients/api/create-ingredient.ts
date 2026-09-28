import { apiClient } from "@/shared/lib/api/client";
import { IngredientPayload, IngredientResponse } from "../types/ingredients.types";

export async function createIngredient(
  payload: IngredientPayload,
): Promise<IngredientResponse> {
  const { data } = await apiClient.post<IngredientResponse>(
    "/ingredients",
    payload,
  );
  return data;
}
