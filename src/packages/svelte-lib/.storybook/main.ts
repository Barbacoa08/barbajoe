import type { StorybookConfig } from "@storybook/sveltekit";

const config: StorybookConfig = {
	stories: [
		"../src/**/*.mdx",
		"../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)",
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-a11y",
		"@storybook/addon-svelte-csf",
	],
	framework: "@storybook/sveltekit",
	docs: {
		autodocs: true,
	},
};
export default config;
