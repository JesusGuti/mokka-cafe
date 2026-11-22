import { describe, expect, it } from "vitest";
import { buildApiError } from "@/shared/testing/api-error";
import { getApiErrorMessage } from "./api-error";

describe("getApiErrorMessage", () => {
  it("devuelve el mensaje de negocio del backend", () => {
    const error = buildApiError(409, "Ya existe una categoría con ese nombre");

    expect(getApiErrorMessage(error, "fallback")).toBe(
      "Ya existe una categoría con ese nombre",
    );
  });

  it("toma el primer mensaje cuando el backend devuelve un arreglo", () => {
    const error = buildApiError(400, ["primero", "segundo"]);

    expect(getApiErrorMessage(error, "fallback")).toBe("primero");
  });

  it("usa el fallback si no hubo respuesta (ej. sin conexión)", () => {
    expect(getApiErrorMessage(buildApiError(), "fallback")).toBe("fallback");
  });

  it("usa el fallback si el mensaje viene vacío", () => {
    expect(getApiErrorMessage(buildApiError(409, ""), "fallback")).toBe(
      "fallback",
    );
  });
});
