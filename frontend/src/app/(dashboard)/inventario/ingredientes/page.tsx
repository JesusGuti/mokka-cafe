"use client";

import { IngredientForm } from "@/features/ingredients/components/ingredient-form";
import { IngredientsTable } from "@/features/ingredients/components/ingredients-table";

export default function IngredientsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
      <div className="flex items-center justify-end">
        <IngredientForm />
      </div>
      <IngredientsTable />
    </div>
  );
}
