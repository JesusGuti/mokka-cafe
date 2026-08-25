import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // e2e/ es de Playwright, no de Vitest — evita que se pisen por nombre de archivo.
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
    },
  },
});
