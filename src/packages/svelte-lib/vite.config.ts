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
			include: ["src/lib/**/*.{js,ts}"],
			exclude: ["src/lib/types"],
		},
	},
});
