type UserRoleLabel = "Mesero" | "Cajero" | "Administrador";

type CreateUserFormData = {
  name: string;
  email: string;
  password: string;
  role?: UserRoleLabel;
};

export const openCreateUserForm = async (
  page: import("@playwright/test").Page,
) => {
  await page.getByRole("button", { name: "Nuevo usuario" }).click();
};

/**
 * El botón "Nuevo usuario creado" puede quedar apilado con toasts previos
 * que todavía no se cerraron (varias creaciones seguidas en el mismo test),
 * así que `getByText(...)` sin más matchea más de un elemento. `.last()`
 * evita el "strict mode violation" sin importar cuál de los dos matchee.
 */
export const expectUserCreatedToast = (page: import("@playwright/test").Page) =>
  page.getByText("Usuario creado correctamente.").last();

/**
 * Localiza el botón que abre un `DataTableFacetedFilter` (Rol, Estado) por
 * su título. No se puede usar `getByRole("button", { name: title })` a
 * secas: el encabezado de columna ordenable tiene el mismo texto ("Rol",
 * "Estado") y también es un botón, así que el nombre accesible queda
 * ambiguo. Los triggers de filtro son los únicos botones con
 * `aria-haspopup="menu"`, así que ese atributo los distingue.
 */
export const facetedFilterButton = (
  page: import("@playwright/test").Page,
  title: string,
) => page.locator('button[aria-haspopup="menu"]', { hasText: title });

export const createUser = async (
  page: import("@playwright/test").Page,
  data: Partial<CreateUserFormData> = {},
) => {
  const userData = {
    name: "Usuario E2E",
    email: `e2e-${Date.now()}@mokka.cafe`,
    password: "password123",
    ...data,
  };
  await openCreateUserForm(page);

  await page.getByRole("textbox", { name: "Nombre" }).fill(userData.name);
  await page.getByRole("textbox", { name: "Correo" }).fill(userData.email);
  await page
    .getByRole("textbox", { name: "Contraseña" })
    .fill(userData.password);

  // El rol ya viene con "Mesero" seleccionado por defaultValues, no hace
  // falta abrir el select salvo que se pida uno distinto.
  if (userData.role && userData.role !== "Mesero") {
    await page.getByRole("combobox", { name: "Rol" }).click();
    await page.getByRole("option", { name: userData.role }).click();
  }

  await page.getByRole("button", { name: "Crear usuario" }).click();
};

/**
 * Crea `count` usuarios secuenciales con nombres `${namePrefix}-1`,
 * `${namePrefix}-2`, etc. Útil para forzar más de una página (pageSize=10)
 * en los tests de paginación. Devuelve los nombres creados, en orden.
 */
export const createManyUsers = async (
  page: import("@playwright/test").Page,
  namePrefix: string,
  count: number,
) => {
  const names: string[] = [];
  for (let i = 1; i <= count; i++) {
    const name = `${namePrefix}-${i}`;
    names.push(name);
    await createUser(page, { name });
    await expectUserCreatedToast(page).waitFor();
    // Cierra el toast en el momento (dura 3s por defecto, ver
    // shared/lib/toast.ts): sin esto, crear 11 usuarios seguidos apila
    // toasts que terminan tapando el botón "Nuevo usuario" de la siguiente
    // iteración. El botón de cerrar tiene aria-hidden="true" (no pensado
    // para lectores de pantalla en un toast que se auto-cierra), así que
    // no se puede ubicar por rol — se usa el data-slot en su lugar.
    await page.locator('[data-slot="toast-close"]').last().click();
  }
  return names;
};
