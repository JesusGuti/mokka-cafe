import { expect, it } from "vitest";
import { toIngredientPayload } from "./to-ingredient-payload";

const VALID = {
  name: "Café",
  unit: "gramos",
  categoryId: "11111111-1111-4111-8111-111111111111",
  minStockThreshold: "",
};

it.each([
  ["", undefined],
  ["0", 0],
  ["5", 5],
  ["5.5", 5.5],
])("mapea stock %j a %j", (input, expected) => {
  expect(
    toIngredientPayload({ ...VALID, minStockThreshold: input })
      .minStockThreshold,
  ).toBe(expected);
});
