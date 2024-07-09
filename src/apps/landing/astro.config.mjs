import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://barbajoe.tech/",
	vite: {
		server: {
			open: true,
		},
	},
});
