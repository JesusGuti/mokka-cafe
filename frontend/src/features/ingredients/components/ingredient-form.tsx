"use client";

import { useGetIngredientCategories } from "@/features/ingredient-categories/hooks/use-get-ingredient-categories";
import { useCreateIngredientCategory } from "@/features/ingredient-categories/hooks/use-create-ingredient-category";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { FieldError } from "@/shared/components/ui/field";
import { FormDialog } from "@/shared/components/form/form-dialog";
import { FormInput } from "@/shared/components/form/form-input";
import { FormCombobox } from "@/shared/components/form/form-combobox";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { showToast } from "@/shared/lib/toast";
import type { SelectOption } from "@/shared/types/select";
import { useCreateIngredient } from "../hooks/use-create-ingredient";
import {
  ingredientFormSchema,
  type IngredientFormValues,
} from "../schemas/ingredients.schema";
import { toIngredientPayload } from "../utils/to-ingredient-payload";
import { AxiosError, HttpStatusCode } from "axios";
import { useForm } from "react-hook-form";
import { PackagePlus } from "lucide-react";

const INGREDIENT_CREATED_MESSAGE = "Ingrediente creado correctamente.";
const CATEGORY_CREATED_MESSAGE = "Categoría creada correctamente.";

const INGREDIENT_FORM_DIALOG = {
  cancelLabel: "Cancelar",
  confirmLabel: "Crear ingrediente",
  description: "Completa los datos para dar de alta un nuevo ingrediente.",
  submitingLabel: "Creando ingrediente...",
  title: "Crear ingrediente",
  triggerLabel: "Nuevo ingrediente",
};

const INGREDIENT_FORM_FIELDS = {
  name: { label: "Nombre", placeholder: "Ej. Café en grano" },
  unit: { label: "Unidad", placeholder: "Ej. g, ml, shot, unidad" },
  categoryId: {
    label: "Categoría",
    placeholder: "Selecciona una categoría",
    searchPlaceholder: "Buscar categoría...",
  },
  minStockThreshold: {
    label: "Stock mínimo",
    placeholder: "Opcional",
  },
};

const GENERIC_ERROR_MESSAGE =
  "No se pudo crear el ingrediente. Intenta de nuevo.";
const GENERIC_CATEGORY_ERROR_MESSAGE =
  "No se pudo crear la categoría. Intenta de nuevo.";
const CATEGORY_NOT_FOUND_MESSAGE = "La categoría seleccionada no existe.";

const getBackendMessage = (error: AxiosError<ApiErrorResponse>) => {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message[0] : message;
};

// Al crear un ingrediente, un 404 solo puede significar categoría inexistente.
const getIngredientErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
  if (error.response?.status === HttpStatusCode.NotFound) {
    return CATEGORY_NOT_FOUND_MESSAGE;
  }
  return getBackendMessage(error) ?? GENERIC_ERROR_MESSAGE;
};

const getCategoryErrorMessage = (error: AxiosError<ApiErrorResponse>) =>
  getBackendMessage(error) ?? GENERIC_CATEGORY_ERROR_MESSAGE;

const isDuplicatedNameError = (error: AxiosError<ApiErrorResponse>) =>
  error.response?.status === HttpStatusCode.Conflict;

export const IngredientForm = () => {
  const { mutate } = useCreateIngredient();
  const { data: categories = [] } = useGetIngredientCategories();
  const { mutateAsync: createCategory } = useCreateIngredientCategory();

  const categoryOptions: SelectOption[] = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: "",
      unit: "",
      categoryId: "",
      minStockThreshold: "",
    },
  });

  const handleCreateCategory = async (
    name: string,
  ): Promise<SelectOption | null> => {
    try {
      const category = await createCategory({ name });
      showToast(CATEGORY_CREATED_MESSAGE, "success");
      return { label: category.name, value: category.id };
    } catch (error) {
      const message = getCategoryErrorMessage(
        error as AxiosError<ApiErrorResponse>,
      );
      showToast(message, "error");
      return null;
    }
  };

  const onConfirm = () => {
    form.clearErrors("root");
    form.clearErrors("name");
    const values = toIngredientPayload(
      ingredientFormSchema.parse(form.getValues()),
    );

    return new Promise<void>((resolve, reject) => {
      mutate(values, {
        onSuccess: () => {
          showToast(INGREDIENT_CREATED_MESSAGE, "success");
          resolve();
        },
        onError: (error) => {
          const message = getIngredientErrorMessage(error);
          if (isDuplicatedNameError(error)) {
            form.setError("name", { message });
          } else {
            form.setError("root", { message });
          }
          showToast(message, "error");
          reject(error);
        },
      });
    });
  };

  return (
    <FormDialog
      cancelLabel={INGREDIENT_FORM_DIALOG.cancelLabel}
      confirmLabel={INGREDIENT_FORM_DIALOG.confirmLabel}
      description={INGREDIENT_FORM_DIALOG.description}
      form={form}
      onConfirm={onConfirm}
      submitingLabel={INGREDIENT_FORM_DIALOG.submitingLabel}
      title={INGREDIENT_FORM_DIALOG.title}
      trigger={
        <Button>
          <PackagePlus />
          {INGREDIENT_FORM_DIALOG.triggerLabel}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormInput<IngredientFormValues>
          name="name"
          label={INGREDIENT_FORM_FIELDS.name.label}
          placeholder={INGREDIENT_FORM_FIELDS.name.placeholder}
          type="text"
          mode="text"
          autoFocus
        />
        <FormInput<IngredientFormValues>
          name="unit"
          label={INGREDIENT_FORM_FIELDS.unit.label}
          placeholder={INGREDIENT_FORM_FIELDS.unit.placeholder}
          type="text"
          mode="text"
        />
        <FormCombobox<IngredientFormValues>
          name="categoryId"
          label={INGREDIENT_FORM_FIELDS.categoryId.label}
          placeholder={INGREDIENT_FORM_FIELDS.categoryId.placeholder}
          searchPlaceholder={
            INGREDIENT_FORM_FIELDS.categoryId.searchPlaceholder
          }
          options={categoryOptions}
          onCreateOption={handleCreateCategory}
          createOptionLabel={(value) => `Crear categoría "${value}"`}
        />
        <FormInput<IngredientFormValues>
          name="minStockThreshold"
          label={INGREDIENT_FORM_FIELDS.minStockThreshold.label}
          placeholder={INGREDIENT_FORM_FIELDS.minStockThreshold.placeholder}
          type="text"
          mode="decimal"
          required={false}
        />

        {form.formState.errors.root?.message && (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        )}
      </div>
    </FormDialog>
  );
};
