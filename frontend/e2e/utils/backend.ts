/**
 * Backend de test aislado que levanta `playwright.config.ts` (base
 * `mokka_cafe_test`, puerto 8081) — no el backend de desarrollo (8080).
 * `NEXT_PUBLIC_API_URL` solo llega seteada al proceso hijo de `pnpm dev`
 * que arranca Playwright, no a este proceso de test, por eso no se lee de
 * ahí acá.
 */
export const BACKEND_URL = "http://localhost:8081";

export const isBackendReachable = async () => {
  try {
    await fetch(BACKEND_URL, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
};
