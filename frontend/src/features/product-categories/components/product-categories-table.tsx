"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/components/table/data-table";
import { Button } from "@/shared/components/ui/button";
import { useGetProductCategories } from "../hooks/use-get-product-categories";
import type { ProductCategoryWithCountResponse } from "../types/product-category.types";
import { DeleteProductCategoryForm } from "./delete-product-category-form";
import { EditProductCategoryForm } from "./edit-product-category-form";
import { buildProductCategoriesTableColumns } from "./product-categories-table-columns";

const LOAD_ERROR_MESSAGE = "No pudimos cargar las categorías.";
const EMPTY_MESSAGE =
  "Aún no hay categorías. Crea la primera con «Nueva categoría».";

export const ProductCategoriesTable = () => {
  const { data, isError, isLoading, refetch } = useGetProductCategories();

  // Un solo diálogo de editar y uno de eliminar para toda la tabla: la fila
  // solo guarda cuál categoría está seleccionada.
  const [editing, setEditing] =
    useState<ProductCategoryWithCountResponse | null>(null);
  const [deleting, setDeleting] =
    useState<ProductCategoryWithCountResponse | null>(null);

  const columns = useMemo(
    () =>
      buildProductCategoriesTableColumns({
        onDelete: setDeleting,
        onEdit: setEditing,
      }),
    [],
  );

  // Con datos ya cargados, un fallo al refrescar no tira la pantalla: se sigue
  // mostrando lo último que se tenía.
  if (isError && !data) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center"
      >
        <p className="text-muted-foreground">{LOAD_ERROR_MESSAGE}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        getRowId={(category) => category.id}
        emptyMessage={EMPTY_MESSAGE}
      />

      <EditProductCategoryForm
        category={editing}
        onClose={() => setEditing(null)}
      />
      <DeleteProductCategoryForm
        category={deleting}
        onClose={() => setDeleting(null)}
      />
    </>
  );
};
