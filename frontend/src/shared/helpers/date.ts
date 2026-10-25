const LOCALE = "es-BO";

// El negocio opera en una sola zona horaria (Bolivia, UTC-4, sin horario de verano).
// Fijarla hace que la misma fecha se vea igual sin importar dónde corra el código:
// servidor de Next (UTC), navegador, o CI. Sin esto, el HTML del servidor y el del
// cliente difieren y React avisa de un hydration mismatch.
const TIME_ZONE = "America/La_Paz";

const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

/**
 * Fecha y hora para mostrar. `"2026-10-25T01:29:53.000Z"` → `"24 oct de 2026, 9:29 p. m."`.
 *
 * Nunca lanza: un valor ausente o inválido (ej. `lastLoginAt` de un usuario que aún no
 * entró) devuelve `fallback`. `Intl` lanza `RangeError` con una fecha inválida, y eso
 * tumbaría toda la tabla por una sola celda.
 *
 * Espera un instante completo (ISO con hora, como los `Timestamptz` del backend). Un
 * string solo con fecha (`"2023-01-01"`) se interpreta como medianoche UTC y se vería
 * como el día anterior en Bolivia.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  fallback: string = EMPTY_VALUE,
): string {
  if (date === null || date === undefined || date === "") return fallback;

  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? fallback : dateFormatter.format(value);
}
