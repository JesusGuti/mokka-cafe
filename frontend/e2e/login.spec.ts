import { test, expect } from "@playwright/test";

/**
 * No repetimos acá la validación de zod (ya está cubierta a nivel de
 * componente en loginForm.spec.tsx con mocks, sin red real). Lo que un
 * test e2e aporta que Vitest no puede es: rutas reales, fuentes/imágenes
 * reales, y la integración real contra el backend — eso es lo que se
 * prueba en este archivo.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const isBackendReachable = async () => {
  try {
    await fetch(BACKEND_URL, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
};

test("la pantalla de login renderiza correctamente en un browser real", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(page).toHaveTitle(/Mokka Café/);
  await expect(
    page.getByRole("heading", { name: "Inicia sesión" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Correo" })).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
});

test("muestra un mensaje genérico con credenciales inexistentes", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — depende de
  // infraestructura externa (backend real en BACKEND_URL) que hoy no
  // corre en el workflow de CI. Se saltea con motivo explícito en vez
  // de fallar en rojo cada vez que no está levantado.
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/login");

  await page
    .getByRole("textbox", { name: "Correo" })
    .fill("usuario-que-no-existe@mokka.cafe");
  await page
    .getByLabel("Contraseña", { exact: false })
    .fill("cualquier-password");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(
    page.getByText("El correo electrónico o la contraseña no son correctos"),
  ).toBeVisible();
});
