import { test, expect } from "@playwright/test";
import { createUser } from "./users-utils";
import { BACKEND_URL, isBackendReachable } from "../utils/backend";

/**
 * No repetimos acá la validación de zod ni el manejo de estados del
 * FormDialog (ya cubiertos con mocks en user.form.spec.tsx y
 * form-dialog.spec.tsx). Lo que aporta este archivo: rutas reales, el
 * header dinámico del layout, y la integración real contra el backend
 * (creación exitosa y el 409 de email duplicado). Ver login.spec.ts.
 */

test("la pantalla de usuarios renderiza correctamente en un browser real", async ({
  page,
}) => {
  await page.goto("/usuarios");

  await expect(page).toHaveTitle(/Mokka Café/);
  await expect(page.getByRole("heading", { name: "Usuarios" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Nuevo usuario" }),
  ).toBeVisible();
});

test("crea un usuario contra el backend real y muestra el toast de éxito", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");
  await createUser(page);

  await expect(page.getByText("Usuario creado correctamente.")).toBeVisible();
  // El Toast de Base UI también usa role="dialog" (aria-modal="false"),
  // así que hay que apuntar al FormDialog por su nombre accesible.
  await expect(
    page.getByRole("dialog", { name: "Crear usuario" }),
  ).not.toBeVisible();
});

test("muestra el email duplicado del backend en el campo Correo", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");
  const duplicatedEmail = `e2e-duplicado-${Date.now()}@mokka.cafe`;

  await createUser(page, {
    name: "Usuario Uno",
    email: duplicatedEmail,
    password: "password123",
  });
  await expect(page.getByText("Usuario creado correctamente.")).toBeVisible();

  await createUser(page, {
    name: "Usuario Dos",
    email: duplicatedEmail,
    password: "password123",
  });

  const dialog = page.getByRole("dialog", { name: "Crear usuario" });
  const emailInput = dialog.getByRole("textbox", { name: "Correo" });

  await expect(dialog.getByText("El email ya está en uso")).toBeVisible();
  await expect(emailInput).toHaveAttribute("aria-invalid", "true");
});
