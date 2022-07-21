import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import svelte from "@astrojs/svelte";

export default defineConfig({
  integrations: [react(), svelte()],
  vite: {
    server: {
      open: true,
    },
  },
});
