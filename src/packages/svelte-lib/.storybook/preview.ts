import type { Preview } from "@storybook/svelte";

// BUG: importing shoves all content down, need import into each story :(
// import "@barbajoe/css-lib/dist/barbajoe.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
