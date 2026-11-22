"use client";

import { Pencil, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/shared/components/table/data-table-column-header";
import type { DataTableFeatures } from "@/shared/components/table/data-table-features";
import { Button } from "@/shared/components/ui/button";
import { formatDate } from "@/shared/helpers/date";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductCategoryWithCountResponse } from "../types/product-category.types";

interface BuildProductCategoriesTableColumnsParams {
  onDelete: (category: ProductCategoryWithCountResponse) => void;
  onEdit: (category: ProductCategoryWithCountResponse) => void;
}

export const buildProductCategoriesTableColumns = ({
  onDelete,
  onEdit,
}: BuildProductCategoriesTableColumnsParams): ColumnDef<
  DataTableFeatures,
  ProductCategoryWithCountResponse
>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
  },
  {
    accessorKey: "productCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productos" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<number>()}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creada" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatDate(getValue<string>())}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    header: () => <span className="sr-only">Acciones</span>,
    // Las acciones van a la vista (no tras un menú "⋯") en escritorio; en
    // pantallas chicas queda solo el ícono, con nombre accesible igual.
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Editar ${row.original.name}`}
          onClick={() => onEdit(row.original)}
        >
          <Pencil />
          <span className="hidden sm:inline">Editar</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          aria-label={`Eliminar ${row.original.name}`}
          onClick={() => onDelete(row.original)}
        >
          <Trash2 />
          <span className="hidden sm:inline">Eliminar</span>
        </Button>
      </div>
    ),
  },
];
