import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setSession: (tokens: { accessToken: string; refreshToken: string }) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setSession: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearSession: () => set({ accessToken: null, refreshToken: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "mokka-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
