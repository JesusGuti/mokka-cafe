import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTable } from "@tanstack/react-table";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { features } from "./data-table-features";

interface TestRow {
  id: string;
  role: string;
}

const data: TestRow[] = [
  { id: "1", role: "ADMIN" },
  { id: "2", role: "CAJERO" },
];

const ROLE_OPTIONS = [
  { label: "Administrador", value: "ADMIN" },
  { label: "Cajero", value: "CAJERO" },
];

/**
 * El estado de la tabla (v9) vive en atoms de `@tanstack/store`. Para que los
 * cambios de filtro disparen un re-render real hay que llamar `useTable`
 * dentro del mismo árbol donde se renderiza el componente bajo prueba, en vez
 * de sacar la `column` con `renderHook` y pasarla por afuera.
 */
function Harness() {
  const table = useTable({
    features,
    columns: [{ accessorKey: "role" }],
    data,
  });

  return (
    <DataTableFacetedFilter
      column={table.getColumn("role")!}
      title="Rol"
      options={ROLE_OPTIONS}
    />
  );
}

describe("DataTableFacetedFilter", () => {
  it("no muestra el contador de seleccionados cuando no hay filtro activo", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: "Rol" })).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("selecciona una opción y muestra el contador en el trigger", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Rol" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Administrador" }));

    expect(screen.getByRole("button", { name: "Rol1" })).toBeInTheDocument();
  });

  it("deselecciona una opción ya marcada", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Rol" }));
    const adminOption = screen.getByRole("menuitemcheckbox", { name: "Administrador" });

    fireEvent.click(adminOption);
    expect(screen.getByRole("button", { name: "Rol1" })).toBeInTheDocument();

    fireEvent.click(adminOption);
    expect(screen.getByRole("button", { name: "Rol" })).toBeInTheDocument();
  });

  it("permite seleccionar varias opciones a la vez", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Rol" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Administrador" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Cajero" }));

    expect(screen.getByRole("button", { name: "Rol2" })).toBeInTheDocument();
  });

  it('"Limpiar filtro" resetea la selección', () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Rol" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Administrador" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Limpiar filtro" }));

    expect(screen.getByRole("button", { name: "Rol" })).toBeInTheDocument();
  });
});
