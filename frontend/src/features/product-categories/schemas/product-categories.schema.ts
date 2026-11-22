import { z } from "zod";

// Debe coincidir con PRODUCT_CATEGORY_NAME_MAX_LENGTH del backend.
export const PRODUCT_CATEGORY_NAME_MAX_LENGTH = 50;

export const PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES = {
  name: {
    min: "El nombre es obligatorio.",
    max: `El nombre no puede superar los ${PRODUCT_CATEGORY_NAME_MAX_LENGTH} caracteres.`,
  },
};

export const productCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.min)
    .max(
      PRODUCT_CATEGORY_NAME_MAX_LENGTH,
      PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.max,
    ),
});

export type ProductCategoryPayload = z.infer<typeof productCategorySchema>;
