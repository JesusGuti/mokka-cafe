import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { buildApiError } from "@/shared/testing/api-error";
import { EditProductCategoryForm } from "./edit-product-category-form";
import { PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES } from "../schemas/product-categories.schema";
import { buildProductCategory } from "../testing/product-category.fixtures";
import type { ProductCategoryResponse } from "../types/product-category.types";

const { mutateAsyncMock, showToastMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  showToastMock: vi.fn(),
}));

vi.mock("../hooks/use-edit-product-category", () => ({
  useEditProductCategory: () => ({ mutateAsync: mutateAsyncMock }),
}));
vi.mock("@/shared/lib/toast", () => ({ showToast: showToastMock }));

const CATEGORY = buildProductCategory();

const renderDialog = (category: ProductCategoryResponse | null = CATEGORY) => {
  const onClose = vi.fn();
  render(<EditProductCategoryForm category={category} onClose={onClose} />);
  return { onClose };
};

const nameInput = () => screen.getByRole("textbox", { name: "Nombre" });

const typeName = (value: string) =>
  fireEvent.change(nameInput(), { target: { value } });

const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

describe("EditProductCategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no se muestra si no hay una categoría seleccionada", () => {
    renderDialog(null);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("se abre con el nombre actual precargado (AC-1.2)", () => {
    renderDialog();

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(nameInput()).toHaveValue("Calientes");
  });

  it("guarda el nombre recortado por id, avisa con un toast y cierra", async () => {
    mutateAsyncMock.mockResolvedValue({
      ...CATEGORY,
      name: "Bebidas calientes",
    });
    const { onClose } = renderDialog();
    typeName("  Bebidas calientes ");

    submit();

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        id: "cat-1",
        payload: { name: "Bebidas calientes" },
      });
    });
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        "«Bebidas calientes» actualizada",
        "success",
      );
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("si el nombre no cambió, no llama al backend y solo cierra", async () => {
    const { onClose } = renderDialog();

    submit();

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("rechaza un nombre vacío junto al campo (AC-1.5)", async () => {
    renderDialog();
    typeName("");

    submit();

    expect(
      await screen.findByText(PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.min),
    ).toBeVisible();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("un nombre duplicado (409) se muestra junto al campo y no cierra (AC-1.6)", async () => {
    mutateAsyncMock.mockRejectedValue(
      buildApiError(409, "Ya existe una categoría con ese nombre"),
    );
    const { onClose } = renderDialog();
    typeName("Frías");

    submit();

    expect(
      await screen.findByText("Ya existe una categoría con ese nombre"),
    ).toBeVisible();
    expect(showToastMock).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(nameInput()).toHaveValue("Frías");
  });

  it("si la categoría ya no existe (404) avisa y cierra (AC-1.8)", async () => {
    mutateAsyncMock.mockRejectedValue(
      buildApiError(404, "Esta categoría ya no existe"),
    );
    const { onClose } = renderDialog();
    typeName("Frías");

    submit();

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        "Esta categoría ya no existe",
        "error",
      );
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("un error inesperado se muestra y deja el diálogo abierto con lo escrito", async () => {
    mutateAsyncMock.mockRejectedValue(buildApiError(500, "Fallo interno"));
    const { onClose } = renderDialog();
    typeName("Frías");

    submit();

    expect(await screen.findByText("Fallo interno")).toBeVisible();
    expect(showToastMock).toHaveBeenCalledWith("Fallo interno", "error");
    expect(onClose).not.toHaveBeenCalled();
    expect(nameInput()).toHaveValue("Frías");
  });

  it("al cancelar con cambios pide confirmar antes de descartarlos (AC-1.12)", () => {
    const { onClose } = renderDialog();
    typeName("Frías");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tienes cambios sin guardar",
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("al cancelar sin cambios avisa al padre y no pide confirmación", () => {
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });
});
