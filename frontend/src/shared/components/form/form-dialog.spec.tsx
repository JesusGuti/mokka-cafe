import { FormDialog } from "./form-dialog";
import { FormInput } from "./form-input";
import { Button } from "../ui/button";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

const FORM_DIALOG_CONSTANTS = {
  cancelLabel: "Prueba cancelar",
  confirmDisabled: false,
  confirmLabel: "Prueba confirmar",
  description: "Prueba descripcion",
  hideClose: true,
  onConfirm: () => console.log("prueba"),
  submitingLabel: "Prueba submiting",
  title: "Prueba titulo",
};

const DEFAULT_TRIGGER_LABEL = "Action Trigger";
const DEFAULT_FIELD_VALUE = "";

const triggerButton = (label: string) => {
  return <Button>{label}</Button>;
};

interface TestFormValues {
  field: string;
}

interface RenderFormDialogOptions {
  triggerLabel?: string;
  defaultFieldValue?: string;
}

const renderFormDialog = (
  overrides: Partial<typeof FORM_DIALOG_CONSTANTS> = {},
  {
    triggerLabel = DEFAULT_TRIGGER_LABEL,
    defaultFieldValue = DEFAULT_FIELD_VALUE,
  }: RenderFormDialogOptions = {},
) => {
  const props = { ...FORM_DIALOG_CONSTANTS, ...overrides };

  const Harness = () => {
    const form = useForm<TestFormValues>({
      defaultValues: { field: defaultFieldValue },
    });

    return (
      <FormDialog
        cancelLabel={props.cancelLabel}
        confirmDisabled={props.confirmDisabled}
        confirmLabel={props.confirmLabel}
        description={props.description}
        form={form}
        hideClose={props.hideClose}
        onConfirm={props.onConfirm}
        submitingLabel={props.submitingLabel}
        title={props.title}
        trigger={triggerButton(triggerLabel)}
      >
        <FormInput<TestFormValues>
          name="field"
          label="Campo"
          type="text"
          mode="text"
          required={true}
          description="description"
        />
      </FormDialog>
    );
  };

  return render(<Harness />);
};

describe("FormDialog", () => {
  it("se abre un dialogo cuando se hace click en el trigger propuesto", () => {
    renderFormDialog();

    // Al inicio el dialogo nisiquiera se monta en el dialogo
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    // Ahora una vez montado e invocado deberia estar visible
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeVisible();
  });

  it("al abrir el dialogo se deben mostrar el titulo, descripción, label de cancelación y de confirmación ", () => {
    renderFormDialog();

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    const titleText = screen.getByText(FORM_DIALOG_CONSTANTS.title);
    const description = screen.getByText(FORM_DIALOG_CONSTANTS.description);
    const cancelLabel = screen.getByText(FORM_DIALOG_CONSTANTS.cancelLabel);
    const confirmLabel = screen.getByText(FORM_DIALOG_CONSTANTS.confirmLabel);

    expect(titleText).toBeVisible();
    expect(description).toBeVisible();
    expect(cancelLabel).toBeVisible();
    expect(confirmLabel).toBeVisible();
  });

  it("al hacer click en el botón cancelar se cierra el dialogo ", () => {
    renderFormDialog();

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    const cancelButton = screen.getByRole("button", {
      name: FORM_DIALOG_CONSTANTS.cancelLabel,
    });
    fireEvent.click(cancelButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("si hideClose es true, el botón de cerrar debe estar oculto", () => {
    renderFormDialog({ hideClose: true });

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("si hideClose es false, el botón de cerrar debe estar visible", () => {
    renderFormDialog({ hideClose: false });

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    expect(screen.getByRole("button", { name: "Close" })).toBeVisible();
  });

  it("si al enviar el form y onConfirm se resuelve el dialog debe cerrarse", async () => {
    // vi.fn() crea un mock que además de espiar sus llamadas (toHaveBeenCalledTimes)
    // nos deja controlar qué devuelve. mockResolvedValue(x) simula una función
    // async que se resuelve con x, sin necesidad de un onConfirm real que dependa de red.
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderFormDialog({ onConfirm });

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    const submitButton = screen.getByRole("button", {
      name: FORM_DIALOG_CONSTANTS.confirmLabel,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("si al enviar el form y onConfirm rechaza el dialog debe permanecer abierto", async () => {
    // mockRejectedValue(err) es el equivalente a mockResolvedValue pero simulando
    // una promesa que rechaza, para cubrir el catch silencioso de useActionDialog
    // sin tener que provocar un error real (ej. una petición de red que falla).
    const onConfirm = vi.fn().mockRejectedValue(new Error("fail"));
    renderFormDialog({ onConfirm });

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    const submitButton = screen.getByRole("button", {
      name: FORM_DIALOG_CONSTANTS.confirmLabel,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("mientras la acción se esté ejecutando se debe mostrar submitingLabel, un loader y el botón de submit debe estar deshabilitado", async () => {
    // Promesa controlada a mano: no la resolvemos todavía, así podemos inspeccionar
    // el estado "loading" con calma antes de dejar que el dialog se cierre.
    let resolveConfirm: () => void;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        }),
    );
    renderFormDialog({ onConfirm });

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    const submitButton = screen.getByRole("button", {
      name: FORM_DIALOG_CONSTANTS.confirmLabel,
    });
    fireEvent.click(submitButton);

    // El submit de react-hook-form valida de forma async antes de invocar onConfirm,
    // por lo que el cambio a "loading" no es inmediato tras el click: hay que esperarlo.
    await waitFor(() => {
      expect(
        screen.getByText(FORM_DIALOG_CONSTANTS.submitingLabel),
      ).toBeVisible();
    });

    const submitButtonLoading = screen.getByRole("button", {
      name: FORM_DIALOG_CONSTANTS.submitingLabel,
    });
    expect(submitButtonLoading).toBeDisabled();

    // El ícono Loader de lucide-react trae aria-hidden="true" por ser decorativo,
    // así que queda fuera del árbol de accesibilidad: getByRole nunca lo encuentra,
    // sin importar qué rol le pasemos. Hay que buscarlo por selector CSS directo.
    expect(document.querySelector("svg.lucide-loader")).toBeInTheDocument();

    resolveConfirm!();

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("si confirmDisabled es true, el botón de confirmar debe estar deshabilitado sin depender del loading", () => {
    renderFormDialog({ confirmDisabled: true });

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    // isLoading sigue siendo false acá (nunca se hizo submit), así que si el botón
    // está deshabilitado es únicamente por confirmDisabled, no por el estado de carga.
    const submitButton = screen.getByRole("button", {
      name: FORM_DIALOG_CONSTANTS.confirmLabel,
    });
    expect(submitButton).toBeDisabled();
  });

  it("al cerrar el dialog se resetea el form al defaultValue", () => {
    renderFormDialog({}, { defaultFieldValue: "valor inicial" });

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    const input = screen.getByRole("textbox", { name: "Campo" });
    fireEvent.change(input, { target: { value: "valor modificado" } });
    expect(input).toHaveValue("valor modificado");

    // Cerrar por cualquier vía (acá, cancelar) dispara handleOpenChange, que
    // llama a form.reset() sin condicionarlo al valor de "open".
    const cancelButton = screen.getByRole("button", {
      name: FORM_DIALOG_CONSTANTS.cancelLabel,
    });
    fireEvent.click(cancelButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(buttonTrigger);
    const reopenedInput = screen.getByRole("textbox", { name: "Campo" });
    expect(reopenedInput).toHaveValue("valor inicial");
  });

  it("el trigger recibido se renderiza tal cual, incluso antes de abrir el dialog", () => {
    renderFormDialog({}, { triggerLabel: "Abrir formulario personalizado" });

    expect(
      screen.getByText("Abrir formulario personalizado"),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("los children se renderizan dentro del form", () => {
    renderFormDialog();

    const buttonTrigger = screen.getByRole("button");
    fireEvent.click(buttonTrigger);

    // El DialogContent se monta en un portal fuera del container de render(),
    // así que hay que buscar el <form> en document en vez de en container.
    const form = document.querySelector("form");
    const input = screen.getByRole("textbox", { name: "Campo" });

    expect(form).not.toBeNull();
    expect(form).toContainElement(input);
  });
});
