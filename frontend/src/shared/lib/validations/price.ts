import { z } from "zod";
import {
  formatCurrency,
  MAX_PRICE_CENTS,
  parseCurrencyToCents,
} from "@/shared/helpers/currency";

export const PRICE_SCHEMA_ERROR_MESSAGES = {
  required: "El precio es obligatorio",
  invalid: "Escribe un precio válido, por ejemplo 4,50",
  positive: "El precio debe ser mayor a 0",
  max: `El precio no puede superar ${formatCurrency(MAX_PRICE_CENTS)}`,
};

interface PriceSchemaOptions {
  /** `true` para precios que pueden ser gratuitos (ej. opciones "Sin azúcar"). */
  allowZero?: boolean;
}

/**
 * Valida el texto de un campo de precio. Devuelve un `string` (no centavos): igual
 * que el resto de schemas de formulario, no transforma; la conversión a centavos
 * se hace con `parseCurrencyToCents` al armar el payload (`to<Entidad>Payload`).
 *
 * Productos: `createPriceSchema()` (mayor a 0).
 * Opciones/modificadores: `createPriceSchema({ allowZero: true })`.
 */
export function createPriceSchema({
  allowZero = false,
}: PriceSchemaOptions = {}) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") {
        ctx.addIssue({
          code: "custom",
          message: PRICE_SCHEMA_ERROR_MESSAGES.required,
        });
        return;
      }

      const cents = parseCurrencyToCents(value);

      if (cents === null) {
        ctx.addIssue({
          code: "custom",
          message: PRICE_SCHEMA_ERROR_MESSAGES.invalid,
        });
      } else if (cents === 0 && !allowZero) {
        ctx.addIssue({
          code: "custom",
          message: PRICE_SCHEMA_ERROR_MESSAGES.positive,
        });
      } else if (cents > MAX_PRICE_CENTS) {
        ctx.addIssue({
          code: "custom",
          message: PRICE_SCHEMA_ERROR_MESSAGES.max,
        });
      }
    });
}
