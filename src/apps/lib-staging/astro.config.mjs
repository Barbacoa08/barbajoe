import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://lib-staging.barbajoe.tech/",
  vite: {
    server: {
      open: true,
    },
  },
});
