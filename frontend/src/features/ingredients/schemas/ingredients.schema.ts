import { z } from "zod";

export const INGREDIENT_SCHEMA_ERROR_MESSAGES = {
  name: {
    min: "El nombre debe tener al menos 2 caracteres",
    max: "El nombre no puede superar los 200 caracteres",
  },
  unit: {
    min: "La unidad debe tener al menos 2 caracteres",
    max: "La unidad no puede superar los 200 caracteres",
  },
  categoryId: {
    invalid: "Selecciona una categoría válida",
  },
  minStockThreshold: {
    invalid: "El stock mínimo no puede ser negativo",
  },
};

/**
 * `minStockThreshold` queda como string acá (FormInput/useInput con
 * mode="decimal" nunca entrega un number, ver use-input.ts) — se normaliza a
 * number|undefined recién al armar el payload en `to-ingredient-payload.ts`,
 * no en el propio schema. Mismo criterio simple que `userSchema` (sin
 * transforms): el schema valida la forma que ve el form, no la que espera
 * el backend.
 */
export const ingredientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, INGREDIENT_SCHEMA_ERROR_MESSAGES.name.min)
    .max(200, INGREDIENT_SCHEMA_ERROR_MESSAGES.name.max),
  unit: z
    .string()
    .trim()
    .min(2, INGREDIENT_SCHEMA_ERROR_MESSAGES.unit.min)
    .max(200, INGREDIENT_SCHEMA_ERROR_MESSAGES.unit.max),
  categoryId: z
    .string()
    .trim()
    .pipe(z.uuid(INGREDIENT_SCHEMA_ERROR_MESSAGES.categoryId.invalid)),
  minStockThreshold: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (Number.isFinite(Number(v)) && Number(v) >= 0),
      INGREDIENT_SCHEMA_ERROR_MESSAGES.minStockThreshold.invalid,
    ),
});

export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;
