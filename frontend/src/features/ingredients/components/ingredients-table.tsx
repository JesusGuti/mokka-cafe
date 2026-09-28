"use client";

import { useMemo } from "react";
import { DataTable } from "@/shared/components/table/data-table";
import { useGetIngredientCategories } from "@/features/ingredient-categories/hooks/use-get-ingredient-categories";
import { useGetIngredients } from "../hooks/use-get-ingredients";
import { buildIngredientsTableColumns } from "./ingredients-table-columns";
import { IngredientsTableFilters } from "./ingredients-table-filters";

export const IngredientsTable = () => {
  const { data: ingredients = [], isLoading: isLoadingIngredients } =
    useGetIngredients();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetIngredientCategories();

  const categoryNameById = useMemo(
    () =>
      Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.name })),
    [categories],
  );

  const columns = useMemo(
    () => buildIngredientsTableColumns({ categoryNameById }),
    [categoryNameById],
  );

  return (
    <DataTable
      columns={columns}
      data={ingredients}
      isLoading={isLoadingIngredients || isLoadingCategories}
      getRowId={(ingredient) => ingredient.id}
      emptyMessage="No hay ingredientes registrados."
      toolbar={(table) => (
        <IngredientsTableFilters table={table} categoryOptions={categoryOptions} />
      )}
    />
  );
};
