"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/shared/components/table/data-table-column-header";
import type { DataTableFeatures } from "@/shared/components/table/data-table-features";
import { formatDate } from "@/shared/helpers/date";
import { IngredientResponse } from "../types/ingredients.types";

interface BuildIngredientsTableColumnsParams {
  /** id de categoría -> nombre, para mostrar el nombre sin embeberlo en la API. */
  categoryNameById: Record<string, string>;
}

export const buildIngredientsTableColumns = ({
  categoryNameById,
}: BuildIngredientsTableColumnsParams): ColumnDef<
  DataTableFeatures,
  IngredientResponse
>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad" />
    ),
  },
  {
    id: "category",
    accessorFn: (row) => categoryNameById[row.categoryId] ?? row.categoryId,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    filterFn: "faceted",
  },
  {
    accessorKey: "currentStockQty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock actual" />
    ),
  },
  {
    accessorKey: "minStockThreshold",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock mínimo" />
    ),
    cell: ({ getValue }) => {
      const value = getValue<number | null>();
      return (
        <span className="text-muted-foreground">
          {value === null ? "Sin definir" : value}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatDate(getValue<string>())}
      </span>
    ),
  },
];
