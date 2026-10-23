import { describe, expect, it } from "vitest";
import { toIngredientPayload } from "./to-ingredient-payload";

const VALUES = {
  name: "Café",
  unit: "gramos",
  categoryId: "11111111-1111-4111-8111-111111111111",
  minStockThreshold: "",
};

describe("toIngredientPayload", () => {
  it("copia name, unit y categoryId tal cual", () => {
    expect(toIngredientPayload(VALUES)).toMatchObject({
      name: "Café",
      unit: "gramos",
      categoryId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it.each([
    ["", undefined],
    ["0", 0],
    ["5", 5],
    ["5.5", 5.5],
  ])("mapea el stock %j a %j", (input, expected) => {
    const payload = toIngredientPayload({
      ...VALUES,
      minStockThreshold: input,
    });

    expect(payload.minStockThreshold).toBe(expected);
  });
});
