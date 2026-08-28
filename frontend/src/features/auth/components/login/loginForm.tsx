"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { HttpStatusCode, type AxiosError } from "axios";
import { Form } from "@/shared/components/form/form";
import { FormInput } from "@/shared/components/form/form-input";
import { Button } from "@/shared/components/ui/button";
import { FieldError } from "@/shared/components/ui/field";
import { useSignIn } from "@/features/auth/hooks/use-sign-in";
import {
  signInSchema,
  type SignInPayload,
} from "@/features/auth/schemas/sign-in.schema";
import type { ApiErrorResponse } from "@/shared/types/api-error";

const INVALID_CREDENTIALS_MESSAGE =
  "El correo electrónico o la contraseña no son correctos";
const GENERIC_ERROR_MESSAGE = "No pudimos iniciar sesión. Intentá de nuevo.";

const getErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
  if (error.response?.status === HttpStatusCode.Unauthorized) {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  const message = error.response?.data.message;
  if (!message) return GENERIC_ERROR_MESSAGE;
  return Array.isArray(message) ? message[0] : message;
};

export const LoginForm = () => {
  const router = useRouter();
  const { mutate, isPending } = useSignIn();

  const form = useForm<SignInPayload>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: SignInPayload) => {
    form.clearErrors("root");
    mutate(data, {
      onSuccess: () => router.push("/pos"),
      onError: (error) => {
        form.setError("root", { message: getErrorMessage(error) });
      },
    });
  };

  return (
    <section className="flex flex-col p-8">
      <Image
        alt="mokka-wordmark"
        className="object-cover self-start"
        height={40}
        src="/brand/logo-wordmark.webp"
        width={140}
      />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-3xl font-medium text-primary">
              Inicia sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de gestión interno de Mokka Café
            </p>
          </div>

          <Form
            form={form}
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-4"
          >
            <FormInput<SignInPayload>
              name="email"
              label="Correo"
              type="email"
              mode="email"
              autoComplete="email"
              autoFocus
            />
            <FormInput<SignInPayload>
              name="password"
              label="Contraseña"
              type="password"
              mode="none"
              autoComplete="current-password"
            />

            {form.formState.errors.root?.message && (
              <FieldError>{form.formState.errors.root.message}</FieldError>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Ingresando..." : "Ingresar"}
            </Button>
          </Form>
        </div>
      </div>
    </section>
  );
};
