"use client";

import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/shared/components/form/form-dialog";
import { FormInput } from "@/shared/components/form/form-input";
import { Button } from "@/shared/components/ui/button";
import { FieldError } from "@/shared/components/ui/field";
import { showToast } from "@/shared/lib/toast";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { useCreateProductCategory } from "../hooks/use-create-product-category";
import {
  productCategorySchema,
  type ProductCategoryPayload,
} from "../schemas/product-categories.schema";
import { setProductCategoryFormError } from "../utils/set-product-category-form-error";

const CREATE_PRODUCT_CATEGORY_FORM = {
  // El diálogo sigue abierto tras crear (AC-1.13), así que el botón de salida
  // es "Cerrar", no "Cancelar".
  cancelLabel: "Cerrar",
  confirmLabel: "Crear categoría",
  description:
    "Escribe el nombre de la categoría. Puedes seguir agregando otras sin cerrar esta ventana.",
  submitingLabel: "Creando...",
  title: "Nueva categoría",
  triggerLabel: "Nueva categoría",
};

const NAME_FIELD = { label: "Nombre", placeholder: "Ej. Bebidas calientes" };

const GENERIC_ERROR_MESSAGE =
  "Algo salió mal. Tus datos siguen aquí, intenta guardar de nuevo.";

export const CreateProductCategoryForm = () => {
  const { mutateAsync } = useCreateProductCategory();

  const form = useForm<ProductCategoryPayload>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: { name: "" },
  });

  const onConfirm = async () => {
    form.clearErrors();
    const payload = productCategorySchema.parse(form.getValues());

    try {
      const created = await mutateAsync(payload);
      showToast(`«${created.name}» creada`, "success");

      // AC-1.13: el campo queda vacío y listo para la siguiente categoría.
      form.reset();
      form.setFocus("name");
    } catch (error) {
      setProductCategoryFormError(
        form,
        error as AxiosError<ApiErrorResponse>,
        GENERIC_ERROR_MESSAGE,
      );
      throw error;
    }
  };

  return (
    <FormDialog
      cancelLabel={CREATE_PRODUCT_CATEGORY_FORM.cancelLabel}
      confirmLabel={CREATE_PRODUCT_CATEGORY_FORM.confirmLabel}
      description={CREATE_PRODUCT_CATEGORY_FORM.description}
      form={form}
      keepOpenOnConfirm
      onConfirm={onConfirm}
      submitingLabel={CREATE_PRODUCT_CATEGORY_FORM.submitingLabel}
      title={CREATE_PRODUCT_CATEGORY_FORM.title}
      trigger={
        <Button>
          <Plus />
          {CREATE_PRODUCT_CATEGORY_FORM.triggerLabel}
        </Button>
      }
      warnOnDiscard
    >
      <div className="flex flex-col gap-4">
        <FormInput<ProductCategoryPayload>
          name="name"
          label={NAME_FIELD.label}
          placeholder={NAME_FIELD.placeholder}
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
