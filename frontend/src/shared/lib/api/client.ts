import axios, { type AxiosError } from "axios"
import { env } from "@/shared/lib/env"
import { getQueryClient } from "@/shared/lib/query-client"
import { useAuthStore } from "@/shared/store/auth-store"

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession()
      getQueryClient().clear()

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)
