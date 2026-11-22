"use client";

import { CreateProductCategoryForm } from "@/features/product-categories/components/create-product-category-form";
import { ProductCategoriesTable } from "@/features/product-categories/components/product-categories-table";

export default function ProductCategoriesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
      <div className="flex items-center justify-end">
        <CreateProductCategoryForm />
      </div>
      <ProductCategoriesTable />
    </div>
  );
}
