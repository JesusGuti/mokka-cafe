import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { getQueryClient } from "@/shared/lib/query-client";
import { createIngredient } from "../api/create-ingredient";
import { ingredientsKeys } from "../api/ingredients.keys";
import { IngredientPayload, IngredientResponse } from "../types/ingredients.types";

export const useCreateIngredient = () => {
  const queryClient = getQueryClient();
  return useMutation<
    IngredientResponse,
    AxiosError<ApiErrorResponse>,
    IngredientPayload
  >({
    mutationFn: createIngredient,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ingredientsKeys.lists() });
    },
  });
};
