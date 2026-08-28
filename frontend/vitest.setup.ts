import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Sin test.globals:true, @testing-library/react no engancha su
 * auto-cleanup — sin esto, el DOM de un test queda montado en el
 * siguiente y las queries empiezan a matchear elementos viejos.
 */
afterEach(() => {
  cleanup();
});

/**
 * next/font/google no puede resolver la fuente real en jsdom (hace una
 * llamada de build-time). Se mockea genéricamente: cualquier función
 * exportada (Fraunces, Work_Sans, la que sea) devuelve un objeto con
 * className/variable como haría Next en un build real.
 */
vi.mock("next/font/google", () => {
  const fontStub = () => ({ className: "", variable: "" });
  return new Proxy(
    {},
    {
      get: () => fontStub,
    },
  );
});
