import netlify from "@astrojs/netlify/functions";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://blog.barbajoe.tech/",
  adapter: netlify(),
  output: "server",
  integrations: [react(), svelte()],
  vite: {
    server: {
      open: true,
    },
  },
});
