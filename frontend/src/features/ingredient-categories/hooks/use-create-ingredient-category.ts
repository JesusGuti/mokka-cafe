import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { getQueryClient } from "@/shared/lib/query-client";
import { createIngredientCategory } from "../api/create-ingredient-category";
import { ingredientCategoriesKeys } from "../api/ingredient-categories.keys";
import type { IngredientCategoryPayload } from "../schemas/ingredient-categories.schema";
import { IngredientCategoryResponse } from "../types/ingredient-categories.types";

export const useCreateIngredientCategory = () => {
  const queryClient = getQueryClient();
  return useMutation<
    IngredientCategoryResponse,
    AxiosError<ApiErrorResponse>,
    IngredientCategoryPayload
  >({
    mutationFn: createIngredientCategory,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientCategoriesKeys.lists() });
    },
  });
};
