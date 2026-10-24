import { useQuery } from "@tanstack/react-query";
import { getIngredients } from "../api/get-ingredients";
import { ingredientsKeys } from "../api/ingredients.keys";

export const useGetIngredients = () => {
  return useQuery({
    queryKey: ingredientsKeys.lists(),
    queryFn: getIngredients,
  });
};
