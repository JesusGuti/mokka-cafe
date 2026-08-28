import type { ReactNode } from "react";
import {
  FormProvider,
  type UseFormReturn,
  type FieldValues,
  type SubmitErrorHandler,
} from "react-hook-form";

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  /**
   * Corre cuando el submit se bloquea por validación. Sin esto, un submit
   * fallido queda silencioso si el campo con error está fuera de la vista.
   */
  onInvalid?: SubmitErrorHandler<T>;
  children: ReactNode;
  className?: string;
}

const Form = <T extends FieldValues>({
  form,
  onSubmit,
  onInvalid,
  children,
  className,
}: FormProps<T>) => {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export { Form };
