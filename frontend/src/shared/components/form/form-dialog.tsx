import { useState } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Loader } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useActionDialog } from "@/shared/hooks/use-action-dialog";
import { Form } from "@/shared/components/form/form";

const DISCARD_WARNING = {
  keepEditingLabel: "Seguir editando",
  discardLabel: "Descartar cambios",
  message: "Tienes cambios sin guardar. Si cierras, se perderán.",
};

interface FormDialogProps<T extends FieldValues> {
  cancelLabel?: string;
  children: ReactNode;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  /** Estilo del botón de confirmar; "destructive" para acciones que borran. */
  confirmVariant?: ComponentProps<typeof Button>["variant"];
  description: string | ReactNode;
  form: UseFormReturn<T>;
  hideClose?: boolean;
  /**
   * Si es `true`, el diálogo sigue abierto tras confirmar con éxito, para
   * cargar varios registros seguidos. Quien lo use decide qué hacer con el
   * formulario (normalmente `form.reset()` y devolver el foco).
   */
  keepOpenOnConfirm?: boolean;
  onConfirm: () => void | Promise<void>;
  /** Modo controlado: si se pasa, el padre decide cuándo está abierto. */
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  submitingLabel?: string;
  title: string;
  /** Opcional: un diálogo controlado desde fuera no necesita botón propio. */
  trigger?: ReactElement;
  /**
   * Si es `true` y el formulario tiene cambios, cerrar (Esc, clic fuera,
   * Cancelar o la X) pide confirmación antes de descartarlos. Un segundo
   * intento de cierre (por ejemplo, otro Esc) los descarta.
   */
  warnOnDiscard?: boolean;
}

export const FormDialog = <T extends FieldValues>(
  props: FormDialogProps<T>,
) => {
  const { handleConfirm, isLoading, open, setOpen } = useActionDialog({
    closeOnConfirm: !props.keepOpenOnConfirm,
    onConfirm: props.onConfirm,
    onOpenChange: props.onOpenChange,
    open: props.open,
  });
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  // Se lee durante el render a propósito: react-hook-form solo mantiene
  // `isDirty` actualizado si alguien lo está observando.
  const { isDirty } = props.form.formState;

  const handleOpenChange = (state: boolean): void => {
    if (!state && props.warnOnDiscard && isDirty && !isConfirmingDiscard) {
      setIsConfirmingDiscard(true);
      return;
    }

    setIsConfirmingDiscard(false);
    setOpen(state);
    props.form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {props.trigger && <DialogTrigger render={props.trigger} />}
      <DialogContent
        showCloseButton={!props.hideClose}
        className="flex max-h-[90vh] flex-col gap-2 p-8 sm:max-w-md"
      >
        <DialogHeader className="shrink-0 gap-2">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {props.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {props.description}
          </DialogDescription>
        </DialogHeader>
        <Form
          form={props.form}
          onSubmit={handleConfirm}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto py-2">{props.children}</div>
          {isConfirmingDiscard ? (
            <div role="alert" className="flex flex-col gap-3 pt-2">
              <p className="text-sm font-medium">{DISCARD_WARNING.message}</p>
              <div className="flex flex-col-reverse gap-2 lg:flex-row lg:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-6 font-medium"
                  onClick={() => setIsConfirmingDiscard(false)}
                >
                  {DISCARD_WARNING.keepEditingLabel}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-10 px-6 font-medium"
                  onClick={() => handleOpenChange(false)}
                >
                  {DISCARD_WARNING.discardLabel}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-6 font-medium"
                  />
                }
              >
                {props.cancelLabel ?? "Cancelar"}
              </DialogClose>

              <Button
                type="submit"
                variant={props.confirmVariant}
                disabled={isLoading || props.confirmDisabled}
                className="h-10 px-8 font-semibold shadow-sm transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" />
                    {props.submitingLabel ?? "Confirmando..."}
                  </>
                ) : (
                  (props.confirmLabel ?? "Confirmar")
                )}
              </Button>
            </div>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};
