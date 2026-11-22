import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { formatDate } from "@/shared/helpers/date";
import { buildProductCategory } from "../testing/product-category.fixtures";
import { buildProductCategoriesTableColumns } from "./product-categories-table-columns";

/**
 * `column.cell` es solo una función `(context) => ReactNode`: se invoca directo
 * con un contexto fake que implementa lo que usa cada celda (`getValue`, `row`).
 */
type CellContext = {
  getValue?: () => unknown;
  row?: { original: ReturnType<typeof buildProductCategory> };
};

const buildColumns = () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const columns = buildProductCategoriesTableColumns({ onDelete, onEdit });
  return { columns, onDelete, onEdit };
};

const findCell = (
  columns: ReturnType<typeof buildProductCategoriesTableColumns>,
  key: string,
) => {
  const column = columns.find(
    (col) =>
      ("accessorKey" in col && col.accessorKey === key) || col.id === key,
  );
  return column!.cell as (context: CellContext) => ReactNode;
};

describe("buildProductCategoriesTableColumns", () => {
  it("define las columnas nombre, productos, creada y acciones", () => {
    const { columns } = buildColumns();

    expect(
      columns.map((col) => ("accessorKey" in col ? col.accessorKey : col.id)),
    ).toEqual(["name", "productCount", "createdAt", "actions"]);
  });

  it("la columna de acciones no se puede ordenar", () => {
    const { columns } = buildColumns();

    const actions = columns.find((col) => col.id === "actions");

    expect(actions?.enableSorting).toBe(false);
  });

  it("muestra la cantidad de productos de la categoría", () => {
    const { columns } = buildColumns();

    render(<>{findCell(columns, "productCount")({ getValue: () => 4 })}</>);

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("muestra 0 cuando la categoría no tiene productos", () => {
    const { columns } = buildColumns();

    render(<>{findCell(columns, "productCount")({ getValue: () => 0 })}</>);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("muestra la fecha de creación formateada", () => {
    const { columns } = buildColumns();
    const iso = "2026-10-25T01:29:53.000Z";

    render(<>{findCell(columns, "createdAt")({ getValue: () => iso })}</>);

    // Intl pone un espacio fino (U+202F) antes de "p. m."; Testing Library
    // normaliza los espacios del DOM, así que el texto esperado también.
    const expected = formatDate(iso).replace(/\s+/g, " ");
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  describe("acciones", () => {
    const renderActions = () => {
      const { columns, onDelete, onEdit } = buildColumns();
      const category = buildProductCategory({ name: "Calientes" });
      render(
        <>{findCell(columns, "actions")({ row: { original: category } })}</>,
      );
      return { category, onDelete, onEdit };
    };

    it("«Editar» avisa con la categoría de esa fila", () => {
      const { category, onDelete, onEdit } = renderActions();

      fireEvent.click(screen.getByRole("button", { name: "Editar Calientes" }));

      expect(onEdit).toHaveBeenCalledWith(category);
      expect(onDelete).not.toHaveBeenCalled();
    });

    it("«Eliminar» avisa con la categoría de esa fila", () => {
      const { category, onDelete, onEdit } = renderActions();

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar Calientes" }),
      );

      expect(onDelete).toHaveBeenCalledWith(category);
      expect(onEdit).not.toHaveBeenCalled();
    });
  });
});
