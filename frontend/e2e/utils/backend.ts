/**
 * `playwright.config.ts` siempre levanta el backend de test aislado (base
 * `mokka_cafe_test`, puerto 8081) — tanto en local como en CI — así que
 * este chequeo es hoy más una red de seguridad (por si el `webServer` del
 * backend no llegó a levantar) que un skip esperado en el día a día.
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
