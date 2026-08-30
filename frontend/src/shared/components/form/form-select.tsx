import { useId } from "react";
import { XIcon } from "lucide-react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { SelectOption } from "@/shared/types/select";

interface FormSelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
  emptyMessage?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
}

const FormSelect = <T extends FieldValues>({
  required = true,
  placeholder = "Selecciona una opción",
  emptyMessage = "No hay opciones disponibles",
  disabled = false,
  allowClear = false,
  ...props
}: FormSelectProps<T>) => {
  const { control } = useFormContext<T>();
  const generatedId = useId();
  const id = `${props.name}-${generatedId}`;

  const descriptionId = props.description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={props.className}>
          <FieldLabel htmlFor={id}>
            {props.label}
            {required && (
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            )}
          </FieldLabel>

          {props.description && (
            <FieldDescription id={descriptionId}>
              {props.description}
            </FieldDescription>
          )}

          <Select
            items={props.options}
            value={field.value ?? null}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <div className="relative">
              <SelectTrigger
                id={id}
                className="h-10! w-full px-3"
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  [descriptionId, fieldState.error ? errorId : undefined]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              {allowClear && !disabled && field.value ? (
                <button
                  type="button"
                  aria-label="Limpiar selección"
                  onClick={() => field.onChange(null)}
                  className="absolute top-1/2 right-8 z-10 flex -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              ) : null}
            </div>
            <SelectContent>
              {!props.options.length ? (
                <SelectItem value="none" disabled>
                  {emptyMessage}
                </SelectItem>
              ) : (
                <SelectGroup>
                  <SelectLabel>{props.label}</SelectLabel>
                  {props.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>

          {fieldState.error?.message && (
            <FieldError id={errorId}>{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
};

export { FormSelect };
