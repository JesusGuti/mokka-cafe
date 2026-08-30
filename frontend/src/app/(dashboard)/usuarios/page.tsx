"use client";

import { UserForm } from "@/features/users/components/user-form";

export default function UsersPage() {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4 lg:p-6">
      <UserForm />
    </div>
  );
}
