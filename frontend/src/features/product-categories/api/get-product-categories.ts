import { apiClient } from "@/shared/lib/api/client";
import { ProductCategoryWithCountResponse } from "../types/product-category.types";

export async function getProductCategories(): Promise<
  ProductCategoryWithCountResponse[]
> {
  const { data } =
    await apiClient.get<ProductCategoryWithCountResponse[]>(
      "/product-categories",
    );

  return data;
}
