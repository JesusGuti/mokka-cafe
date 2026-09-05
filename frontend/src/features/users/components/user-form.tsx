"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { FieldError } from "@/shared/components/ui/field";
import { FormDialog } from "@/shared/components/form/form-dialog";
import { FormInput } from "@/shared/components/form/form-input";
import { FormPasswordInput } from "@/shared/components/form/form-password-input";
import { FormSelect } from "@/shared/components/form/form-select";
import type { ApiErrorResponse } from "@/shared/types/api-error";
import { showToast } from "@/shared/lib/toast";
import { SelectOption } from "@/shared/types/select";
import { useCreateUser } from "../hooks/use-create-user";
import { UserPayload, userSchema } from "../schemas/users.schema";
import { USER_ROLE_LABELS, USER_ROLES } from "../types/users.types";
import { AxiosError, HttpStatusCode } from "axios";
import { useForm } from "react-hook-form";
import { UserRoundPlus } from "lucide-react";

const USER_CREATED_MESSAGE = "Usuario creado correctamente.";

const USER_FORM_DIALOG = {
  cancelLabel: "Cancelar",
  confirmLabel: "Crear usuario",
  description:
    "Completa los datos para dar de alta un nuevo usuario del sistema.",
  submitingLabel: "Creando usuario...",
  title: "Crear usuario",
  triggerLabel: "Nuevo usuario",
};

const USER_FORM_FIELDS = {
  name: { label: "Nombre", placeholder: "Ej. Juan Pérez" },
  email: { label: "Correo", placeholder: "correo@mokka.com" },
  password: { label: "Contraseña", placeholder: "Mínimo 8 caracteres" },
  role: { label: "Rol", placeholder: "Selecciona un rol" },
};

const NO_AUTHORIZED = "Usted no puede crear un usuario.";
const GENERIC_ERROR_MESSAGE = "No se pudo crear el usuario. Intenta de nuevo.";

const getErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
  if (error.response?.status === HttpStatusCode.Unauthorized) {
    return NO_AUTHORIZED;
  }

  const message = error.response?.data.message;
  if (!message) return GENERIC_ERROR_MESSAGE;
  return Array.isArray(message) ? message[0] : message;
};

/**
 * El 409 de email duplicado es el único error de creación que apunta a un
 * campo concreto; el resto (401, errores genéricos) no tiene un campo al
 * que "culpar", así que se quedan en el error root del form.
 */
const isDuplicatedEmailError = (error: AxiosError<ApiErrorResponse>) =>
  error.response?.status === HttpStatusCode.Conflict;

export const UserForm = () => {
  const { mutate } = useCreateUser();

  const form = useForm<UserPayload>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: USER_ROLES[0],
    },
  });

  const onConfirm = () => {
    form.clearErrors("root");
    form.clearErrors("email");
    const data = form.getValues();

    return new Promise<void>((resolve, reject) => {
      mutate(data, {
        onSuccess: () => {
          showToast(USER_CREATED_MESSAGE, "success");
          resolve();
        },
        onError: (error) => {
          const message = getErrorMessage(error);
          if (isDuplicatedEmailError(error)) {
            form.setError("email", { message });
          } else {
            form.setError("root", { message });
          }
          showToast(message, "error");
          reject(error);
        },
      });
    });
  };

  return (
    <FormDialog
      cancelLabel={USER_FORM_DIALOG.cancelLabel}
      confirmLabel={USER_FORM_DIALOG.confirmLabel}
      description={USER_FORM_DIALOG.description}
      form={form}
      onConfirm={onConfirm}
      submitingLabel={USER_FORM_DIALOG.submitingLabel}
      title={USER_FORM_DIALOG.title}
      trigger={
        <Button>
          <UserRoundPlus />
          {USER_FORM_DIALOG.triggerLabel}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <FormInput<UserPayload>
          name="name"
          label={USER_FORM_FIELDS.name.label}
          placeholder={USER_FORM_FIELDS.name.placeholder}
          type="text"
          mode="text"
          autoComplete="name"
          autoFocus
        />
        <FormInput<UserPayload>
          name="email"
          label={USER_FORM_FIELDS.email.label}
          placeholder={USER_FORM_FIELDS.email.placeholder}
          type="email"
          mode="email"
          autoComplete="email"
        />
        <FormPasswordInput<UserPayload>
          name="password"
          label={USER_FORM_FIELDS.password.label}
          placeholder={USER_FORM_FIELDS.password.placeholder}
          autoComplete="new-password"
        />
        <FormSelect<UserPayload>
          name="role"
          label={USER_FORM_FIELDS.role.label}
          placeholder={USER_FORM_FIELDS.role.placeholder}
          options={USER_ROLES.map(
            (role): SelectOption => ({
              label: USER_ROLE_LABELS[role],
              value: role,
            }),
          )}
        />

        {form.formState.errors.root?.message && (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        )}
      </div>
    </FormDialog>
  );
};
