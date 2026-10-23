import { useQuery } from "@tanstack/react-query";
import { getIngredientCategories } from "../api/get-ingredient-categories";
import { ingredientCategoriesKeys } from "../api/ingredient-categories.keys";

export const useGetIngredientCategories = () => {
  return useQuery({
    queryKey: ingredientCategoriesKeys.lists(),
    queryFn: getIngredientCategories,
  });
};
