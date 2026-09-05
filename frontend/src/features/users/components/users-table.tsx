"use client";

import { DataTable } from "@/shared/components/table/data-table";
import { useGetUsers } from "../hooks/use-get-users";
import { usersTableColumns } from "./users-table-columns";
import { UsersTableFilters } from "./users-table-filters";

export const UsersTable = () => {
  const { data: users = [], isLoading } = useGetUsers();

  return (
    <DataTable
      columns={usersTableColumns}
      data={users}
      isLoading={isLoading}
      getRowId={(user) => user.id}
      emptyMessage="No hay usuarios registrados."
      toolbar={(table) => <UsersTableFilters table={table} />}
    />
  );
};
