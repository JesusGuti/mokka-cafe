import { useState } from "react";

interface UseActionDialogProps {
  /**
   * Si es `false`, el diálogo no se cierra al terminar `onConfirm` con éxito
   * (útil para cargar varios registros seguidos). Por defecto se cierra.
   */
  closeOnConfirm?: boolean;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const useActionDialog = ({
  closeOnConfirm = true,
  onConfirm,
  onOpenChange,
  open: controlledOpen,
}: UseActionDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      if (closeOnConfirm) setOpen(false);
    } catch {
      // El dialog queda abierto para que el usuario corrija y reintente. El
      // error lo muestra el onConfirm del caller (ej. onError de una mutation
      // con toast); acá se traga solo para no dejar un unhandled rejection
      // colgando del submit handler del form.
    } finally {
      setIsLoading(false);
    }
  };

  return { handleConfirm, isLoading, open, setOpen };
};
