import type { ReactElement, ReactNode } from "react";
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

interface FormDialogProps<T extends FieldValues> {
  cancelLabel?: string;
  children: ReactNode;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  description: string | ReactNode;
  form: UseFormReturn<T>;
  hideClose?: boolean;
  onConfirm: () => void | Promise<void>;
  submitingLabel?: string;
  title: string;
  trigger: ReactElement;
}

export const FormDialog = <T extends FieldValues>(
  props: FormDialogProps<T>,
) => {
  const { handleConfirm, isLoading, open, setOpen } = useActionDialog({
    onConfirm: props.onConfirm,
  });

  const handleOpenChange = (state: boolean): void => {
    setOpen(state);
    props.form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={props.trigger} />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};
