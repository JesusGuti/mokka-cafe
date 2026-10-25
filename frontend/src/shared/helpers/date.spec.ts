import { describe, expect, it } from "vitest";
import { formatDate } from "./date";

// Intl separa "p. m." con un espacio de no separación; se normaliza para que el
// test no dependa de qué espacio exacto emita la versión de ICU.
const normalize = (text: string) => text.replaceAll(/\s/g, " ");

describe("formatDate", () => {
  describe("formato (siempre en hora de Bolivia, UTC-4)", () => {
    it.each([
      ["2023-06-15T15:30:00.000Z", "15 jun de 2023, 11:30 a. m."],
      ["2023-06-15T00:00:00.000Z", "14 jun de 2023, 8:00 p. m."],
      ["2023-12-31T12:00:00.000Z", "31 dic de 2023, 8:00 a. m."],
    ])("%s → %j", (iso, expected) => {
      expect(normalize(formatDate(iso))).toBe(expected);
    });

    it("el día cambia a las 04:00 UTC (medianoche de Bolivia)", () => {
      expect(normalize(formatDate("2023-01-01T03:59:59.000Z"))).toBe(
        "31 dic de 2022, 11:59 p. m.",
      );
      expect(normalize(formatDate("2023-01-01T04:00:00.000Z"))).toBe(
        "1 ene de 2023, 12:00 a. m.",
      );
    });

    it("no depende de la zona horaria de la máquina que corre el test", () => {
      // Se ejecuta con TZ=UTC, TZ=Asia/Tokyo, etc. y el resultado es el mismo
      // porque el formateador fija `timeZone`.
      expect(normalize(formatDate("2023-06-15T15:30:00.000Z"))).toBe(
        "15 jun de 2023, 11:30 a. m.",
      );
    });
  });

  describe("tipos de entrada", () => {
    const iso = "2023-06-15T15:30:00.000Z";
    const expected = "15 jun de 2023, 11:30 a. m.";

    it("acepta un string ISO", () => {
      expect(normalize(formatDate(iso))).toBe(expected);
    });

    it("acepta un Date", () => {
      expect(normalize(formatDate(new Date(iso)))).toBe(expected);
    });

    it("acepta un timestamp en milisegundos", () => {
      expect(normalize(formatDate(new Date(iso).getTime()))).toBe(expected);
    });
  });

  describe("valores ausentes o inválidos (nunca lanza)", () => {
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["string vacío", ""],
      ["texto", "hola"],
      ["fecha inválida", new Date("hola")],
      ["NaN", Number.NaN],
    ])("%s → guion", (_label, value) => {
      expect(formatDate(value)).toBe("—");
    });

    it("permite un fallback propio", () => {
      expect(formatDate(null, "Nunca")).toBe("Nunca");
    });
  });

  it("un string solo con fecha se ve como el día anterior en Bolivia (documentado)", () => {
    // `new Date("2023-01-01")` es medianoche UTC. El backend manda instantes completos
    // (Timestamptz), así que esto no pasa en la práctica; el test fija el comportamiento.
    expect(normalize(formatDate("2023-01-01"))).toBe(
      "31 dic de 2022, 8:00 p. m.",
    );
  });
});
