export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const isBackendReachable = async () => {
  try {
    await fetch(BACKEND_URL, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
};
