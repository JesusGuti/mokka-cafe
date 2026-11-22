import { ApiErrorResponse } from "@/shared/types/api-error";
import { getQueryClient } from "@/shared/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { productCategoriesKeys } from "../api/product-categories.keys";
import { deleteProductCategory } from "../api/delete-product-category";
import { AxiosError } from "axios";

interface DeleteProductCategoryVariables {
  id: string;
}

export function useDeleteProductCategory() {
  const queryClient = getQueryClient();

  return useMutation<
    void,
    AxiosError<ApiErrorResponse>,
    DeleteProductCategoryVariables
  >({
    mutationFn: ({ id }) => deleteProductCategory(id),
    retry: false,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: productCategoriesKeys.lists(),
      });
    },
  });
}
