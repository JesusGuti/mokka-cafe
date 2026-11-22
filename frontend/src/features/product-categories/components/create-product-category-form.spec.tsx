import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateProductCategoryForm } from "./create-product-category-form";
import { PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES } from "../schemas/product-categories.schema";

const { mutateAsyncMock, showToastMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  showToastMock: vi.fn(),
}));

vi.mock("../hooks/use-create-product-category", () => ({
  useCreateProductCategory: () => ({ mutateAsync: mutateAsyncMock }),
}));
vi.mock("@/shared/lib/toast", () => ({ showToast: showToastMock }));

const apiError = (status: number, message: string) =>
  new AxiosError("fail", "ERR", undefined, undefined, {
    status,
    data: { message },
  } as AxiosResponse);

const openDialog = () => {
  render(<CreateProductCategoryForm />);
  fireEvent.click(screen.getByRole("button", { name: "Nueva categoría" }));
};

const nameInput = () => screen.getByRole("textbox", { name: "Nombre" });

const typeName = (value: string) =>
  fireEvent.change(nameInput(), { target: { value } });

const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Crear categoría" }));

describe("CreateProductCategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no muestra el diálogo hasta pulsar «Nueva categoría»", () => {
    render(<CreateProductCategoryForm />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Nueva categoría" }));

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(nameInput()).toBeVisible();
  });

  it("rechaza un nombre vacío junto al campo y no llama al backend (AC-1.5)", async () => {
    openDialog();

    submit();

    expect(
      await screen.findByText(PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.min),
    ).toBeVisible();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("rechaza un nombre de solo espacios", async () => {
    openDialog();
    typeName("   ");

    submit();

    expect(
      await screen.findByText(PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.min),
    ).toBeVisible();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("rechaza un nombre de más de 50 caracteres (AC-1.5)", async () => {
    openDialog();
    typeName("a".repeat(51));

    submit();

    expect(
      await screen.findByText(PRODUCT_CATEGORY_SCHEMA_ERROR_MESSAGES.name.max),
    ).toBeVisible();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("crea la categoría con el nombre recortado y avisa con un toast", async () => {
    mutateAsyncMock.mockResolvedValue({ id: "1", name: "Calientes" });
    openDialog();
    typeName("  Calientes  ");

    submit();

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({ name: "Calientes" });
    });
    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith(
        "«Calientes» creada",
        "success",
      );
    });
  });

  it("tras crear sigue abierto, con el campo vacío y con el foco (AC-1.13)", async () => {
    mutateAsyncMock.mockResolvedValue({ id: "1", name: "Calientes" });
    openDialog();
    typeName("Calientes");

    submit();

    await waitFor(() => {
      expect(nameInput()).toHaveValue("");
    });
    expect(screen.getByRole("dialog")).toBeVisible();
    await waitFor(() => {
      expect(nameInput()).toHaveFocus();
    });
  });

  it("un nombre duplicado (409) se muestra junto al campo, sin toast (AC-1.6)", async () => {
    mutateAsyncMock.mockRejectedValue(
      apiError(409, "Ya existe una categoría con ese nombre"),
    );
    openDialog();
    typeName("Calientes");

    submit();

    expect(
      await screen.findByText("Ya existe una categoría con ese nombre"),
    ).toBeVisible();
    expect(showToastMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(nameInput()).toHaveValue("Calientes");
  });

  it("un error inesperado se muestra en el formulario y en un toast, y conserva lo escrito", async () => {
    mutateAsyncMock.mockRejectedValue(apiError(500, "Fallo interno"));
    openDialog();
    typeName("Calientes");

    submit();

    expect(await screen.findByText("Fallo interno")).toBeVisible();
    expect(showToastMock).toHaveBeenCalledWith("Fallo interno", "error");
    expect(nameInput()).toHaveValue("Calientes");
  });

  it("al cerrar con texto escrito pide confirmar antes de descartarlo (AC-1.12)", () => {
    openDialog();
    typeName("Calientes");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tienes cambios sin guardar",
    );
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("al cerrar sin cambios se cierra directo", () => {
    openDialog();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
