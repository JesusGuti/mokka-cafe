import type { UseFormReturn } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApiError } from "@/shared/testing/api-error";
import type { ProductCategoryPayload } from "../schemas/product-categories.schema";
import { setProductCategoryFormError } from "./set-product-category-form-error";

const { showToastMock } = vi.hoisted(() => ({ showToastMock: vi.fn() }));

vi.mock("@/shared/lib/toast", () => ({ showToast: showToastMock }));

const buildForm = () => {
  const setError = vi.fn();
  const form = { setError } as unknown as UseFormReturn<ProductCategoryPayload>;
  return { form, setError };
};

describe("setProductCategoryFormError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("un 409 va junto al campo nombre y no abre toast", () => {
    const { form, setError } = buildForm();

    setProductCategoryFormError(
      form,
      buildApiError(409, "Ya existe una categoría con ese nombre"),
      "fallback",
    );

    expect(setError).toHaveBeenCalledWith("name", {
      message: "Ya existe una categoría con ese nombre",
    });
    expect(showToastMock).not.toHaveBeenCalled();
  });

  it("cualquier otro error va al error general y abre un toast", () => {
    const { form, setError } = buildForm();

    setProductCategoryFormError(form, buildApiError(500, "Boom"), "fallback");

    expect(setError).toHaveBeenCalledWith("root", { message: "Boom" });
    expect(showToastMock).toHaveBeenCalledWith("Boom", "error");
  });

  it("sin respuesta (sin conexión) usa el mensaje de respaldo", () => {
    const { form, setError } = buildForm();

    setProductCategoryFormError(form, buildApiError(), "No hay conexión");

    expect(setError).toHaveBeenCalledWith("root", {
      message: "No hay conexión",
    });
    expect(showToastMock).toHaveBeenCalledWith("No hay conexión", "error");
  });
});
