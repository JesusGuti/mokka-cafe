import { z } from "zod";

export const INGREDIENT_CATEGORY_SCHEMA_ERROR_MESSAGES = {
  name: {
    min: "El nombre debe tener al menos 2 caracteres",
    max: "El nombre no puede superar los 200 caracteres",
  },
};

export const ingredientCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, INGREDIENT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.min)
    .max(200, INGREDIENT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.max),
});

export type IngredientCategoryPayload = z.infer<
  typeof ingredientCategorySchema
>;
