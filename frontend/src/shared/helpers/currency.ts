const LOCALE = "es-BO";
const CURRENCY = "BOB";

/** Tope de precio de un producto: Bs 100.000,00 (D-11 en docs/features/catalogo). */
export const MAX_PRICE_CENTS = 10_000_000;

// Se crea una sola vez: instanciar Intl.NumberFormat en cada render es caro.
const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

/** Centavos → texto para mostrar. `450` → `"Bs 4,50"`. */
export function formatCurrency(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

// Entero, y opcionalmente un separador (`.` o `,`) con 1 o 2 decimales.
// No acepta separadores de miles: "1.234" sería ambiguo (¿1234 o 1,234?).
const PRICE_PATTERN = /^(\d+)(?:[.,](\d{1,2}))?$/;

/**
 * Texto escrito por una persona → centavos enteros, o `null` si no es un precio válido.
 *
 * Acepta `"4"`, `"4.5"`, `"4,50"`, `"Bs 4,50"`, `"bs.4.5"`. Rechaza vacío, negativos,
 * texto, más de 2 decimales y separadores de miles. No valida rangos (mínimo/máximo):
 * eso es de cada schema, porque un modificador puede costar 0 y un producto no.
 *
 * La conversión es con enteros (nunca `parseFloat(x) * 100`: `1.15 * 100` da 114.99999…).
 */
export function parseCurrencyToCents(input: string): number | null {
  const cleaned = input.replace(/^\s*Bs\.?/i, "").replaceAll(/\s/g, "");

  const match = PRICE_PATTERN.exec(cleaned);
  if (!match) return null;

  const [, integerPart, decimalPart = ""] = match;
  const cents = Number(integerPart) * 100 + Number(decimalPart.padEnd(2, "0"));

  return Number.isSafeInteger(cents) ? cents : null;
}

/**
 * Centavos → texto para un `<input>` al editar. `450` → `"4.50"`.
 * Usa punto porque es el separador que mantiene `input-utils` en modo decimal.
 */
export function centsToInputValue(amountCents: number): string {
  const integerPart = Math.trunc(amountCents / 100);
  const decimalPart = String(Math.abs(amountCents % 100)).padStart(2, "0");
  return `${integerPart}.${decimalPart}`;
}
