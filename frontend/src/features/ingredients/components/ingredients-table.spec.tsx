import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { IngredientsTable } from "./ingredients-table";
import type { IngredientResponse } from "../types/ingredients.types";
import type { IngredientCategoryResponse } from "@/features/ingredient-categories/types/ingredient-categories.types";

const { useGetIngredientsMock, useGetIngredientCategoriesMock } = vi.hoisted(
  () => ({
    useGetIngredientsMock: vi.fn(),
    useGetIngredientCategoriesMock: vi.fn(),
  }),
);

vi.mock("../hooks/use-get-ingredients", () => ({
  useGetIngredients: useGetIngredientsMock,
}));
vi.mock(
  "@/features/ingredient-categories/hooks/use-get-ingredient-categories",
  () => ({
    useGetIngredientCategories: useGetIngredientCategoriesMock,
  }),
);

const categories: IngredientCategoryResponse[] = [
  {
    id: "cat-lacteos",
    name: "Lácteos",
    createdAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
    updatedAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
  },
  {
    id: "cat-cafe",
    name: "Café",
    createdAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
    updatedAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
  },
];

const ingredients: IngredientResponse[] = [
  {
    id: "1",
    name: "Leche entera",
    unit: "litros",
    categoryId: "cat-lacteos",
    currentStockQty: 10,
    minStockThreshold: 2,
    createdAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
    updatedAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
  },
  {
    id: "2",
    name: "Café en grano",
    unit: "gramos",
    categoryId: "cat-cafe",
    currentStockQty: 500,
    minStockThreshold: null,
    createdAt: "2026-01-02T00:00:00.000Z" as unknown as Date,
    updatedAt: "2026-01-02T00:00:00.000Z" as unknown as Date,
  },
];

beforeEach(() => {
  useGetIngredientsMock.mockReset();
  useGetIngredientsMock.mockReturnValue({
    data: ingredients,
    isLoading: false,
  });

  useGetIngredientCategoriesMock.mockReset();
  useGetIngredientCategoriesMock.mockReturnValue({
    data: categories,
    isLoading: false,
  });
});

describe("IngredientsTable", () => {
  it("muestra los ingredientes devueltos por el hook, con el nombre de categoría resuelto", () => {
    render(<IngredientsTable />);

    expect(screen.getByText("Leche entera")).toBeInTheDocument();
    expect(screen.getByText("Café en grano")).toBeInTheDocument();
    expect(screen.getByText("Lácteos")).toBeInTheDocument();
    expect(screen.getByText("Café")).toBeInTheDocument();
    expect(screen.getByText("Sin definir")).toBeInTheDocument();
  });

  it("muestra esqueletos mientras isLoading es true en cualquiera de los dos hooks", () => {
    useGetIngredientsMock.mockReturnValue({ data: undefined, isLoading: true });

    render(<IngredientsTable />);

    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("muestra el mensaje vacío cuando no hay ingredientes", () => {
    useGetIngredientsMock.mockReturnValue({ data: [], isLoading: false });

    render(<IngredientsTable />);

    expect(
      screen.getByText("No hay ingredientes registrados."),
    ).toBeInTheDocument();
  });

  it("filtra por categoría usando el filtro de la toolbar", () => {
    render(<IngredientsTable />);

    const categoryFilterTrigger = screen
      .getAllByRole("button", { name: "Categoría" })
      .find((button) => button.getAttribute("aria-haspopup") === "menu")!;

    fireEvent.click(categoryFilterTrigger);
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Lácteos" }));

    expect(screen.getByText("Leche entera")).toBeInTheDocument();
    expect(screen.queryByText("Café en grano")).not.toBeInTheDocument();
  });

  it("filtra por texto libre usando el buscador", () => {
    render(<IngredientsTable />);

    fireEvent.change(
      screen.getByPlaceholderText("Buscar por nombre o unidad..."),
      { target: { value: "café" } },
    );

    expect(screen.queryByText("Leche entera")).not.toBeInTheDocument();
    expect(screen.getByText("Café en grano")).toBeInTheDocument();
  });
});
