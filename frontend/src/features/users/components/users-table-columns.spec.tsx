import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { usersTableColumns } from "./users-table-columns";

/**
 * `column.cell` es solo una función `(context) => ReactNode`. No hace falta
 * tabla ni harness para probarla: se invoca directo con un contexto fake que
 * solo implementa lo que las celdas de este archivo realmente usan
 * (`getValue`).
 */
function findCell(accessorKey: string) {
  const column = usersTableColumns.find(
    (col) => "accessorKey" in col && col.accessorKey === accessorKey,
  );
  return column!.cell as (context: { getValue: () => unknown }) => ReactNode;
}

function fakeContext(value: unknown) {
  return { getValue: () => value };
}

describe("usersTableColumns", () => {
  describe("columna role", () => {
    const roleCell = findCell("role");

    it("muestra el label traducido para un rol conocido", () => {
      render(<>{roleCell(fakeContext("ADMIN"))}</>);

      expect(screen.getByText("Administrador")).toBeInTheDocument();
    });

    it("muestra el valor crudo si el rol no está en el diccionario de labels", () => {
      render(<>{roleCell(fakeContext("SUPERVISOR"))}</>);

      expect(screen.getByText("SUPERVISOR")).toBeInTheDocument();
    });
  });

  describe("columna isActive", () => {
    const isActiveCell = findCell("isActive");

    it('muestra "Activo" cuando el usuario está activo', () => {
      render(<>{isActiveCell(fakeContext(true))}</>);

      expect(screen.getByText("Activo")).toBeInTheDocument();
    });

    it('muestra "Inactivo" cuando el usuario está inactivo', () => {
      render(<>{isActiveCell(fakeContext(false))}</>);

      expect(screen.getByText("Inactivo")).toBeInTheDocument();
    });
  });

  describe("columna createdAt", () => {
    const createdAtCell = findCell("createdAt");

    it("delega el formateo de la fecha sin romper (la lógica de formato vive en formatDate)", () => {
      render(<>{createdAtCell(fakeContext("2026-01-15T10:00:00.000Z"))}</>);

      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });
});
