import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { UsersTable } from "./users-table";
import type { UserResponse } from "../types/users.types";

/**
 * vi.mock se hoistea arriba de los imports, así que la referencia que
 * necesita el factory (y que también usan los tests) va en vi.hoisted.
 * Mismo patrón que loginForm.spec.tsx para mockear un hook de TanStack Query.
 */
const { useGetUsersMock } = vi.hoisted(() => ({
  useGetUsersMock: vi.fn(),
}));

vi.mock("../hooks/use-get-users", () => ({
  useGetUsers: useGetUsersMock,
}));

const users: UserResponse[] = [
  {
    id: "1",
    name: "Ana Admin",
    email: "ana@mokka.cafe",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
    updatedAt: "2026-01-01T00:00:00.000Z" as unknown as Date,
  },
  {
    id: "2",
    name: "Carlos Cajero",
    email: "carlos@mokka.cafe",
    role: "CAJERO",
    isActive: false,
    createdAt: "2026-01-02T00:00:00.000Z" as unknown as Date,
    updatedAt: "2026-01-02T00:00:00.000Z" as unknown as Date,
  },
];

beforeEach(() => {
  useGetUsersMock.mockReset();
  useGetUsersMock.mockReturnValue({ data: users, isLoading: false });
});

describe("UsersTable", () => {
  it("muestra los usuarios devueltos por el hook", () => {
    render(<UsersTable />);

    expect(screen.getByText("Ana Admin")).toBeInTheDocument();
    expect(screen.getByText("Carlos Cajero")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
    expect(screen.getByText("Cajero")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  it("muestra esqueletos mientras isLoading es true", () => {
    useGetUsersMock.mockReturnValue({ data: undefined, isLoading: true });

    render(<UsersTable />);

    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("muestra el mensaje vacío cuando no hay usuarios", () => {
    useGetUsersMock.mockReturnValue({ data: [], isLoading: false });

    render(<UsersTable />);

    expect(screen.getByText("No hay usuarios registrados.")).toBeInTheDocument();
  });

  it("filtra por rol usando el filtro de la toolbar", () => {
    render(<UsersTable />);

    // La columna "Rol" también tiene un botón de orden con el mismo nombre
    // accesible; el trigger del filtro se distingue por `aria-haspopup`.
    const roleFilterTrigger = screen
      .getAllByRole("button", { name: "Rol" })
      .find((button) => button.getAttribute("aria-haspopup") === "menu")!;

    fireEvent.click(roleFilterTrigger);
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Administrador" }));

    expect(screen.getByText("Ana Admin")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Cajero")).not.toBeInTheDocument();
  });

  it("filtra por texto libre usando el buscador", () => {
    render(<UsersTable />);

    fireEvent.change(
      screen.getByPlaceholderText("Buscar por nombre o correo..."),
      { target: { value: "carlos" } },
    );

    expect(screen.queryByText("Ana Admin")).not.toBeInTheDocument();
    expect(screen.getByText("Carlos Cajero")).toBeInTheDocument();
  });
});
