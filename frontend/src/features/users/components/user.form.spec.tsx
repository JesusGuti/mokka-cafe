import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserForm } from "./user-form";
import {
  USER_SCHEMA_ERROR_MESSAGES,
  type UserPayload,
} from "../schemas/users.schema";
import { USER_ROLE_LABELS, USER_ROLES } from "../types/users.types";

const { mutateMock, useCreateUserMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  useCreateUserMock: vi.fn(),
}));

// Hacer un mock del hook que se va a usar
vi.mock("@/features/users/hooks/use-create-user", () => ({
  useCreateUser: useCreateUserMock,
}));

const VALID_PAYLOAD: UserPayload = {
  name: "Juan Pérez",
  email: "juan@mokka.com",
  password: "password123",
  role: USER_ROLES[0],
};

// Funcion para abrir el formDialog
const openForm = () => {
  fireEvent.click(screen.getByRole("button", { name: "Nuevo usuario" }));
};

// Funcion para hacer el submit
const submit = () => {
  fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));
};

/**
 * Solo completa los campos pasados en overrides; el resto queda con un
 * valor válido de VALID_PAYLOAD, así cada test toca únicamente el campo
 * que le interesa (ej. probar el email inválido sin repetir todo el resto).
 */
const fillForm = async (overrides: Partial<UserPayload> = {}) => {
  const data = { ...VALID_PAYLOAD, ...overrides };

  fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), {
    target: { value: data.name },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Correo" }), {
    target: { value: data.email },
  });
  fireEvent.change(
    screen.getByLabelText("Contraseña", { exact: false, selector: "input" }),
    { target: { value: data.password } },
  );

  fireEvent.click(screen.getByRole("combobox", { name: "Rol" }));
  const option = await screen.findByRole("option", {
    name: USER_ROLE_LABELS[data.role],
  });
  fireEvent.click(option);
};

beforeEach(() => {
  mutateMock.mockReset();
  useCreateUserMock.mockReset();
  useCreateUserMock.mockReturnValue({ mutate: mutateMock, isPending: false });

  /**
   * Base UI (igual que Radix) usa Pointer Events y scrollIntoView al abrir
   * el popup del select; jsdom no los implementa. Ver form-select.spec.tsx.
   */
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe("UserForm", () => {
  it("muestra error de validación y no llama a mutate si el nombre es corto", async () => {
    render(<UserForm />);
    openForm();

    submit();

    const nameError = await screen.findByText(
      USER_SCHEMA_ERROR_MESSAGES.name.min,
    );
    const nameInput = screen.getByRole("textbox", { name: "Nombre" });

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput.getAttribute("aria-describedby")).toContain(nameError.id);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("muestra error de validación si el correo es inválido", async () => {
    render(<UserForm />);
    openForm();

    /**
     * "correo@invalido" (sin TLD) pasa la validación nativa del <input
     * type="email"> -que solo exige un "@"-, así que el submit no queda
     * bloqueado por el navegador antes de llegar a react-hook-form/zod,
     * que sí exige dominio con TLD y es quien debe mostrar el mensaje.
     */
    await fillForm({ email: "correo@invalido" });
    submit();

    expect(
      await screen.findByText(USER_SCHEMA_ERROR_MESSAGES.email.invalid),
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("muestra error de validación si la contraseña es demasiado corta", async () => {
    render(<UserForm />);
    openForm();

    await fillForm({ password: "short" });
    submit();

    expect(
      await screen.findByText(USER_SCHEMA_ERROR_MESSAGES.password.min),
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("llama a mutate con los datos del form cuando todos los campos son válidos", async () => {
    render(<UserForm />);
    openForm();

    await fillForm();
    submit();

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith(
        VALID_PAYLOAD,
        expect.any(Object),
      ),
    );
  });

  it("muestra el email duplicado del backend en el campo Correo, no en el root", async () => {
    mutateMock.mockImplementation((_data, { onError }) =>
      onError?.({
        response: { status: 409, data: { message: "Este correo ya existe" } },
      }),
    );
    render(<UserForm />);
    openForm();

    await fillForm();
    submit();

    const emailError = await screen.findByText("Este correo ya existe");
    const emailInput = screen.getByRole("textbox", { name: "Correo" });

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput.getAttribute("aria-describedby")).toContain(
      emailError.id,
    );
  });

  it("muestra un error genérico (sin campo asociado) si la mutation falla por otro motivo", async () => {
    mutateMock.mockImplementation((_data, { onError }) =>
      onError?.({
        response: { status: 500, data: { message: undefined } },
      }),
    );
    render(<UserForm />);
    openForm();

    await fillForm();
    submit();

    expect(
      await screen.findByText(
        "No se pudo crear el usuario. Intenta de nuevo.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Correo" }),
    ).toHaveAttribute("aria-invalid", "false");
  });
});
