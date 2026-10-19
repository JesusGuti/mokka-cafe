import { describe, expect, it } from "vitest";
import {
  ingredientFormSchema,
  INGREDIENT_SCHEMA_ERROR_MESSAGES as MSG,
} from "./ingredients.schema";

const VALID = {
  name: "Café",
  unit: "gramos",
  categoryId: "11111111-1111-4111-8111-111111111111",
  minStockThreshold: "",
};

const parse = (override: Partial<typeof VALID> = {}) =>
  ingredientFormSchema.safeParse({ ...VALID, ...override });

describe("ingredientFormSchema", () => {
  it("acepta un form válido", () => {
    expect(parse().success).toBe(true);
  });

  it("recorta espacios en name, unit y categoryId", () => {
    const result = parse({ name: " Café   ", unit: "  gramos " });
    expect(result.data).toMatchObject({ name: "Café", unit: "gramos" });
  });

  it.each([
    ["name de solo espacios", { name: "   " }, MSG.name.min],
    ["name de 1 carácter", { name: "a" }, MSG.name.min],
    ["name de 201 caracteres", { name: "a".repeat(201) }, MSG.name.max],
    ["unit de 1 carácter", { unit: "g" }, MSG.unit.min],
    ["categoryId vacío", { categoryId: "" }, MSG.categoryId.invalid],
    ["categoryId no uuid", { categoryId: "cat-1" }, MSG.categoryId.invalid],
    [
      "stock negativo",
      { minStockThreshold: "-1" },
      MSG.minStockThreshold.invalid,
    ],
    [
      "stock no numérico",
      { minStockThreshold: "abc" },
      MSG.minStockThreshold.invalid,
    ],
    [
      "stock Infinity",
      { minStockThreshold: "Infinity" },
      MSG.minStockThreshold.invalid,
    ],
    [
      "stock 1e999",
      { minStockThreshold: "1e999" },
      MSG.minStockThreshold.invalid,
    ],
  ])("rechaza %s", (_label, override, message) => {
    const result = parse(override);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.message)).toContain(message);
  });

  it.each(["", "    ", "0", "1", "1.5", "100"])("acepta stock %j", (value) => {
    expect(parse({ minStockThreshold: value }).success).toBe(true);
  });

  it("normaliza el stock de solo espacios a vacío", () => {
    expect(parse({ minStockThreshold: "   " }).data?.minStockThreshold).toBe(
      "",
    );
  });
});
