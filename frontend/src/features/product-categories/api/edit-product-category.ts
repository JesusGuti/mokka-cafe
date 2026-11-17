import { apiClient } from "@/shared/lib/api/client";
import { ProductCategoryResponse } from "../types/product-category.types";
import { ProductCategoryPayload } from "../schemas/product-categories.schema";

export async function editProductCategory(
  id: string,
  payload: ProductCategoryPayload,
): Promise<ProductCategoryResponse> {
  const { data } = await apiClient.patch<ProductCategoryResponse>(
    `/product-categories/${id}`,
    payload,
  );
  return data;
}
