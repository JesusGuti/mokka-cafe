import { test as setup } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "./utils/auth";

/**
 * Corre una vez antes de los proyectos de browser (ver `dependencies` en
 * playwright.config.ts) y guarda el storageState (incluye localStorage,
 * donde vive el accessToken de zustand) para que el resto de los tests
 * arranquen ya autenticados como ADMIN, sin repetir el login en cada uno.
 * Necesario desde que `AuthGate` gatea `(dashboard)` y el backend exige un
 * JWT real vía `JwtAuthGuard`/`RolesGuard` (ver PLAN_auth_session_hardening.md).
 */
setup("autenticarse como admin", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("textbox", { name: "Correo" }).fill("admin@mokka.local");
  await page.locator('input[type="password"]').fill("mokka123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.waitForURL("/pos");

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
