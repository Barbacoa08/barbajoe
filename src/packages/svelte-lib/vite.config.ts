import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{js,ts}"],

    reporter: ["text", "json-summary", "json"],
    coverage: {
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
    },
  },
});
