import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LoginForm } from "./loginForm";

/**
 * vi.mock se hoistea arriba de los imports, así que las referencias que
 * necesita el factory (y que también usan los tests) van en vi.hoisted.
 */
const { mutateMock, pushMock, useSignInMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  pushMock: vi.fn(),
  useSignInMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/auth/hooks/use-sign-in", () => ({
  useSignIn: useSignInMock,
}));

const fillAndSubmit = (email: string, password: string) => {
  fireEvent.change(screen.getByRole("textbox", { name: "Correo" }), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Contraseña", { exact: false }), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
};

beforeEach(() => {
  mutateMock.mockReset();
  pushMock.mockReset();
  useSignInMock.mockReset();
  useSignInMock.mockReturnValue({ mutate: mutateMock, isPending: false });
});

describe("LoginForm", () => {
  it("muestra el error de validación y no llama a mutate si el email es inválido", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    const emailError = await screen.findByText("Ingresa un correo válido");
    const emailInput = screen.getByRole("textbox", { name: "Correo" });

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput.getAttribute("aria-describedby")).toContain(
      emailError.id,
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("deshabilita el botón mientras isPending es true", () => {
    useSignInMock.mockReturnValue({ mutate: mutateMock, isPending: true });

    render(<LoginForm />);

    expect(screen.getByRole("button", { name: "Ingresando..." })).toBeDisabled();
  });

  it("llama a mutate con los datos del form y redirige a /pos si el login es exitoso", async () => {
    mutateMock.mockImplementation((_data, { onSuccess }) => onSuccess?.());
    render(<LoginForm />);

    fillAndSubmit("mesero@mokka.cafe", "password123");

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith(
        { email: "mesero@mokka.cafe", password: "password123" },
        expect.any(Object),
      ),
    );
    expect(pushMock).toHaveBeenCalledWith("/pos");
  });

  it("muestra el mensaje de error del backend si el login falla", async () => {
    mutateMock.mockImplementation((_data, { onError }) =>
      onError?.({
        response: { data: { message: "Credenciales inválidas" } },
      }),
    );
    render(<LoginForm />);

    fillAndSubmit("mesero@mokka.cafe", "password123");

    expect(
      await screen.findByText("Credenciales inválidas"),
    ).toBeInTheDocument();
  });
});
