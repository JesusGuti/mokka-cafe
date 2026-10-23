export const ingredientsKeys = {
  all: ["ingredients"] as const,
  lists: () => [...ingredientsKeys.all, "list"] as const,
};
