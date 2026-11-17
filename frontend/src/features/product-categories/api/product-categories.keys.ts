export const productCategoriesKeys = {
  all: ["product-categories"] as const,
  lists: () => [...productCategoriesKeys.all, "list"] as const,
};
