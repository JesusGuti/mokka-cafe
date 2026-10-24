export const ingredientCategoriesKeys = {
  all: ["ingredient-categories"] as const,
  lists: () => [...ingredientCategoriesKeys.all, "list"] as const,
};
