import { z } from "zod";

/**
 * Espeja backend/src/modules/auth/infrastructure/http/dto/sign-in.dto.ts —
 * si cambia el DTO del backend, revisar este schema también.
 */
export const signInSchema = z.object({
  email: z.email("Ingresá un correo válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type SignInPayload = z.infer<typeof signInSchema>;
