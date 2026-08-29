import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Form } from "./form";
import { FormSelect } from "./form-select";
import type { SelectOption } from "@/shared/types/select";

interface TestFormValues {
  field: string;
}

const OPTIONS: SelectOption[] = [
  { label: "Mesero", value: "MESERO" },
  { label: "Cajero", value: "CAJERO" },
];

interface RenderFormSelectOptions {
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  description?: string;
  errorMessage?: string;
  defaultValue?: string;
}

/**
 * FormSelect depende de useFormContext(), igual que FormInput: necesita un
 * harness con useForm()+Form alrededor. Ver form-input.spec.tsx.
 */
const renderFormSelect = ({
  options = OPTIONS,
  required,
  disabled,
  allowClear,
  description,
  errorMessage,
  defaultValue = "",
}: RenderFormSelectOptions = {}) => {
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
        <FormSelect<TestFormValues>
          name="field"
          label="Rol"
          options={options}
          required={required}
          disabled={disabled}
          allowClear={allowClear}
          description={description}
        />
      </Form>
    );
  };

  return render(<Harness />);
};

describe("FormSelect", () => {
  /**
   * Base UI (igual que Radix) usa Pointer Events y scrollIntoView al abrir
   * el popup y al hacer scroll hasta el item seleccionado; jsdom no los
   * implementa. Sin este polyfill, fireEvent.click en el trigger no abre
   * el popup (o tira un TypeError silencioso que deja el test colgado).
   */
  beforeEach(() => {
    Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  const openSelect = () => {
    fireEvent.click(screen.getByRole("combobox", { name: "Rol" }));
  };

  it("muestra el placeholder cuando no hay valor seleccionado", () => {
    renderFormSelect();

    expect(screen.getByText("Selecciona una opción")).toBeVisible();
  });

  it("muestra las opciones al abrir el select", async () => {
    renderFormSelect();
    openSelect();

    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByRole("option", { name: "Mesero" })).toBeVisible();
    expect(within(listbox).getByRole("option", { name: "Cajero" })).toBeVisible();
  });

  it("muestra emptyMessage y el item queda deshabilitado cuando options está vacío", async () => {
    renderFormSelect({ options: [] });
    openSelect();

    const emptyOption = await screen.findByRole("option", {
      name: "No hay opciones disponibles",
    });
    expect(emptyOption).toHaveAttribute("aria-disabled", "true");
  });

  it("selecciona una opción y la refleja en el trigger", async () => {
    renderFormSelect();
    openSelect();

    const option = await screen.findByRole("option", { name: "Cajero" });
    fireEvent.click(option);

    expect(screen.getByText("Cajero")).toBeVisible();
  });

  it("muestra en el trigger la opción ya seleccionada por defaultValues, sin abrir el popup", () => {
    renderFormSelect({ defaultValue: "MESERO" });

    expect(screen.getByText("Mesero")).toBeVisible();
  });

  it("muestra el asterisco cuando required es true (default)", () => {
    renderFormSelect();

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("no muestra el asterisco cuando required es false", () => {
    renderFormSelect({ required: false });

    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("muestra el error de validación y marca aria-invalid en el trigger", () => {
    renderFormSelect({ errorMessage: "Selecciona un rol válido" });

    const trigger = screen.getByRole("combobox", { name: "Rol" });
    const error = screen.getByText("Selecciona un rol válido");

    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("no muestra ningún error cuando el campo es válido", () => {
    renderFormSelect();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Rol" }),
    ).toHaveAttribute("aria-invalid", "false");
  });

  it("incluye description y error juntos en aria-describedby", () => {
    renderFormSelect({
      description: "Alguna ayuda",
      errorMessage: "Error acá",
    });

    const trigger = screen.getByRole("combobox", { name: "Rol" });
    const description = screen.getByText("Alguna ayuda");
    const error = screen.getByText("Error acá");
    const describedBy = trigger.getAttribute("aria-describedby") ?? "";

    expect(describedBy).toContain(description.id);
    expect(describedBy).toContain(error.id);
  });

  it("respeta disabled: el trigger queda deshabilitado", () => {
    renderFormSelect({ disabled: true });

    expect(screen.getByRole("combobox", { name: "Rol" })).toBeDisabled();
  });

  it("con allowClear=true no muestra el botón de limpiar sin valor seleccionado", () => {
    renderFormSelect({ allowClear: true, defaultValue: "" });

    expect(
      screen.queryByRole("button", { name: "Limpiar selección" }),
    ).not.toBeInTheDocument();
  });

  it("con allowClear=true muestra el botón de limpiar cuando ya hay un valor", () => {
    renderFormSelect({ allowClear: true, defaultValue: "MESERO" });

    expect(
      screen.getByRole("button", { name: "Limpiar selección" }),
    ).toBeVisible();
  });

  it("sin allowClear (default) no renderiza el botón de limpiar aunque haya valor", () => {
    renderFormSelect({ defaultValue: "MESERO" });

    expect(
      screen.queryByRole("button", { name: "Limpiar selección" }),
    ).not.toBeInTheDocument();
  });

  it("al hacer click en limpiar, resetea el campo sin abrir el popup", () => {
    renderFormSelect({ allowClear: true, defaultValue: "MESERO" });

    fireEvent.click(screen.getByRole("button", { name: "Limpiar selección" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("Selecciona una opción")).toBeVisible();
  });
});
