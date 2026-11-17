import { ApiErrorResponse } from "@/shared/types/api-error";
import { getQueryClient } from "@/shared/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { editProductCategory } from "../api/edit-product-category";
import { productCategoriesKeys } from "../api/product-categories.keys";
import { ProductCategoryPayload } from "../schemas/product-categories.schema";
import { ProductCategoryResponse } from "../types/product-category.types";
import { AxiosError } from "axios";

interface EditProductCategoryVariables {
  id: string;
  payload: ProductCategoryPayload;
}

export function useEditProductCategory() {
  const queryClient = getQueryClient();

  return useMutation<
    ProductCategoryResponse,
    AxiosError<ApiErrorResponse>,
    EditProductCategoryVariables
  >({
    mutationFn: ({ id, payload }) => editProductCategory(id, payload),
    retry: false,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: productCategoriesKeys.lists(),
      });
    },
  });
}
