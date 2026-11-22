import { HttpStatusCode, type AxiosError } from "axios";
import type { UseFormReturn } from "react-hook-form";
import { getApiErrorMessage } from "@/shared/helpers/api-error";
import { showToast } from "@/shared/lib/toast";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import type { ProductCategoryPayload } from "../schemas/product-categories.schema";

/**
 * Muestra el error del backend donde corresponde:
 * - 409 (nombre duplicado, AC-1.6): junto al campo "name", sin toast.
 * - Cualquier otro: error general del formulario más un toast.
 */
export const setProductCategoryFormError = (
  form: UseFormReturn<ProductCategoryPayload>,
  error: AxiosError<ApiErrorResponse>,
  fallback: string,
): void => {
  const message = getApiErrorMessage(error, fallback);

  if (error.response?.status === HttpStatusCode.Conflict) {
    form.setError("name", { message });
    return;
  }

  form.setError("root", { message });
  showToast(message, "error");
};
