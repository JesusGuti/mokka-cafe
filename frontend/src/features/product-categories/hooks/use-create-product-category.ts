import { getQueryClient } from "@/shared/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { ProductCategoryResponse } from "../types/product-category.types";
import { ApiErrorResponse } from "@/shared/types/api-error";
import { ProductCategoryPayload } from "../schemas/product-categories.schema";
import { createProductCategory } from "../api/create-product-category";
import { productCategoriesKeys } from "../api/product-categories.keys";
import { AxiosError } from "axios";

export function useCreateProductCategory() {
  const queryClient = getQueryClient();

  return useMutation<
    ProductCategoryResponse,
    AxiosError<ApiErrorResponse>,
    ProductCategoryPayload
  >({
    mutationFn: createProductCategory,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productCategoriesKeys.lists(),
      });
    },
  });
}
