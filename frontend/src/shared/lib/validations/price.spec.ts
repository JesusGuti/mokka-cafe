import { describe, expect, it } from "vitest";
import { createPriceSchema, PRICE_SCHEMA_ERROR_MESSAGES } from "./price";

const messageOf = (
  schema: ReturnType<typeof createPriceSchema>,
  value: string,
) => {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0].message;
};

describe("createPriceSchema (producto: mayor a 0)", () => {
  const schema = createPriceSchema();

  it.each([
    "4",
    "4.5",
    "4,50",
    "Bs 4,50",
    "0.01",
    "100000",
    "100000.00",
    "  4,50  ",
  ])("AC-2.2: acepta %j", (value) => {
    expect(schema.safeParse(value).success).toBe(true);
  });

  it("conserva el texto tal cual (sin transformar) para que el form lo muestre igual", () => {
    expect(schema.parse("  4,50 ")).toBe("4,50");
  });

  it("AC-2.7: vacío o solo espacios → obligatorio", () => {
    expect(messageOf(schema, "")).toBe(PRICE_SCHEMA_ERROR_MESSAGES.required);
    expect(messageOf(schema, "   ")).toBe(PRICE_SCHEMA_ERROR_MESSAGES.required);
  });

  it.each(["abc", "-1", "4.555", "1.234,50", "$4.50", "1e3", "4,"])(
    "AC-2.7: rechaza %j como precio inválido",
    (value) => {
      expect(messageOf(schema, value)).toBe(
        PRICE_SCHEMA_ERROR_MESSAGES.invalid,
      );
    },
  );

  it("AC-2.7: rechaza 0 (producto con precio 0 no permitido, D-11)", () => {
    expect(messageOf(schema, "0")).toBe(PRICE_SCHEMA_ERROR_MESSAGES.positive);
    expect(messageOf(schema, "0,00")).toBe(
      PRICE_SCHEMA_ERROR_MESSAGES.positive,
    );
  });

  it("AC-2.7: rechaza lo que supere Bs 100.000,00", () => {
    expect(messageOf(schema, "100000.01")).toBe(
      PRICE_SCHEMA_ERROR_MESSAGES.max,
    );
    expect(messageOf(schema, "99999999999")).toBe(
      PRICE_SCHEMA_ERROR_MESSAGES.max,
    );
  });

  it("devuelve un solo mensaje por campo (el primero que falla)", () => {
    const result = schema.safeParse("abc");
    expect(result.success ? 0 : result.error.issues).toHaveLength(1);
  });
});

describe("createPriceSchema({ allowZero: true }) (opciones)", () => {
  const schema = createPriceSchema({ allowZero: true });

  it("AC-4.2: acepta 0 (opción gratuita)", () => {
    expect(schema.safeParse("0").success).toBe(true);
    expect(schema.safeParse("0,00").success).toBe(true);
  });

  it("sigue rechazando negativos, texto y el tope", () => {
    expect(messageOf(schema, "-1")).toBe(PRICE_SCHEMA_ERROR_MESSAGES.invalid);
    expect(messageOf(schema, "abc")).toBe(PRICE_SCHEMA_ERROR_MESSAGES.invalid);
    expect(messageOf(schema, "100000.01")).toBe(
      PRICE_SCHEMA_ERROR_MESSAGES.max,
    );
  });
});
