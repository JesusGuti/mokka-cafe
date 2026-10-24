import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Form } from "./form";
import { FormCombobox } from "./form-combobox";
import type { SelectOption } from "@/shared/types/select";

interface TestFormValues {
  field: string;
}

const OPTIONS: SelectOption[] = [
  { label: "Lácteos", value: "cat-lacteos" },
  { label: "Café", value: "cat-cafe" },
];

interface RenderFormComboboxOptions {
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  defaultValue?: string;
  onCreateOption?: (value: string) => Promise<SelectOption | null>;
}

/**
 * FormCombobox depende de useFormContext(), igual que FormSelect: necesita
 * un harness con useForm()+Form alrededor. Ver form-select.spec.tsx.
 */
const renderFormCombobox = ({
  options = OPTIONS,
  required,
  disabled,
  errorMessage,
  defaultValue = "",
  onCreateOption,
}: RenderFormComboboxOptions = {}) => {
  const Harness = () => {
    const form = useForm<TestFormValues>({
      defaultValues: { field: defaultValue },
    });

    useEffect(() => {
      if (errorMessage) {
        form.setError("field", { message: errorMessage });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Form form={form} onSubmit={() => {}}>
        <FormCombobox<TestFormValues>
          name="field"
          label="Categoría"
          options={options}
          required={required}
          disabled={disabled}
          onCreateOption={onCreateOption}
        />
      </Form>
    );
  };

  return render(<Harness />);
};

describe("FormCombobox", () => {
  /**
   * Base UI (Popover) usa Pointer Events al posicionar el popup; jsdom no
   * los implementa. Mismo polyfill que ya usa form-select.spec.tsx. `cmdk`
   * (el Command de adentro) además necesita ResizeObserver, tampoco
   * implementado en jsdom.
   */
  beforeEach(() => {
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

  const openCombobox = () => {
    fireEvent.click(screen.getByRole("button", { name: "Categoría" }));
  };

  it("muestra el placeholder cuando no hay valor seleccionado", () => {
    renderFormCombobox();

    expect(screen.getByText("Selecciona una opción")).toBeVisible();
  });

  it("muestra las opciones al abrir el combobox", async () => {
    renderFormCombobox();
    openCombobox();

    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByText("Lácteos")).toBeVisible();
    expect(within(listbox).getByText("Café")).toBeVisible();
  });

  it("filtra las opciones al buscar", async () => {
    renderFormCombobox();
    openCombobox();

    // "cte" en vez de "lac": el filtro es un .includes() simple, y "lac"
    // (sin acento) no es substring de "Lácteos" (con "á" acentuada).
    const searchInput = await screen.findByPlaceholderText("Buscar...");
    fireEvent.change(searchInput, { target: { value: "cte" } });

    expect(screen.getByText("Lácteos")).toBeVisible();
    expect(screen.queryByText("Café")).not.toBeInTheDocument();
  });

  it("selecciona una opción existente y cierra el popup", async () => {
    renderFormCombobox();
    openCombobox();

    fireEvent.click(await screen.findByText("Café"));

    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Café")).toBeVisible();
  });

  it("no ofrece crear una opción si no se pasó onCreateOption", async () => {
    renderFormCombobox();
    openCombobox();

    const searchInput = await screen.findByPlaceholderText("Buscar...");
    fireEvent.change(searchInput, { target: { value: "Nueva categoría" } });

    expect(screen.queryByText(/Crear/)).not.toBeInTheDocument();
  });

  it("no ofrece crear una opción si el texto matchea una existente", async () => {
    renderFormCombobox({ onCreateOption: vi.fn() });
    openCombobox();

    const searchInput = await screen.findByPlaceholderText("Buscar...");
    fireEvent.change(searchInput, { target: { value: "Café" } });

    expect(screen.queryByText(/Crear/)).not.toBeInTheDocument();
  });

  it("ofrece crear una opción cuando el texto no matchea ninguna existente", async () => {
    renderFormCombobox({ onCreateOption: vi.fn() });
    openCombobox();

    const searchInput = await screen.findByPlaceholderText("Buscar...");
    fireEvent.change(searchInput, { target: { value: "Infusiones" } });

    expect(screen.getByText('Crear "Infusiones"')).toBeVisible();
  });

  it("al crear, llama a onCreateOption y selecciona la opción devuelta", async () => {
    const onCreateOption = vi
      .fn()
      .mockResolvedValue({ label: "Infusiones", value: "cat-infusiones" });
    renderFormCombobox({ onCreateOption });
    openCombobox();

    const searchInput = await screen.findByPlaceholderText("Buscar...");
    fireEvent.change(searchInput, { target: { value: "Infusiones" } });
    fireEvent.click(screen.getByText('Crear "Infusiones"'));

    await waitFor(() =>
      expect(onCreateOption).toHaveBeenCalledWith("Infusiones"),
    );
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    // En este harness `options` es estático y nunca incluye la opción creada
    // (en la app real llega tras el refetch): el trigger debe mostrarla igual.
    expect(
      screen.getByRole("button", { name: "Categoría" }),
    ).toHaveTextContent("Infusiones");
  });

  it("si onCreateOption devuelve null (el caller ya mostró el error), no cambia la selección ni cierra el popup", async () => {
    const onCreateOption = vi.fn().mockResolvedValue(null);
    renderFormCombobox({ onCreateOption });
    openCombobox();

    const searchInput = await screen.findByPlaceholderText("Buscar...");
    fireEvent.change(searchInput, { target: { value: "Repetida" } });
    fireEvent.click(screen.getByText('Crear "Repetida"'));

    await waitFor(() => expect(onCreateOption).toHaveBeenCalled());
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una opción")).toBeVisible();
  });

  it("muestra el asterisco cuando required es true (default)", () => {
    renderFormCombobox();

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("no muestra el asterisco cuando required es false", () => {
    renderFormCombobox({ required: false });

    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("muestra el error de validación y marca aria-invalid en el trigger", () => {
    renderFormCombobox({ errorMessage: "Selecciona una categoría válida" });

    const trigger = screen.getByRole("button", { name: "Categoría" });
    const error = screen.getByText("Selecciona una categoría válida");

    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("respeta disabled: el trigger queda deshabilitado", () => {
    renderFormCombobox({ disabled: true });

    expect(screen.getByRole("button", { name: "Categoría" })).toBeDisabled();
  });
});
