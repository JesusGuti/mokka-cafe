/**
 * En local, `playwright.config.ts` levanta un backend de test aislado
 * (base `mokka_cafe_test`, puerto 8081) — no el backend de desarrollo
 * (8080). `NEXT_PUBLIC_API_URL` solo llega seteada al proceso hijo de
 * `pnpm dev` que arranca Playwright, no a este proceso de test, por eso
 * no se lee de ahí acá.
 *
 * En CI ese backend no se levanta (ver comentario en playwright.config.ts
 * sobre por qué), así que se mantiene el chequeo original contra
 * `NEXT_PUBLIC_API_URL`/8080 — ahí nunca responde nadie, por lo que
 * `isBackendReachable()` sigue dando `false` y esos tests se saltean.
 */
export const BACKEND_URL = process.env.CI
  ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080")
  : "http://localhost:8081";

export const isBackendReachable = async () => {
  try {
    await fetch(BACKEND_URL, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
};
