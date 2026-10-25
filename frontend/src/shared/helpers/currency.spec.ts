import { describe, expect, it } from "vitest";
import {
  centsToInputValue,
  formatCurrency,
  parseCurrencyToCents,
} from "./currency";

describe("parseCurrencyToCents", () => {
  it.each([
    ["4", 400],
    ["4.5", 450],
    ["4,5", 450],
    ["4.50", 450],
    ["4,50", 450],
    ["0.05", 5],
    ["0,5", 50],
    ["1.15", 115], // 1.15 * 100 en float da 114.99999…
    ["19.99", 1999],
    ["007", 700],
    ["Bs 4,50", 450],
    ["Bs. 4,50", 450],
    ["bs4.5", 450],
    ["  4,50  ", 450],
    ["Bs 4,50", 450], // lo que produce Intl al formatear
  ])("AC-2.2 / AC-2.8: %j → %i centavos", (input, expected) => {
    expect(parseCurrencyToCents(input)).toBe(expected);
  });

  it.each([
    [""],
    ["   "],
    ["abc"],
    ["-1"],
    ["-4.50"],
    ["4.555"], // más de 2 decimales
    ["4,"],
    [".5"],
    ["4..5"],
    ["4.5.0"],
    ["1.234,50"], // separador de miles: ambiguo, se rechaza
    ["$4.50"],
    ["Bs"],
    ["4 Bs"],
    ["1e3"],
    ["Infinity"],
    ["NaN"],
  ])("AC-2.7: %j no es un precio válido → null", (input) => {
    expect(parseCurrencyToCents(input)).toBeNull();
  });

  it("devuelve null si el resultado no es un entero seguro", () => {
    expect(parseCurrencyToCents("99999999999999999999")).toBeNull();
  });

  it("no valida mínimo ni máximo (eso es del schema)", () => {
    expect(parseCurrencyToCents("0")).toBe(0);
    expect(parseCurrencyToCents("100000.01")).toBe(10_000_001);
  });
});

describe("centsToInputValue", () => {
  it.each([
    [0, "0.00"],
    [5, "0.05"],
    [450, "4.50"],
    [1999, "19.99"],
    [10_000_000, "100000.00"],
  ])("%i centavos → %j", (cents, expected) => {
    expect(centsToInputValue(cents)).toBe(expected);
  });

  it("es el inverso de parseCurrencyToCents", () => {
    for (const cents of [0, 1, 99, 100, 450, 1999, 10_000_000]) {
      expect(parseCurrencyToCents(centsToInputValue(cents))).toBe(cents);
    }
  });
});

describe("formatCurrency", () => {
  // Intl separa el símbolo del monto con un espacio de no separación (U+00A0).
  it.each([
    [0, "Bs 0,00"],
    [450, "Bs 4,50"],
    [1999, "Bs 19,99"],
    [123_450, "Bs 1.234,50"],
  ])("%i centavos → %j", (cents, expected) => {
    expect(formatCurrency(cents)).toBe(expected);
  });

  it("lo que se formatea se puede volver a parsear", () => {
    expect(parseCurrencyToCents(formatCurrency(450))).toBe(450);
  });
});
