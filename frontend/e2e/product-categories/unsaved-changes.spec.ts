import { test, expect } from "@playwright/test";
import {
  PRODUCT_CATEGORIES_PATH,
  createCategoryDialog,
  openCreateCategoryDialog,
} from "./product-categories-utils";

/**
 * Comportamiento de teclado del diálogo de crear (AC-1.12). No se puede
 * comprobar en jsdom (Base UI no cierra con Esc de forma fiable en los tests
 * de componentes), por eso vive en Playwright. Nada de esto guarda datos: no
 * necesita que el backend acepte escrituras, solo que cargue la página.
 */
test.describe("cerrar el diálogo de nueva categoría con cambios sin guardar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_CATEGORIES_PATH);
    await openCreateCategoryDialog(page);
  });

  test("Esc con texto escrito pide confirmar y un segundo Esc lo descarta", async ({
    page,
  }) => {
    const dialog = createCategoryDialog(page);
    await dialog
      .getByRole("textbox", { name: "Nombre" })
      .fill("Categoría sin guardar");

    await page.keyboard.press("Escape");

    await expect(dialog.getByRole("alert")).toContainText(
      "Tienes cambios sin guardar",
    );
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
  });

  test("«Seguir editando» vuelve al formulario con lo escrito", async ({
    page,
  }) => {
    const dialog = createCategoryDialog(page);
    const nameInput = dialog.getByRole("textbox", { name: "Nombre" });
    await nameInput.fill("Categoría sin guardar");
    await page.keyboard.press("Escape");

    await dialog.getByRole("button", { name: "Seguir editando" }).click();

    await expect(dialog.getByRole("alert")).toBeHidden();
    await expect(nameInput).toHaveValue("Categoría sin guardar");
  });

  test("Esc sin texto cierra directo, sin aviso", async ({ page }) => {
    const dialog = createCategoryDialog(page);

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
  });
});
