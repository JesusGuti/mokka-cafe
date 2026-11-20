"use client";

import { useState } from "react";
import { HttpStatusCode, type AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/shared/components/form/form-dialog";
import { showToast } from "@/shared/lib/toast";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { useDeleteProductCategory } from "../hooks/use-delete-product-category";
import type { ProductCategoryWithCountResponse } from "../types/product-category.types";
import { getApiErrorMessage } from "@/shared/helpers/api-error";

const DELETE_PRODUCT_CATEGORY_FORM = {
  cancelLabel: "Cancelar",
  confirmLabel: "Eliminar categoría",
  submitingLabel: "Eliminando...",
  title: "Eliminar categoría",
};

const GENERIC_ERROR_MESSAGE =
  "Algo salió mal. Tus datos siguen aquí, intenta eliminarla de nuevo.";

const getConfirmDescription = (name: string) =>
  `¿Eliminar «${name}»? Esta acción no se puede deshacer.`;

// AC-1.7: el aviso nombra la categoría y la cantidad de productos.
const getBlockedDescription = (name: string, productCount: number) =>
  productCount === 1
    ? `No se puede eliminar «${name}» porque tiene 1 producto. Muévelo o archívalo primero.`
    : `No se puede eliminar «${name}» porque tiene ${productCount} productos. Muévelos o archívalos primero.`;

const getDescription = (category: ProductCategoryWithCountResponse | null) => {
  if (!category) return "";

  if (category.productCount > 0) {
    return getBlockedDescription(category.name, category.productCount);
  }

  return getConfirmDescription(category.name);
};

interface DeleteProductCategoryFormProps {
  /** Categoría a eliminar; `null` mantiene el diálogo cerrado. */
  category: ProductCategoryWithCountResponse | null;
  onClose: () => void;
}

/**
 * Un solo diálogo para toda la tabla: el padre guarda cuál categoría se va a
 * eliminar y este componente se abre cuando `category` no es `null`.
 */
export const DeleteProductCategoryForm = ({
  category,
  onClose,
}: DeleteProductCategoryFormProps) => {
  const { mutateAsync } = useDeleteProductCategory();
  const form = useForm<Record<string, never>>();

  // Al cerrar, `category` pasa a null mientras el diálogo todavía está en su
  // animación de salida: se recuerda la última para que el texto no se vacíe.
  const [lastCategory, setLastCategory] = useState(category);
  if (category && category !== lastCategory) {
    setLastCategory(category);
  }
  const shown = category ?? lastCategory;

  const isBlocked = (shown?.productCount ?? 0) > 0;

  const handleConfirm = async () => {
    if (!shown) return;

    try {
      await mutateAsync({ id: shown.id });
      showToast(`«${shown.name}» eliminada`, "success");
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const status = axiosError.response?.status;

      showToast(getApiErrorMessage(axiosError, GENERIC_ERROR_MESSAGE), "error");

      // 404 (ya no existe) y 409 (ahora tiene productos) ya no se resuelven
      // reintentando: se cierra y la lista se refresca (onSettled del hook).
      // Cualquier otro error (red, 500) deja el diálogo abierto para reintentar.
      const isFinal =
        status === HttpStatusCode.NotFound ||
        status === HttpStatusCode.Conflict;
      if (!isFinal) throw error;
    }
  };

  return (
    <FormDialog
      cancelLabel={DELETE_PRODUCT_CATEGORY_FORM.cancelLabel}
      confirmDisabled={isBlocked}
      confirmLabel={DELETE_PRODUCT_CATEGORY_FORM.confirmLabel}
      confirmVariant="destructive"
      description={getDescription(shown)}
      form={form}
      onConfirm={handleConfirm}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={category !== null}
      submitingLabel={DELETE_PRODUCT_CATEGORY_FORM.submitingLabel}
      title={DELETE_PRODUCT_CATEGORY_FORM.title}
    >
      {null}
    </FormDialog>
  );
};
