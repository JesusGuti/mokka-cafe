import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Form } from "./form";
import { FormInput } from "./form-input";
import type { InputMode, InputType } from "@/shared/types/input";

interface TestFormValues {
  field: string;
}

interface RenderFormInputOptions {
  mode?: InputMode;
  type?: InputType;
  required?: boolean;
  description?: string;
  errorMessage?: string;
}

/**
 * FormInput depende de useFormContext(), no se puede renderizar solo.
 * Este harness arma el useForm()+Form alrededor, e inyecta un error de
 * validación "a mano" (sin resolver/schema) cuando el test lo necesita.
 */
const renderFormInput = ({
  mode = "none",
  type = "text",
  required,
  description,
  errorMessage,
}: RenderFormInputOptions = {}) => {
  const Harness = () => {
    const form = useForm<TestFormValues>({ defaultValues: { field: "" } });

    useEffect(() => {
      if (errorMessage) {
        form.setError("field", { message: errorMessage });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Form form={form} onSubmit={() => {}}>
        <FormInput<TestFormValues>
          name="field"
          label="Campo"
          type={type}
          mode={mode}
          required={required}
          description={description}
        />
      </Form>
    );
  };

  return render(<Harness />);
};

describe("FormInput", () => {
  it("sanea el valor con cleanValue antes de que llegue al form", () => {
    renderFormInput({ mode: "numeric" });

    const input = screen.getByRole("textbox", { name: "Campo" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12a3" } });

    expect(input.value).toBe("123");
  });

  it("fuerza type=text en modo numeric/decimal aunque se pida otro type", () => {
    renderFormInput({ mode: "decimal", type: "number" });

    const input = screen.getByRole("textbox", { name: "Campo" }) as HTMLInputElement;
    expect(input.type).toBe("text");
  });

  it("muestra el error de validación y lo conecta por aria-describedby", () => {
    renderFormInput({ errorMessage: "Este campo es inválido" });

    const input = screen.getByRole("textbox", { name: "Campo" });
    const error = screen.getByText("Este campo es inválido");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("no muestra ningún error cuando el campo es válido", () => {
    renderFormInput();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Campo" })).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("muestra el asterisco cuando required es true (default)", () => {
    renderFormInput();

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("no muestra el asterisco cuando required es false", () => {
    renderFormInput({ required: false });

    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("incluye description y error juntos en aria-describedby", () => {
    renderFormInput({
      description: "Alguna ayuda",
      errorMessage: "Error acá",
    });

    const input = screen.getByRole("textbox", { name: "Campo" });
    const description = screen.getByText("Alguna ayuda");
    const error = screen.getByText("Error acá");
    const describedBy = input.getAttribute("aria-describedby") ?? "";

    expect(describedBy).toContain(description.id);
    expect(describedBy).toContain(error.id);
  });
});
