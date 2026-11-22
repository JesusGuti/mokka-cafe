"use client";

import { HttpStatusCode, type AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/shared/components/form/form-dialog";
import { FormInput } from "@/shared/components/form/form-input";
import { FieldError } from "@/shared/components/ui/field";
import { getApiErrorMessage } from "@/shared/helpers/api-error";
import { useRetainedValue } from "@/shared/hooks/use-retained-value";
import { showToast } from "@/shared/lib/toast";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import {
  PRODUCT_CATEGORY_NAME_FIELD,
  PRODUCT_CATEGORY_SAVE_ERROR_MESSAGE,
} from "../constants/product-category-form.constants";
import { useEditProductCategory } from "../hooks/use-edit-product-category";
import {
  productCategorySchema,
  type ProductCategoryPayload,
} from "../schemas/product-categories.schema";
import type { ProductCategoryResponse } from "../types/product-category.types";
import { setProductCategoryFormError } from "../utils/set-product-category-form-error";

const EDIT_PRODUCT_CATEGORY_FORM = {
  cancelLabel: "Cancelar",
  confirmLabel: "Guardar cambios",
  description:
    "Cambia el nombre de la categoría. Sus productos seguirán asociados.",
  submitingLabel: "Guardando...",
  title: "Editar categoría",
};

const NOT_FOUND_MESSAGE = "Esta categoría ya no existe";

interface EditProductCategoryFormProps {
  /** Categoría a editar; `null` mantiene el diálogo cerrado. */
  category: ProductCategoryResponse | null;
  onClose: () => void;
}

/**
 * Un solo diálogo para toda la tabla: el padre guarda cuál categoría se edita
 * y este componente se abre cuando `category` no es `null`.
 */
export const EditProductCategoryForm = ({
  category,
  onClose,
}: EditProductCategoryFormProps) => {
  const { mutateAsync } = useEditProductCategory();

  // Al cerrar, `category` pasa a null mientras el diálogo todavía está en su
  // animación de salida: se recuerda la última para que el campo no se vacíe.
  const shown = useRetainedValue(category);

  const form = useForm<ProductCategoryPayload>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: { name: "" },
    // Precarga el nombre y lo vuelve a cargar cuando se elige otra categoría.
    values: { name: shown?.name ?? "" },
  });

  const onConfirm = async () => {
    if (!shown) return;

    form.clearErrors();
    const payload = productCategorySchema.parse(form.getValues());

    // Sin cambios no hay nada que guardar: solo se cierra.
    if (payload.name === shown.name) return;

    try {
      const updated = await mutateAsync({ id: shown.id, payload });
      showToast(`«${updated.name}» actualizada`, "success");
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      // AC-1.8: si otro admin la eliminó, se avisa y se cierra; la lista se
      // refresca sola (onSettled del hook) y ya no desaparece la fila fantasma.
      if (axiosError.response?.status === HttpStatusCode.NotFound) {
        showToast(getApiErrorMessage(axiosError, NOT_FOUND_MESSAGE), "error");
        return;
      }

      setProductCategoryFormError(
        form,
        axiosError,
        PRODUCT_CATEGORY_SAVE_ERROR_MESSAGE,
      );
      throw error;
    }
  };

  return (
    <FormDialog
      cancelLabel={EDIT_PRODUCT_CATEGORY_FORM.cancelLabel}
      confirmLabel={EDIT_PRODUCT_CATEGORY_FORM.confirmLabel}
      description={EDIT_PRODUCT_CATEGORY_FORM.description}
      form={form}
      onConfirm={onConfirm}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={category !== null}
      submitingLabel={EDIT_PRODUCT_CATEGORY_FORM.submitingLabel}
      title={EDIT_PRODUCT_CATEGORY_FORM.title}
      warnOnDiscard
    >
      <div className="flex flex-col gap-4">
        <FormInput<ProductCategoryPayload>
          name="name"
          label={PRODUCT_CATEGORY_NAME_FIELD.label}
          placeholder={PRODUCT_CATEGORY_NAME_FIELD.placeholder}
          type="text"
          mode="text"
          autoFocus
        />

        {form.formState.errors.root?.message && (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        )}
      </div>
    </FormDialog>
  );
};
