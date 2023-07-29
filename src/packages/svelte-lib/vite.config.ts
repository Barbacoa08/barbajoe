import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{js,ts}"],

    coverage: {
      reporter: ["json-summary", "html"],
      lines: 90,
      branches: 90,
      functions: 0, // TODO: renable after I figure out how to test `<dialog>` elements
      statements: 90,
    },
  },
});
