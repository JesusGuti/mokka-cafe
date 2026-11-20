import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError, type AxiosResponse } from "axios";
import { DeleteProductCategoryForm } from "./delete-product-category-form";
import type { ProductCategoryWithCountResponse } from "../types/product-category.types";

const { mutateAsyncMock, showToastMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  showToastMock: vi.fn(),
}));

vi.mock("../hooks/use-delete-product-category", () => ({
  useDeleteProductCategory: () => ({ mutateAsync: mutateAsyncMock }),
}));
vi.mock("@/shared/lib/toast", () => ({ showToast: showToastMock }));

const buildCategory = (
  overrides: Partial<ProductCategoryWithCountResponse> = {},
): ProductCategoryWithCountResponse => ({
  id: "cat-1",
  name: "Calientes",
  sortOrder: 0,
  productCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const apiError = (status: number, message: string) =>
  new AxiosError("fail", "ERR", undefined, undefined, {
    status,
    data: { message },
  } as AxiosResponse);

const renderDialog = (category: ProductCategoryWithCountResponse | null) => {
  const onClose = vi.fn();
  render(<DeleteProductCategoryForm category={category} onClose={onClose} />);
  return { onClose };
};

const confirm = () =>
  fireEvent.click(screen.getByRole("button", { name: "Eliminar categoría" }));

describe("DeleteProductCategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no se muestra si no hay una categoría seleccionada", () => {
    renderDialog(null);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("pide confirmación nombrando la categoría", () => {
    renderDialog(buildCategory());

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(
      screen.getByText(
        "¿Eliminar «Calientes»? Esta acción no se puede deshacer.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Eliminar categoría" }),
    ).toBeEnabled();
  });

  it("al confirmar elimina por id, avisa con un toast y cierra", async () => {
    mutateAsyncMock.mockResolvedValue(undefined);
    const { onClose } = renderDialog(buildCategory());

    confirm();

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({ id: "cat-1" });
    });
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        "«Calientes» eliminada",
        "success",
      );
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("si tiene productos avisa cuántos y no deja confirmar (AC-1.7)", () => {
    renderDialog(buildCategory({ productCount: 4 }));

    expect(
      screen.getByText(
        "No se puede eliminar «Calientes» porque tiene 4 productos. Muévelos o archívalos primero.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Eliminar categoría" }),
    ).toBeDisabled();
  });

  it("usa el singular cuando tiene un solo producto", () => {
    renderDialog(buildCategory({ productCount: 1 }));

    expect(
      screen.getByText(
        "No se puede eliminar «Calientes» porque tiene 1 producto. Muévelo o archívalo primero.",
      ),
    ).toBeVisible();
  });

  it("cancelar cierra sin eliminar", () => {
    const { onClose } = renderDialog(buildCategory());

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalled();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it.each([
    [409, "Tiene 4 productos. Muévelos o archívalos primero"],
    [404, "Esta categoría ya no existe"],
  ])(
    "ante un %i muestra el mensaje del backend y cierra",
    async (status, message) => {
      mutateAsyncMock.mockRejectedValue(apiError(status, message));
      const { onClose } = renderDialog(buildCategory());

      confirm();

      await waitFor(() => {
        expect(showToastMock).toHaveBeenCalledWith(message, "error");
      });
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    },
  );

  it("ante un error de servidor muestra un mensaje genérico y queda abierto para reintentar", async () => {
    mutateAsyncMock.mockRejectedValue(apiError(500, ""));
    const { onClose } = renderDialog(buildCategory());

    confirm();

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        "Algo salió mal. Tus datos siguen aquí, intenta eliminarla de nuevo.",
        "error",
      );
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("el botón de confirmar usa el estilo destructivo", () => {
    renderDialog(buildCategory());

    expect(
      screen.getByRole("button", { name: "Eliminar categoría" }),
    ).toHaveClass("text-destructive");
  });
});
