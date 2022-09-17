import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://blog.barbajoe.tech/",
  integrations: [react(), svelte()],
  vite: {
    server: {
      open: true,
    },
  },
});
