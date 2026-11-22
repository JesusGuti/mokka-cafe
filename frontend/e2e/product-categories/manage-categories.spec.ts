import { test, expect } from "@playwright/test";
import { BACKEND_URL, isBackendReachable } from "../utils/backend";
import {
  PRODUCT_CATEGORIES_PATH,
  categoryNameCell,
  categoryRow,
  createCategoryDialog,
  deleteCategoryDialog,
  editCategoryDialog,
  openCreateCategoryDialog,
  uniqueCategoryName,
} from "./product-categories-utils";

/**
 * Un solo recorrido de punta a punta: crear, duplicado, editar y eliminar.
 * No repite la validación de campos ni los estados del diálogo (ya cubiertos en
 * los specs de componentes y en el e2e del backend). Lo que aporta: la ruta
 * real, el contrato real con el backend (mensaje del 409, el `PATCH` y el
 * `DELETE`) y el foco del campo tras crear (AC-1.13).
 *
 * Con 3 browsers en paralelo contra la misma base, el recorrido crea una sola
 * categoría y la elimina al final, para que la tabla (10 filas por página)
 * nunca tenga más de unas pocas filas de este archivo.
 */
test("un admin crea, edita y elimina una categoría de punta a punta", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  const name = uniqueCategoryName("E2E Bebidas");
  const renamed = `${name} editada`;

  await page.goto(PRODUCT_CATEGORIES_PATH);

  await test.step("la pantalla se muestra en su ruta con el título del menú", async () => {
    await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Nueva categoría" }),
    ).toBeVisible();
  });

  const createDialog = createCategoryDialog(page);
  const nameInput = createDialog.getByRole("textbox", { name: "Nombre" });

  await test.step("crea la categoría y el diálogo sigue abierto, vacío y con el foco", async () => {
    await openCreateCategoryDialog(page);
    await nameInput.fill(name);
    await createDialog.getByRole("button", { name: "Crear categoría" }).click();

    await expect(page.getByText(`«${name}» creada`)).toBeVisible();
    await expect(createDialog).toBeVisible();
    await expect(nameInput).toHaveValue("");
    await expect(nameInput).toBeFocused();
  });

  await test.step("rechaza el mismo nombre con otras mayúsculas con el mensaje del backend", async () => {
    await nameInput.fill(name.toUpperCase());
    await createDialog.getByRole("button", { name: "Crear categoría" }).click();

    await expect(
      createDialog.getByText("Ya existe una categoría con ese nombre"),
    ).toBeVisible();
    await expect(nameInput).toHaveAttribute("aria-invalid", "true");

    // Sin texto no hay cambios que descartar: cierra directo.
    await nameInput.clear();
    await createDialog.getByRole("button", { name: "Cerrar" }).click();
    await expect(createDialog).toBeHidden();
  });

  await test.step("la categoría aparece en la lista sin productos", async () => {
    await expect(categoryNameCell(page, name)).toBeVisible();
    // Segunda celda: cantidad de productos.
    await expect(categoryRow(page, name).getByRole("cell").nth(1)).toHaveText(
      "0",
    );
  });

  await test.step("la edita y la lista muestra el nuevo nombre", async () => {
    await categoryRow(page, name)
      .getByRole("button", { name: `Editar ${name}` })
      .click();

    const dialog = editCategoryDialog(page);
    const editInput = dialog.getByRole("textbox", { name: "Nombre" });
    await expect(editInput).toHaveValue(name);

    await editInput.fill(renamed);
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page.getByText(`«${renamed}» actualizada`)).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(categoryNameCell(page, renamed)).toBeVisible();
    await expect(categoryNameCell(page, name)).toHaveCount(0);
  });

  await test.step("la elimina tras confirmar y desaparece de la lista", async () => {
    await categoryRow(page, renamed)
      .getByRole("button", { name: `Eliminar ${renamed}` })
      .click();

    const dialog = deleteCategoryDialog(page);
    await expect(
      dialog.getByText(
        `¿Eliminar «${renamed}»? Esta acción no se puede deshacer.`,
      ),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Eliminar categoría" }).click();

    await expect(page.getByText(`«${renamed}» eliminada`)).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(categoryNameCell(page, renamed)).toHaveCount(0);
  });
});
