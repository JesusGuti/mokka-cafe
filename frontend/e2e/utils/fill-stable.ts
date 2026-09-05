import { expect, type Locator } from "@playwright/test";

/**
 * `fill()` escribe el valor a través del setter nativo y dispara un solo
 * evento `input`; en WebKit eso a veces no llega a confirmarse en el estado
 * de React (el input controlado queda con el valor viejo por dentro aunque
 * el DOM lo muestre un instante), y el próximo render lo vuelve a pisar con
 * "" apenas ocurre en el componente. `pressSequentially` simula tecla por
 * tecla como un usuario real, así que el onChange de React se dispara de
 * forma confiable en cualquier motor. El `toPass()` de afuera además cubre
 * la carrera de hidratación al navegar recién con `page.goto()`.
 */
export const fillStable = async (locator: Locator, value: string) => {
  await expect(async () => {
    await locator.fill("");
    if (value) await locator.pressSequentially(value);
    await expect(locator).toHaveValue(value);
  }).toPass();
};
