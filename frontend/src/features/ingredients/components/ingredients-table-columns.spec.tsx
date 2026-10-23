import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { buildIngredientsTableColumns } from "./ingredients-table-columns";

const columns = buildIngredientsTableColumns({
  categoryNameById: { "cat-1": "Lácteos" },
});

/**
 * `column.cell`/`column.accessorFn` son solo funciones. No hace falta tabla
 * ni harness para probarlas: se invocan directo con un contexto/fila fake
 * que solo implementa lo que este archivo realmente usa. Ver el mismo
 * patrón en users-table-columns.spec.tsx.
 */
function findColumn(id: string) {
  return columns.find(
    (col) => ("accessorKey" in col && col.accessorKey === id) || col.id === id,
  )!;
}

function fakeContext(value: unknown) {
  return { getValue: () => value };
}

describe("buildIngredientsTableColumns", () => {
  describe("columna category", () => {
    const categoryColumn = findColumn("category");

    it("resuelve el nombre de la categoría a partir del categoryId", () => {
      const accessorFn = (
        categoryColumn as unknown as {
          accessorFn: (row: { categoryId: string }) => unknown;
        }
      ).accessorFn;

      expect(accessorFn({ categoryId: "cat-1" })).toBe("Lácteos");
    });

    it("devuelve el categoryId crudo si no hay nombre mapeado", () => {
      const accessorFn = (
        categoryColumn as unknown as {
          accessorFn: (row: { categoryId: string }) => unknown;
        }
      ).accessorFn;

      expect(accessorFn({ categoryId: "cat-desconocido" })).toBe(
        "cat-desconocido",
      );
    });
  });

  describe("columna minStockThreshold", () => {
    const cell = findColumn("minStockThreshold").cell as (context: {
      getValue: () => unknown;
    }) => ReactNode;

    it('muestra "Sin definir" cuando el valor es null', () => {
      render(<>{cell(fakeContext(null))}</>);

      expect(screen.getByText("Sin definir")).toBeInTheDocument();
    });

    it("muestra el valor numérico cuando está definido", () => {
      render(<>{cell(fakeContext(5))}</>);

      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("columna createdAt", () => {
    const cell = findColumn("createdAt").cell as (context: {
      getValue: () => unknown;
    }) => ReactNode;

    it("delega el formateo de la fecha sin romper (la lógica de formato vive en formatDate)", () => {
      render(<>{cell(fakeContext("2026-01-15T10:00:00.000Z"))}</>);

      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });
});
