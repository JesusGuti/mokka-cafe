import type { ReactNode } from "react";
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
import { Input } from "@/shared/components/ui/input";
import { useInput } from "@/shared/hooks/use-input";
import type { InputMode, InputType } from "@/shared/types/input";

const resolveType = (type: InputType, mode: InputMode): InputType => {
  if (mode === "numeric" || mode === "decimal") return "text";
  return type;
};

export interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  placeholder?: string;
  label: string;
  type: InputType;
  disabled?: boolean;
  mode: InputMode;
  formInputClassname?: string;
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  /**
   * Sin default propio a propósito: en un terminal compartido puede
   * convenir "off" para no sugerir datos de un turno anterior, pero eso
   * es una decisión por campo, no algo para forzar en todos los inputs.
   */
  autoComplete?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const FormInput = <T extends FieldValues>({
  required = true,
  ...props
}: FormInputProps<T>) => {
  const { control } = useFormContext<T>();
  const { id, handleInputChange } = useInput({
    mode: props.mode,
    name: props.name,
  });

  const descriptionId = props.description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;
  const resolvedType = resolveType(props.type, props.mode);

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange, ...field }, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={props.formInputClassname}
        >
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

          <div className="relative">
            {props.startIcon && (
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                {props.startIcon}
              </span>
            )}
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                [descriptionId, fieldState.error ? errorId : undefined]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              aria-required={required}
              autoComplete={props.autoComplete}
              autoFocus={props.autoFocus}
              className={[
                "h-10 truncate px-3 text-base",
                props.startIcon ? "pl-9" : "",
                props.endIcon ? "pr-9" : "",
              ].join(" ")}
              disabled={props.disabled}
              id={id}
              inputMode={props.mode}
              max={props.max}
              maxLength={props.maxLength}
              min={props.min}
              minLength={props.minLength}
              onChange={(e) => handleInputChange(e, onChange)}
              placeholder={props.placeholder}
              readOnly={props.readOnly}
              step={props.step}
              type={resolvedType}
            />
            {props.endIcon && (
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
                {props.endIcon}
              </span>
            )}
          </div>

          {fieldState.error?.message && (
            <FieldError id={errorId}>{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  );
};

export { FormInput };
