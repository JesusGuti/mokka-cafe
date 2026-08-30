import { FormInput, type FormInputProps } from "./form-input";
import { useState } from "react";
import { type FieldValues } from "react-hook-form";
import { Button } from "../ui/button";
import { Eye, EyeClosed } from "lucide-react";

type FormPasswordInputProps<T extends FieldValues> = Omit<
  FormInputProps<T>,
  "type" | "endIcon" | "mode"
>;

export const FormPasswordInput = <T extends FieldValues>({
  required = true,
  autoComplete = "off",
  ...props
}: FormPasswordInputProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  return (
    <FormInput
      {...props}
      type={isPasswordVisible ? "text" : "password"}
      mode="none"
      required={required}
      autoComplete={autoComplete}
      endIcon={
        <Button
          aria-label={
            isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          aria-pressed={isPasswordVisible}
          onClick={() => setIsPasswordVisible((prev) => !prev)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isPasswordVisible ? <EyeClosed /> : <Eye />}
        </Button>
      }
    />
  );
};
