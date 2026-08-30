import { z } from "zod";
import { USER_ROLES } from "@/features/users/types/users.types";

export const USER_SCHEMA_ERROR_MESSAGES = {
  name: {
    min: "El nombre debe tener al menos 2 caracteres",
    max: "El nombre no puede superar los 200 caracteres",
  },
  email: {
    invalid: "Ingresa un correo válido",
    repeated: "Este correo ya existe",
  },
  password: {
    min: "La contraseña debe tener al menos 8 caracteres",
    max: "La contraseña no puede superar los 72 caracteres",
  },
  role: {
    invalid: "Selecciona un rol válido",
  },
};

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, USER_SCHEMA_ERROR_MESSAGES.name.min)
    .max(200, USER_SCHEMA_ERROR_MESSAGES.name.max),
  email: z
    .string()
    .trim()
    .pipe(z.email(USER_SCHEMA_ERROR_MESSAGES.email.invalid)),
  password: z
    .string()
    .min(8, USER_SCHEMA_ERROR_MESSAGES.password.min)
    .max(72, USER_SCHEMA_ERROR_MESSAGES.password.max),
  role: z.enum(USER_ROLES, {
    message: USER_SCHEMA_ERROR_MESSAGES.role.invalid,
  }),
});

export type UserPayload = z.infer<typeof userSchema>;
