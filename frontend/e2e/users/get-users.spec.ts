import { test, expect } from "@playwright/test";
import { BACKEND_URL, isBackendReachable } from "../utils/backend";
import { fillStable } from "../utils/fill-stable";
import {
  createManyUsers,
  createUser,
  expectUserCreatedToast,
  facetedFilterButton,
} from "./users-utils";

test("la pantalla de usuarios muestra una tabla", async ({ page }) => {
  await page.goto("/usuarios");

  await expect(page.getByRole("table")).toBeVisible();
});

test("la tabla muestra las columnas Nombre, Correo, Rol, Estado y Creado", async ({
  page,
}) => {
  await page.goto("/usuarios");

  await expect(
    page.getByRole("columnheader", { name: "Nombre" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Correo" }),
  ).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Rol" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Estado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Creado" }),
  ).toBeVisible();
});

test("la pantalla de usuarios muestra una tabla con usuarios reales traidos del backend", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const email = `e2e-${Date.now()}@mokka.cafe`;
  await createUser(page, { email });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, email);
  await expect(page.getByRole("cell", { name: email })).toBeVisible();
});

test("la tabla muestra un estado de carga (skeleton) mientras se obtienen los usuarios", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.route("**/users", async (route) => {
    if (route.request().method() === "GET") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    await route.continue();
  });

  await page.goto("/usuarios");

  // Los skeleton no tiene rol ARIA semantico, se deben buscar por el atributo data-slot="skeleton" que se le asigna en el componente Skeleton.
  const skeletonRows = page.locator('[data-slot="skeleton"]');
  await expect(skeletonRows.first()).toBeVisible();
});

test('la tabla muestra "No hay usuarios registrados." cuando no hay resultados', async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(
    searchBox,
    "no-existe-ningun-usuario-con-este-nombre-o-correo",
  );
  await expect(
    page.getByRole("cell", { name: "No hay usuarios registrados." }),
  ).toBeVisible();
});

test("filtrar por nombre en el buscador muestra solo los usuarios que coinciden", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const name1 = `John Doe ${suffix}`;
  const name2 = `John Lennon ${suffix}`;

  await createUser(page, { name: name1 });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  await createUser(page, { name: name2 });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, "john");

  await expect(
    page.getByRole("row", { name: new RegExp(name1) }),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: new RegExp(name2) }),
  ).toBeVisible();
});

test("filtrar por correo en el buscador muestra solo los usuarios que coinciden", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  // Emails únicos por corrida: contra un backend real y persistente, un
  // literal fijo choca (409) en la segunda ejecución del test.
  const suffix = Date.now();
  const email1 = `john.doe-${suffix}@example.com`;
  const email2 = `john.lennon-${suffix}@example.com`;

  await createUser(page, { email: email1 });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  await createUser(page, { email: email2 });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, "john");

  await expect(
    page.getByRole("row", { name: new RegExp(email1) }),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: new RegExp(email2) }),
  ).toBeVisible();
});

test("el filtro de Rol muestra solo usuarios con el rol seleccionado", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const mesero = `Rol-Mesero-${suffix}`;
  const cajero = `Rol-Cajero-${suffix}`;

  await createUser(page, { name: mesero });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  await createUser(page, { name: cajero, role: "Cajero" });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  await facetedFilterButton(page, "Rol").click();
  await page.getByRole("menuitemcheckbox", { name: "Cajero" }).click();
  await page.keyboard.press("Escape");

  await expect(
    page.getByRole("row", { name: new RegExp(cajero) }),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: new RegExp(mesero) }),
  ).not.toBeVisible();
});

test("se pueden combinar el filtro de Rol y el de Estado", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const name = `Combo-${suffix}`;

  await createUser(page, { name, role: "Cajero" });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  await facetedFilterButton(page, "Rol").click();
  await page.getByRole("menuitemcheckbox", { name: "Cajero" }).click();
  await page.keyboard.press("Escape");

  await facetedFilterButton(page, "Estado").click();
  // exact: true — "Activo" es substring de "Inactivo", así que sin esto
  // matchea ambos items.
  await page.getByRole("menuitemcheckbox", { name: "Activo", exact: true }).click();
  await page.keyboard.press("Escape");

  // Todo usuario nuevo se crea activo, así que Rol=Cajero + Estado=Activo
  // debe seguir mostrándolo.
  await expect(
    page.getByRole("row", { name: new RegExp(name) }),
  ).toBeVisible();

  await facetedFilterButton(page, "Estado").click();
  // exact: true — "Activo" es substring de "Inactivo", así que sin esto
  // matchea ambos items.
  await page.getByRole("menuitemcheckbox", { name: "Activo", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Inactivo" }).click();
  await page.keyboard.press("Escape");

  // Con Rol=Cajero + Estado=Inactivo ya no debería aparecer (el usuario es activo).
  await expect(
    page.getByRole("row", { name: new RegExp(name) }),
  ).not.toBeVisible();
});

test("el filtro de Estado muestra solo usuarios activos o inactivos según lo seleccionado", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const name = `Estado-${suffix}`;
  // El formulario de alta no permite crear usuarios inactivos: se prueban
  // ambos lados del filtro contra este único usuario, que sabemos activo.
  await createUser(page, { name });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  await facetedFilterButton(page, "Estado").click();
  await page.getByRole("menuitemcheckbox", { name: "Inactivo" }).click();
  await page.keyboard.press("Escape");

  await expect(
    page.getByRole("row", { name: new RegExp(name) }),
  ).not.toBeVisible();

  await facetedFilterButton(page, "Estado").click();
  await page.getByRole("menuitemcheckbox", { name: "Inactivo" }).click();
  // exact: true — "Activo" es substring de "Inactivo", así que sin esto
  // matchea ambos items.
  await page.getByRole("menuitemcheckbox", { name: "Activo", exact: true }).click();
  await page.keyboard.press("Escape");

  await expect(
    page.getByRole("row", { name: new RegExp(name) }),
  ).toBeVisible();
});

test('el botón "Limpiar" solo aparece cuando hay filtros aplicados', async ({
  page,
}) => {
  await page.goto("/usuarios");

  await expect(
    page.getByRole("button", { name: "Limpiar" }),
  ).not.toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, "cualquier-texto");

  await expect(page.getByRole("button", { name: "Limpiar" })).toBeVisible();

  await fillStable(searchBox, "");

  await expect(
    page.getByRole("button", { name: "Limpiar" }),
  ).not.toBeVisible();
});

test('el botón "Limpiar" resetea la búsqueda y los filtros de Rol/Estado', async ({
  page,
}) => {
  await page.goto("/usuarios");

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, "cualquier-texto");

  await facetedFilterButton(page, "Rol").click();
  await page.getByRole("menuitemcheckbox", { name: "Cajero" }).click();
  await page.keyboard.press("Escape");

  await facetedFilterButton(page, "Estado").click();
  // exact: true — "Activo" es substring de "Inactivo", así que sin esto
  // matchea ambos items.
  await page.getByRole("menuitemcheckbox", { name: "Activo", exact: true }).click();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Limpiar" }).click();

  await expect(searchBox).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Limpiar" }),
  ).not.toBeVisible();
  await expect(facetedFilterButton(page, "Rol").getByText("1")).toHaveCount(0);
  await expect(
    facetedFilterButton(page, "Estado").getByText("1"),
  ).toHaveCount(0);
});

test('hacer clic en el encabezado "Nombre" ordena la tabla alfabéticamente', async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const nameA = `Zzz-A-${suffix}`;
  const nameB = `Zzz-B-${suffix}`;
  const nameC = `Zzz-C-${suffix}`;

  await createUser(page, { name: nameC });
  await expect(expectUserCreatedToast(page)).toBeVisible();
  await createUser(page, { name: nameA });
  await expect(expectUserCreatedToast(page)).toBeVisible();
  await createUser(page, { name: nameB });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  const rows = page.getByRole("row").filter({ hasText: String(suffix) });
  await expect(rows).toHaveCount(3);

  await page.getByRole("button", { name: "Nombre" }).click();
  const firstClickOrder = await rows.allTextContents();

  await page.getByRole("button", { name: "Nombre" }).click();
  const secondClickOrder = await rows.allTextContents();

  // No sabemos si el primer click ordena asc o desc, pero el segundo debe
  // invertir exactamente el orden del primero...
  expect(secondClickOrder).toEqual([...firstClickOrder].reverse());

  // ...y uno de los dos debe ser el alfabético ascendente real (A, B, C).
  const isAlphabetical = (order: string[]) =>
    order[0].includes(nameA) && order[1].includes(nameB) && order[2].includes(nameC);
  expect(isAlphabetical(firstClickOrder) || isAlphabetical(secondClickOrder)).toBe(
    true,
  );
});

test('hacer clic en el encabezado "Creado" ordena por fecha de creación', async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const first = `Creado-1-${suffix}`;
  const second = `Creado-2-${suffix}`;
  const third = `Creado-3-${suffix}`;

  await createUser(page, { name: first });
  await expect(expectUserCreatedToast(page)).toBeVisible();
  await createUser(page, { name: second });
  await expect(expectUserCreatedToast(page)).toBeVisible();
  await createUser(page, { name: third });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  const rows = page.getByRole("row").filter({ hasText: String(suffix) });
  await expect(rows).toHaveCount(3);

  await page.getByRole("button", { name: "Creado" }).click();
  const firstClickOrder = await rows.allTextContents();

  await page.getByRole("button", { name: "Creado" }).click();
  const secondClickOrder = await rows.allTextContents();

  expect(secondClickOrder).toEqual([...firstClickOrder].reverse());

  // Uno de los dos debe respetar el orden real de creación (1, 2, 3).
  const isCreationOrder = (order: string[]) =>
    order[0].includes(first) && order[1].includes(second) && order[2].includes(third);
  expect(
    isCreationOrder(firstClickOrder) || isCreationOrder(secondClickOrder),
  ).toBe(true);
});

test('la paginación muestra el texto "N-M de X" acorde a los datos', async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  await createManyUsers(page, `Res-${suffix}`, 2);

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  await expect(page.getByText("1-2 de 2")).toBeVisible();
});

test('cambiar "Filas por página" actualiza la cantidad de filas mostradas', async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);
  // Crea 11 usuarios para forzar 2 páginas con el pageSize por defecto (10).
  test.slow();

  await page.goto("/usuarios");

  const suffix = Date.now();
  await createManyUsers(page, `Filas-${suffix}`, 11);

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  const rows = page.getByRole("row").filter({ hasText: String(suffix) });
  await expect(rows).toHaveCount(10);
  await expect(page.getByText("1-10 de 11")).toBeVisible();

  // El select de "Filas por página" no tiene un nombre accesible propio
  // (el texto adyacente no está asociado con <label htmlFor>), así que se
  // ubica por el data-slot que ya usa el componente shadcn.
  await page.locator('[data-slot="select-trigger"]').click();
  await page.getByRole("option", { name: "20" }).click();

  await expect(rows).toHaveCount(11);
  await expect(page.getByText("1-11 de 11")).toBeVisible();
});

test('los botones "Página siguiente"/"Página anterior" navegan entre páginas', async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);
  test.slow();

  await page.goto("/usuarios");

  const suffix = Date.now();
  await createManyUsers(page, `Next-${suffix}`, 11);

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  const rows = page.getByRole("row").filter({ hasText: String(suffix) });
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  await expect(rows).toHaveCount(10);
  const page1Texts = await rows.allTextContents();

  await page.getByRole("button", { name: "Página siguiente" }).click();

  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(rows).toHaveCount(1);
  const page2Texts = await rows.allTextContents();
  expect(page2Texts).not.toEqual(page1Texts);

  await page.getByRole("button", { name: "Página anterior" }).click();

  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  expect(await rows.allTextContents()).toEqual(page1Texts);
});

test('los botones "Primera página"/"Última página" saltan a los extremos', async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);
  test.slow();

  await page.goto("/usuarios");

  const suffix = Date.now();
  await createManyUsers(page, `Last-${suffix}`, 11);

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  const rows = page.getByRole("row").filter({ hasText: String(suffix) });
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  const firstPageTexts = await rows.allTextContents();

  await page.getByRole("button", { name: "Última página" }).click();

  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(rows).toHaveCount(1);

  await page.getByRole("button", { name: "Primera página" }).click();

  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  expect(await rows.allTextContents()).toEqual(firstPageTexts);
});

test("los botones de paginación se deshabilitan en los límites (primera/última página)", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);
  test.slow();

  await page.goto("/usuarios");

  const suffix = Date.now();
  await createManyUsers(page, `Bounds-${suffix}`, 11);

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Primera página" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Página anterior" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Página siguiente" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Última página" }),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Última página" }).click();

  await expect(page.getByText("Página 2 de 2")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Página siguiente" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Última página" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Primera página" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Página anterior" }),
  ).toBeEnabled();
});

test("crear un usuario contra el backend real y verlo aparecer en la tabla", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const name = `Nuevo-${suffix}`;
  const email = `nuevo-${suffix}@mokka.cafe`;

  await createUser(page, { name, email, role: "Administrador" });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, email);

  const row = page.getByRole("row", { name: new RegExp(email) });
  await expect(row).toBeVisible();
  // exact: true evita que "Nuevo-..." matchee por substring (case-insensitive)
  // dentro de la celda de correo "nuevo-...@mokka.cafe".
  await expect(row.getByText(name, { exact: true })).toBeVisible();
  await expect(row.getByText(email, { exact: true })).toBeVisible();
  await expect(row.getByText("Administrador")).toBeVisible();
  await expect(row.getByText("Activo")).toBeVisible();
});

test("un usuario nuevo aparece correctamente ordenado/paginado tras crearse", async ({
  page,
}) => {
  const reachable = await isBackendReachable();
  // NOSONAR: skip condicional, no un test abandonado — red de seguridad
  // por si el backend de test (BACKEND_URL) no llegó a levantar en este
  // run, no un skip esperado en el día a día (ver e2e/utils/backend.ts).
  test.skip(!reachable, `El backend no responde en ${BACKEND_URL}`);

  await page.goto("/usuarios");

  const suffix = Date.now();
  const older = `Orden-Viejo-${suffix}`;
  const newer = `Orden-Nuevo-${suffix}`;

  await createUser(page, { name: older });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  await createUser(page, { name: newer });
  await expect(expectUserCreatedToast(page)).toBeVisible();

  const searchBox = page.getByRole("textbox", { name: "Buscar" });
  await fillStable(searchBox, String(suffix));

  const rows = page.getByRole("row").filter({ hasText: String(suffix) });
  await expect(rows).toHaveCount(2);

  await page.getByRole("button", { name: "Creado" }).click();
  let rowsText = await rows.allTextContents();

  if (!rowsText[0].includes(newer)) {
    // El primer click dejó el orden ascendente (más viejo primero); el
    // segundo lo invierte a descendente (más nuevo primero).
    await page.getByRole("button", { name: "Creado" }).click();
    rowsText = await rows.allTextContents();
  }

  expect(rowsText[0]).toContain(newer);
  expect(rowsText[1]).toContain(older);
});
