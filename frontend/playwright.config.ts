import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "./e2e/utils/auth";

const E2E_BACKEND_URL = "http://localhost:8081";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    /*
     * Hace login una vez contra el backend real como ADMIN y guarda el
     * storageState (incluye localStorage, donde vive el accessToken de
     * zustand) — necesario desde que AuthGate gatea (dashboard) y el
     * backend exige JWT vía guards globales. Ver e2e/auth.setup.ts.
     */
    {
      name: "setup",
      testMatch: /\.setup\.ts$/,
    },

    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: ADMIN_AUTH_FILE },
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], storageState: ADMIN_AUTH_FILE },
      dependencies: ["setup"],
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], storageState: ADMIN_AUTH_FILE },
      dependencies: ["setup"],
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /*
   * Levanta el backend de test (base aislada `mokka_cafe_test`, puerto
   * 8081) y el dev server del frontend apuntado a él — así los e2e no
   * pisan la base de desarrollo real, tanto en local como en CI (el
   * workflow `.github/workflows/playwright.yml` ya instala el backend y
   * levanta Postgres para esto). `db:test:reset` trunca la base de test y
   * `db:test:seed` repone los usuarios fijos (`admin@mokka.local`, etc. —
   * ver `prisma/seeders/users.seeder.ts`) que `e2e/auth.setup.ts` necesita
   * para loguearse; `reuseExistingServer: false` en el backend asegura que
   * ese ciclo reset+seed corra siempre, no solo la primera vez.
   *
   * Importante: si ya hay un `pnpm dev` corriendo (por fuera de
   * Playwright) apuntado al backend de desarrollo (8080), este config lo
   * reutiliza tal cual (`reuseExistingServer: !process.env.CI`) y
   * NEXT_PUBLIC_API_URL no cambia — hay que pararlo antes de correr los
   * e2e para que tomen el backend de test.
   */
  webServer: [
    {
      command: "pnpm run db:test:reset && pnpm run db:test:seed && pnpm run e2e:serve",
      cwd: path.resolve(__dirname, "../backend"),
      url: E2E_BACKEND_URL,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "pnpm dev",
      url: "http://localhost:3000",
      env: { NEXT_PUBLIC_API_URL: E2E_BACKEND_URL },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
