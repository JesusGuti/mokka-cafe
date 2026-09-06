import axios, {
  HttpStatusCode,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/shared/lib/env";
import { getQueryClient } from "@/shared/lib/query-client";
import { useAuthStore } from "@/shared/store/auth-store";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
});

// Cliente separado (sin interceptors) para no reentrar en la lógica de arriba
// al pedir un refresh, y para no arrastrar el accessToken vencido en el header.
const refreshClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

function forceLogoutRedirect() {
  useAuthStore.getState().clearSession();
  getQueryClient().clear();

  // Full reload intencional (no router.push): borra cualquier estado en
  // memoria de la sesión anterior, relevante en un terminal compartido.
  // La URL ya es absoluta en runtime; el lint no puede resolver el template
  // string estáticamente y la alternativa que sugiere (router.push) es
  // justo lo que no queremos acá.
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${window.location.origin}/login`;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== HttpStatusCode.Unauthorized) {
      throw error;
    }

    const { refreshToken } = useAuthStore.getState();

    if (
      !refreshToken ||
      !originalRequest ||
      originalRequest._retriedAfterRefresh
    ) {
      forceLogoutRedirect();
      throw error;
    }

    originalRequest._retriedAfterRefresh = true;

    try {
      const { data } = await refreshClient.post<{ accessToken: string }>(
        "/auth/refresh",
        { refreshToken },
      );
      useAuthStore.getState().setAccessToken(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      forceLogoutRedirect();
      throw refreshError;
    }
  },
);
