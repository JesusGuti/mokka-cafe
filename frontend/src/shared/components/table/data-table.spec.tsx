import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import type { DataTableFeatures } from "./data-table-features";

interface TestRow {
  id: string;
  name: string;
}

const rows: TestRow[] = [
  { id: "1", name: "Beta" },
  { id: "2", name: "Alfa" },
  { id: "3", name: "Gamma" },
];

const columns: ColumnDef<DataTableFeatures, TestRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
  },
];

function getBodyCellTexts() {
  const table = screen.getByRole("table");
  return within(table)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);
}

describe("DataTable", () => {
  it("renderiza el header y las filas recibidas", () => {
    render(<DataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    expect(screen.getByRole("button", { name: "Nombre" })).toBeInTheDocument();
    expect(getBodyCellTexts()).toEqual(["Beta", "Alfa", "Gamma"]);
  });

  it("muestra el mensaje vacío cuando no hay datos", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No hay nada." />);

    expect(screen.getByText("No hay nada.")).toBeInTheDocument();
  });

  it("muestra filas de esqueleto mientras isLoading es true", () => {
    render(<DataTable columns={columns} data={[]} isLoading pageSize={2} />);

    // 1 fila de header + `pageSize` filas de esqueleto.
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("ordena las filas al clickear el header de una columna ordenable", () => {
    render(<DataTable columns={columns} data={rows} getRowId={(row) => row.id} />);

    const header = screen.getByRole("button", { name: "Nombre" });

    fireEvent.click(header);
    expect(getBodyCellTexts()).toEqual(["Alfa", "Beta", "Gamma"]);

    fireEvent.click(header);
    expect(getBodyCellTexts()).toEqual(["Gamma", "Beta", "Alfa"]);
  });

  it("pagina los resultados según pageSize", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={1}
      />,
    );

    expect(getBodyCellTexts()).toEqual(["Beta"]);

    fireEvent.click(screen.getByRole("button", { name: /página siguiente/i }));
    expect(getBodyCellTexts()).toEqual(["Alfa"]);
  });

  it("expande y contrae una fila mostrando renderSubRow", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        renderSubRow={(row) => <span>Detalle de {row.original.name}</span>}
      />,
    );

    expect(screen.queryByText("Detalle de Beta")).not.toBeInTheDocument();

    const [expandFirstRow] = screen.getAllByRole("button", { name: "Expandir fila" });
    fireEvent.click(expandFirstRow);

    expect(screen.getByText("Detalle de Beta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Contraer fila" }));
    expect(screen.queryByText("Detalle de Beta")).not.toBeInTheDocument();
  });
});
