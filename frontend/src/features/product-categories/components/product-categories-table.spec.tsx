import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { buildProductCategory } from "../testing/product-category.fixtures";
import { ProductCategoriesTable } from "./product-categories-table";

/**
 * Se mockean la query de la lista y las mutations de editar y eliminar (los
 * diálogos hijos las usan): ninguno debe tocar la red ni pedir un
 * QueryClientProvider.
 */
const { refetchMock, useGetProductCategoriesMock } = vi.hoisted(() => ({
  refetchMock: vi.fn(),
  useGetProductCategoriesMock: vi.fn(),
}));

vi.mock("../hooks/use-get-product-categories", () => ({
  useGetProductCategories: useGetProductCategoriesMock,
}));
vi.mock("../hooks/use-edit-product-category", () => ({
  useEditProductCategory: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("../hooks/use-delete-product-category", () => ({
  useDeleteProductCategory: () => ({ mutateAsync: vi.fn() }),
}));

const CATEGORIES = [
  buildProductCategory({ id: "1", name: "Calientes", productCount: 4 }),
  buildProductCategory({
    id: "2",
    name: "Frías",
    sortOrder: 1,
    productCount: 0,
  }),
];

beforeEach(() => {
  vi.clearAllMocks();
  useGetProductCategoriesMock.mockReturnValue({
    data: CATEGORIES,
    isError: false,
    isLoading: false,
    refetch: refetchMock,
  });
});

describe("ProductCategoriesTable", () => {
  it("muestra las categorías con su cantidad de productos (AC-1.4)", () => {
    render(<ProductCategoriesTable />);

    expect(screen.getByText("Calientes")).toBeInTheDocument();
    expect(screen.getByText("Frías")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("mantiene el orden que devuelve el backend", () => {
    render(<ProductCategoriesTable />);

    const names = screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => row.textContent ?? "");

    expect(names[0]).toContain("Calientes");
    expect(names[1]).toContain("Frías");
  });

  it("muestra esqueletos mientras carga", () => {
    useGetProductCategoriesMock.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
      refetch: refetchMock,
    });

    render(<ProductCategoriesTable />);

    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("muestra el estado vacío cuando no hay categorías", () => {
    useGetProductCategoriesMock.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
      refetch: refetchMock,
    });

    render(<ProductCategoriesTable />);

    expect(
      screen.getByText(
        "Aún no hay categorías. Crea la primera con «Nueva categoría».",
      ),
    ).toBeInTheDocument();
  });

  describe("cuando falla la carga", () => {
    it("sin datos previos muestra el error con «Reintentar» que vuelve a pedirlos", () => {
      useGetProductCategoriesMock.mockReturnValue({
        data: undefined,
        isError: true,
        isLoading: false,
        refetch: refetchMock,
      });

      render(<ProductCategoriesTable />);

      expect(screen.getByRole("alert")).toHaveTextContent(
        "No pudimos cargar las categorías.",
      );

      fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

      expect(refetchMock).toHaveBeenCalledTimes(1);
    });

    it("con datos previos sigue mostrando la tabla, sin pantalla de error", () => {
      useGetProductCategoriesMock.mockReturnValue({
        data: CATEGORIES,
        isError: true,
        isLoading: false,
        refetch: refetchMock,
      });

      render(<ProductCategoriesTable />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText("Calientes")).toBeInTheDocument();
    });
  });

  describe("diálogos", () => {
    it("«Editar» abre el diálogo de edición con el nombre de esa fila", () => {
      render(<ProductCategoriesTable />);

      fireEvent.click(screen.getByRole("button", { name: "Editar Frías" }));

      expect(
        screen.getByRole("dialog", { name: "Editar categoría" }),
      ).toBeVisible();
      expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue(
        "Frías",
      );
    });

    it("«Eliminar» abre la confirmación nombrando la categoría", () => {
      render(<ProductCategoriesTable />);

      fireEvent.click(screen.getByRole("button", { name: "Eliminar Frías" }));

      expect(
        screen.getByRole("dialog", { name: "Eliminar categoría" }),
      ).toBeVisible();
      expect(
        screen.getByText(
          "¿Eliminar «Frías»? Esta acción no se puede deshacer.",
        ),
      ).toBeVisible();
    });

    it("eliminar una categoría con productos muestra el bloqueo con la cantidad (AC-1.7)", () => {
      render(<ProductCategoriesTable />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar Calientes" }),
      );

      expect(
        screen.getByText(
          "No se puede eliminar «Calientes» porque tiene 4 productos. Muévelos o archívalos primero.",
        ),
      ).toBeVisible();
    });

    it("cancelar cierra el diálogo", () => {
      render(<ProductCategoriesTable />);
      fireEvent.click(screen.getByRole("button", { name: "Editar Frías" }));

      fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
