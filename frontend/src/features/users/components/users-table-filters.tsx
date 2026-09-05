import { DataTableFacetedFilter } from "@/shared/components/table/data-table-faceted-filter";
import { DataTableToolbar } from "@/shared/components/table/data-table-toolbar";
import type { DataTableInstance } from "@/shared/components/table/data-table";
import { USER_ROLES, USER_ROLE_LABELS, UserResponse } from "../types/users.types";

const ROLE_OPTIONS = USER_ROLES.map((role) => ({
  label: USER_ROLE_LABELS[role],
  value: role,
}));

const STATUS_OPTIONS = [
  { label: "Activo", value: "true" },
  { label: "Inactivo", value: "false" },
];

interface UsersTableFiltersProps {
  table: DataTableInstance<UserResponse>;
}

export const UsersTableFilters = ({ table }: UsersTableFiltersProps) => {
  return (
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
  );
};
