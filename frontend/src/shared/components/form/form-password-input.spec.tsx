import { Form } from "./form";
import { FormPasswordInput } from "./form-password-input";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

interface TestFormValues {
  field: string;
}

const renderFormPasswordInput = () => {
  const Harness = () => {
    const form = useForm<TestFormValues>({ defaultValues: { field: "" } });

    return (
      <Form form={form} onSubmit={() => {}}>
        <FormPasswordInput<TestFormValues> name="field" label="Campo" />
      </Form>
    );
  };

  return render(<Harness />);
};

describe("FormPasswordInput", () => {
  it("al renderizarse el modo del input debe ser del tipo password", () => {
    renderFormPasswordInput();

    const input = screen.getByLabelText("Campo", {
      exact: false,
    }) as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("al hacer clic en el botón el modo del input debe cambiar al modo texto", () => {
    renderFormPasswordInput();

    const changeButton = screen.getByRole("button");
    fireEvent.click(changeButton);

    const input = screen.getByRole("textbox", {
      name: "Campo",
    }) as HTMLInputElement;
    expect(input.type).toBe("text");
  });

  it("al hacer clic en el botón el modo del input dos veces el input debe cambiar al modo password", () => {
    renderFormPasswordInput();

    const changeButton = screen.getByRole("button");
    fireEvent.click(changeButton);

    const input = screen.getByRole("textbox", {
      name: "Campo",
    }) as HTMLInputElement;
    expect(input.type).toBe("text");

    fireEvent.click(changeButton);
    expect(input.type).toBe("password");
  });
});
