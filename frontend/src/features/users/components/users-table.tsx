"use client";

import { DataTable } from "@/shared/components/table/data-table";
import { DataTableFacetedFilter } from "@/shared/components/table/data-table-faceted-filter";
import { DataTableToolbar } from "@/shared/components/table/data-table-toolbar";
import { useGetUsers } from "../hooks/use-get-users";
import { USER_ROLE_LABELS, USER_ROLES } from "../types/users.types";
import { usersTableColumns } from "./users-table-columns";

const ROLE_OPTIONS = USER_ROLES.map((role) => ({
  label: USER_ROLE_LABELS[role],
  value: role,
}));

const STATUS_OPTIONS = [
  { label: "Activo", value: "true" },
  { label: "Inactivo", value: "false" },
];

export function UsersTable() {
  const { data: users = [], isLoading } = useGetUsers();

  return (
    <DataTable
      columns={usersTableColumns}
      data={users}
      isLoading={isLoading}
      getRowId={(user) => user.id}
      emptyMessage="No hay usuarios registrados."
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchPlaceholder="Buscar por nombre o correo..."
        >
          <DataTableFacetedFilter
            column={table.getColumn("role")!}
            title="Rol"
            options={ROLE_OPTIONS}
          />
          <DataTableFacetedFilter
            column={table.getColumn("isActive")!}
            title="Estado"
            options={STATUS_OPTIONS}
          />
        </DataTableToolbar>
      )}
    />
  );
}
