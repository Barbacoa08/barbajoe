import { execFileSync } from "node:child_process";
import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";
const viewports = {
	desktop: { width: 1280, height: 720 },
	narrow: { width: 390, height: 844 },
};

export default defineConfig({
	testDir: "./tests/browser",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	workers: 2,
	retries: 0,
	timeout: 30_000,
	expect: { timeout: 5_000 },
	outputDir: "test-results",
	reporter: [["list"], ["html", { open: "never" }]],
	metadata: {
		commit: execFileSync("git", ["rev-parse", "HEAD"], {
			encoding: "utf8",
		}).trim(),
		workingTreeDirty: Boolean(
			execFileSync("git", ["status", "--porcelain"], {
				encoding: "utf8",
			}).trim(),
		),
		build: "Parcel optimized specimen (source CSS imports)",
		limitations:
			"Bundled test browsers; WebKit is not installed Safari. Narrow desktop viewports are not mobile-device tests. Real browser zoom, screen readers, and motion behavior are not assessed.",
	},
	use: {
		baseURL,
		// Stable captures; motion behavior remains a separate recommended review.
		reducedMotion: "reduce",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	projects: ["chromium", "firefox", "webkit"].flatMap((browserName) =>
		Object.entries(viewports).flatMap(([size, viewport]) =>
			["light", "dark"].map((colorScheme) => ({
				name: `${browserName}-${size}-${colorScheme}`,
				use: { browserName, viewport, colorScheme },
			})),
		),
	),
	webServer: {
		command:
			"pnpm build && pnpm build:specimen && pnpm exec http-server src/packages/css-lib/.output/specimen -a 127.0.0.1 -p 4173 -c-1",
		url: `${baseURL}/index.html`,
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
