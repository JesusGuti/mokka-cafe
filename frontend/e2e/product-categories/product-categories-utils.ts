import type { Page } from "@playwright/test";

export const PRODUCT_CATEGORIES_PATH = "/catalogo/categorias";

/**
 * Nombre único por llamada. Los proyectos de browser (chromium, firefox,
 * webkit) corren en paralelo contra la misma base de test y los nombres de
 * categoría son únicos sin importar mayúsculas, así que dos tests no pueden
 * compartir un nombre. Máximo 50 caracteres (límite del campo): usar prefijos
 * cortos.
 */
export const uniqueCategoryName = (prefix: string) =>
  `${prefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const openCreateCategoryDialog = async (page: Page) => {
  await page.getByRole("button", { name: "Nueva categoría" }).click();
};

/**
 * El Toast de Base UI también usa role="dialog" (aria-modal="false"), así que
 * los diálogos se ubican siempre por su nombre accesible.
 */
export const createCategoryDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Nueva categoría" });

export const editCategoryDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Editar categoría" });

export const deleteCategoryDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Eliminar categoría" });

/**
 * Celda con el nombre EXACTO. No se puede buscar la fila por texto parcial:
 * "Calientes" también coincidiría con "Calientes editada".
 */
export const categoryNameCell = (page: Page, name: string) =>
  page.getByRole("cell", { name, exact: true });

export const categoryRow = (page: Page, name: string) =>
  page.getByRole("row").filter({ has: categoryNameCell(page, name) });
