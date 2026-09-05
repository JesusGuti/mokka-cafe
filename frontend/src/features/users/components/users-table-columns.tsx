"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/shared/components/ui/badge";
import { DataTableColumnHeader } from "@/shared/components/table/data-table-column-header";
import type { DataTableFeatures } from "@/shared/components/table/data-table-features";
import { formatDate } from "@/shared/lib/format";
import { USER_ROLE_LABELS, UserResponse } from "../types/users.types";

export const usersTableColumns: ColumnDef<DataTableFeatures, UserResponse>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Correo" />,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    filterFn: "faceted",
    cell: ({ getValue }) => {
      const role = getValue<string>();
      return <Badge variant="secondary">{USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS] ?? role}</Badge>;
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    filterFn: "faceted",
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge>Activo</Badge>
      ) : (
        <Badge variant="destructive">Inactivo</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Creado" />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>
    ),
  },
];
