import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IngredientForm } from "./ingredient-form";
import { INGREDIENT_SCHEMA_ERROR_MESSAGES } from "../schemas/ingredients.schema";
import type { IngredientCategoryResponse } from "@/features/ingredient-categories/types/ingredient-categories.types";

const {
  mutateMock,
  useCreateIngredientMock,
  useGetIngredientCategoriesMock,
  createCategoryMutateAsyncMock,
  useCreateIngredientCategoryMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  useCreateIngredientMock: vi.fn(),
  useGetIngredientCategoriesMock: vi.fn(),
  createCategoryMutateAsyncMock: vi.fn(),
  useCreateIngredientCategoryMock: vi.fn(),
}));

vi.mock("../hooks/use-create-ingredient", () => ({
  useCreateIngredient: useCreateIngredientMock,
}));
vi.mock(
  "@/features/ingredient-categories/hooks/use-get-ingredient-categories",
  () => ({
    useGetIngredientCategories: useGetIngredientCategoriesMock,
  }),
);
vi.mock(
  "@/features/ingredient-categories/hooks/use-create-ingredient-category",
  () => ({
    useCreateIngredientCategory: useCreateIngredientCategoryMock,
  }),
);

// categoryId se valida como z.uuid() en el schema — un id "amigable" como
// "cat-lacteos" haría fallar la validación aunque sí se haya seleccionado.
// z.uuid() además exige nibble de versión (1-8) y variante (8/9/a/b)
// válidos, así que no alcanza cualquier string con forma de UUID.
const LACTEOS_CATEGORY_ID = "11111111-1111-4111-8111-111111111111";
const INFUSIONES_CATEGORY_ID = "22222222-2222-4222-8222-222222222222";

const CATEGORIES: IngredientCategoryResponse[] = [
  {
    id: LACTEOS_CATEGORY_ID,
    name: "Lácteos",
    createdAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
    updatedAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
  },
];

const openForm = () => {
  fireEvent.click(screen.getByRole("button", { name: "Nuevo ingrediente" }));
};

const submit = () => {
  fireEvent.click(screen.getByRole("button", { name: "Crear ingrediente" }));
};

const selectExistingCategory = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Categoría" }));
  fireEvent.click(await screen.findByText("Lácteos"));
};

const fillValidForm = async () => {
  fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), {
    target: { value: "Café en grano" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Unidad" }), {
    target: { value: "gramos" },
  });
  await selectExistingCategory();
};

beforeEach(() => {
  mutateMock.mockReset();
  useCreateIngredientMock.mockReset();
  useCreateIngredientMock.mockReturnValue({
    mutate: mutateMock,
    isPending: false,
  });

  useGetIngredientCategoriesMock.mockReset();
  useGetIngredientCategoriesMock.mockReturnValue({
    data: CATEGORIES,
    isLoading: false,
  });

  createCategoryMutateAsyncMock.mockReset();
  useCreateIngredientCategoryMock.mockReset();
  useCreateIngredientCategoryMock.mockReturnValue({
    mutateAsync: createCategoryMutateAsyncMock,
  });

  /**
   * Base UI (Popover) usa Pointer Events al posicionar el popup; jsdom no
   * los implementa. `cmdk` (el Command de adentro) además necesita
   * ResizeObserver, tampoco implementado en jsdom. Ver form-combobox.spec.tsx.
   */
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

describe("IngredientForm", () => {
  it("muestra error de validación y no llama a mutate si el nombre es corto", async () => {
    render(<IngredientForm />);
    openForm();

    submit();

    const nameError = await screen.findByText(
      INGREDIENT_SCHEMA_ERROR_MESSAGES.name.min,
    );
    const nameInput = screen.getByRole("textbox", { name: "Nombre" });

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput.getAttribute("aria-describedby")).toContain(nameError.id);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("muestra error de validación si la unidad es corta", async () => {
    render(<IngredientForm />);
    openForm();

    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), {
      target: { value: "Café en grano" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Unidad" }), {
      target: { value: "g" },
    });
    submit();

    expect(
      await screen.findByText(INGREDIENT_SCHEMA_ERROR_MESSAGES.unit.min),
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("muestra error de validación si no se seleccionó categoría", async () => {
    render(<IngredientForm />);
    openForm();

    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), {
      target: { value: "Café en grano" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Unidad" }), {
      target: { value: "gramos" },
    });
    submit();

    expect(
      await screen.findByText(
        INGREDIENT_SCHEMA_ERROR_MESSAGES.categoryId.invalid,
      ),
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("llama a mutate con los datos del form cuando todos los campos son válidos", async () => {
    render(<IngredientForm />);
    openForm();

    await fillValidForm();
    submit();

    await waitFor(() => expect(mutateMock).toHaveBeenCalled());
    const [payload] = mutateMock.mock.calls[0];
    expect(payload).toStrictEqual({
      name: "Café en grano",
      unit: "gramos",
      categoryId: LACTEOS_CATEGORY_ID,
      minStockThreshold: undefined,
    });
  });

  it("convierte el stock mínimo a number cuando se completa", async () => {
    render(<IngredientForm />);
    openForm();

    await fillValidForm();
    fireEvent.change(screen.getByRole("textbox", { name: "Stock mínimo" }), {
      target: { value: "5" },
    });
    submit();

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ minStockThreshold: 5 }),
        expect.any(Object),
      ),
    );
  });

  it("envía name y unit sin espacios sobrantes", async () => {
    render(<IngredientForm />);
    openForm();
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), {
      target: { value: "  Café " },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Unidad" }), {
      target: { value: "  gramos  " },
    });
    await selectExistingCategory();
    submit();

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Café", unit: "gramos" }),
        expect.any(Object),
      );
    });
  });

  it("muestra el nombre duplicado del backend en el campo Nombre, no en el root", async () => {
    mutateMock.mockImplementation((_data, { onError }) =>
      onError?.({
        response: {
          status: 409,
          data: { message: "El nombre del ingrediente ya está en uso" },
        },
      }),
    );
    render(<IngredientForm />);
    openForm();

    await fillValidForm();
    submit();

    const nameError = await screen.findByText(
      "El nombre del ingrediente ya está en uso",
    );
    const nameInput = screen.getByRole("textbox", { name: "Nombre" });

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput.getAttribute("aria-describedby")).toContain(nameError.id);
  });

  it("muestra un error genérico (sin campo asociado) si la mutation falla por otro motivo", async () => {
    mutateMock.mockImplementation((_data, { onError }) =>
      onError?.({
        response: { status: 500, data: { message: undefined } },
      }),
    );
    render(<IngredientForm />);
    openForm();

    await fillValidForm();
    submit();

    expect(
      await screen.findByText(
        "No se pudo crear el ingrediente. Intenta de nuevo.",
      ),
    ).toBeInTheDocument();
  });

  it("permite crear una categoría al vuelo desde el combobox y usarla en el submit", async () => {
    createCategoryMutateAsyncMock.mockResolvedValue({
      id: INFUSIONES_CATEGORY_ID,
      name: "Infusiones",
    });
    render(<IngredientForm />);
    openForm();

    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), {
      target: { value: "Té verde" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Unidad" }), {
      target: { value: "gramos" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Categoría" }));
    fireEvent.change(screen.getByPlaceholderText("Buscar categoría..."), {
      target: { value: "Infusiones" },
    });
    fireEvent.click(screen.getByText('Crear categoría "Infusiones"'));

    await waitFor(() =>
      expect(createCategoryMutateAsyncMock).toHaveBeenCalledWith({
        name: "Infusiones",
      }),
    );
    // Esperar solo a que se llamó onCreateOption no alcanza: el popup sigue
    // abierto hasta que el await interno de handleCreate resuelve y
    // handleSelect corre. Esperamos a que el popup se cierre, señal de que
    // el valor del campo ya se actualizó, antes de hacer submit.
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );

    submit();

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: INFUSIONES_CATEGORY_ID }),
        expect.any(Object),
      ),
    );
  });
});
