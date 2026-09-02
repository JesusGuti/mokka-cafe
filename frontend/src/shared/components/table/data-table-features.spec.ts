import { describe, expect, it } from "vitest";
import { filterFn_faceted } from "./data-table-features";

const fakeRow = (value: unknown) =>
  ({ getValue: () => value }) as unknown as Parameters<typeof filterFn_faceted>[0];

describe("filterFn_faceted", () => {
  it("devuelve true cuando filterValue incluye el valor de la fila", () => {
    expect(filterFn_faceted(fakeRow("ADMIN"), "role", ["ADMIN", "CAJERO"])).toBe(
      true,
    );
  });

  it("devuelve false cuando filterValue no incluye el valor de la fila", () => {
    expect(filterFn_faceted(fakeRow("PRUEBA"), "role", ["ADMIN", "CAJERO"])).toBe(
      false,
    );
  });

  it("devuelve true cuando no hay filtro definido (filterValue undefined)", () => {
    expect(filterFn_faceted(fakeRow("ADMIN"), "role", undefined)).toBe(true);
  });

  it("devuelve true cuando filterValue es un arreglo vacío", () => {
    expect(filterFn_faceted(fakeRow("ADMIN"), "role", [])).toBe(true);
  });

  it("compara por string, así el valor de la celda sea boolean (columna isActive)", () => {
    expect(filterFn_faceted(fakeRow(true), "isActive", ["true"])).toBe(true);
    expect(filterFn_faceted(fakeRow(false), "isActive", ["true"])).toBe(false);
  });

  describe("autoRemove", () => {
    it("es true cuando el valor es undefined", () => {
      expect(filterFn_faceted.autoRemove?.(undefined)).toBe(true);
    });

    it("es true cuando el valor es un arreglo vacío", () => {
      expect(filterFn_faceted.autoRemove?.([])).toBe(true);
    });

    it("es false cuando hay al menos un valor seleccionado", () => {
      expect(filterFn_faceted.autoRemove?.(["ADMIN"])).toBe(false);
    });
  });
});
