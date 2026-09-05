"use client";

import { UserForm } from "@/features/users/components/user-form";
import { UsersTable } from "@/features/users/components/users-table";

export default function UsersPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
      <div className="flex items-center justify-end">
        <UserForm />
      </div>
      <UsersTable />
    </div>
  );
}
