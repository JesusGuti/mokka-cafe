import { AxiosError, type AxiosResponse } from "axios";
import type { ApiErrorResponse } from "@/shared/types/api-error";

/**
 * `AxiosError` como lo produce el backend, para los tests. Sin `status` simula
 * que no hubo respuesta (por ejemplo, sin conexión).
 */
export const buildApiError = (
  status?: number,
  message?: string | string[],
): AxiosError<ApiErrorResponse> =>
  new AxiosError<ApiErrorResponse>(
    "fail",
    "ERR",
    undefined,
    undefined,
    status === undefined
      ? undefined
      : ({ status, data: { message } } as AxiosResponse<ApiErrorResponse>),
  );
