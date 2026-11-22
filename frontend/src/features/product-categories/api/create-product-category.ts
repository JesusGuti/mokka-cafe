import { apiClient } from "@/shared/lib/api/client";
import { ProductCategoryPayload } from "../schemas/product-categories.schema";
import { ProductCategoryResponse } from "../types/product-category.types";

export async function createProductCategory(
  payload: ProductCategoryPayload,
): Promise<ProductCategoryResponse> {
  const { data } = await apiClient.post<ProductCategoryResponse>(
    "/product-categories",
    payload,
  );

  return data;
}
