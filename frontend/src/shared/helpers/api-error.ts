import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/shared/types/api-error";

/**
 * Mensaje de negocio que devuelve el backend (ej. 409 "Ya existe una categoría
 * con ese nombre"). Si no hay respuesta o viene vacío (sin conexión, 500 sin
 * cuerpo), usa `fallback`. Nest devuelve un arreglo de mensajes cuando falla la
 * validación del DTO: se toma el primero.
 */
export const getApiErrorMessage = (
  error: AxiosError<ApiErrorResponse>,
  fallback: string,
): string => {
  const message = error.response?.data?.message;
  const text = Array.isArray(message) ? message[0] : message;
  return text || fallback;
};
