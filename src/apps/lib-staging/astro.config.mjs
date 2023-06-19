import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://lib-staging.barbajoe.tech/",
  integrations: [svelte()],
});
