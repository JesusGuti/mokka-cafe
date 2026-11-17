import { useQuery } from "@tanstack/react-query";
import { productCategoriesKeys } from "../api/product-categories.keys";
import { getProductCategories } from "../api/get-product-categories";

export function useGetProductCategories() {
  return useQuery({
    queryKey: productCategoriesKeys.lists(),
    queryFn: getProductCategories,
  });
}
