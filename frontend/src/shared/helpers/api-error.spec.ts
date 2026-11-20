import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { getApiErrorMessage } from "./api-error";

const buildError = (data?: Partial<ApiErrorResponse>) =>
  new AxiosError<ApiErrorResponse>(
    "fail",
    "ERR",
    undefined,
    undefined,
    data
      ? ({ status: 409, data } as AxiosResponse<ApiErrorResponse>)
      : undefined,
  );

describe("getApiErrorMessage", () => {
  it("devuelve el mensaje de negocio del backend", () => {
    const error = buildError({
      message: "Ya existe una categoría con ese nombre",
    });

    expect(getApiErrorMessage(error, "fallback")).toBe(
      "Ya existe una categoría con ese nombre",
    );
  });

  it("toma el primer mensaje cuando el backend devuelve un arreglo", () => {
    const error = buildError({ message: ["primero", "segundo"] });

    expect(getApiErrorMessage(error, "fallback")).toBe("primero");
  });

  it("usa el fallback si no hubo respuesta (ej. sin conexión)", () => {
    expect(getApiErrorMessage(buildError(), "fallback")).toBe("fallback");
  });

  it("usa el fallback si el mensaje viene vacío", () => {
    expect(getApiErrorMessage(buildError({ message: "" }), "fallback")).toBe(
      "fallback",
    );
  });
});
