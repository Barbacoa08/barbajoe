import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";
if (
	process.env.BARBA_TEST_USE_EXISTING_BUILD === "1" &&
	(!existsSync("src/packages/css-lib/.output/specimen/index.html") ||
		!existsSync("src/packages/css-lib/dist/barbajoe.css"))
)
	throw new Error("Build the package and specimen before reusing CI output");

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
			"Bundled test browsers; WebKit is not installed Safari. Narrow desktop viewports are not mobile-device tests. Real browser zoom and screen readers are not assessed. Motion is disabled except in the focused disclosure animation regressions.",
	},
	use: {
		baseURL,
		// Stable captures; disclosure-motion.spec.mjs overrides this for motion and guard checks.
		reducedMotion: "reduce",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	projects: ["chromium", "firefox", "webkit"].map((browserName) => ({
		name: browserName,
		use: {
			browserName,
			viewport: { width: 1280, height: 720 },
			colorScheme: "light",
		},
		grepInvert: browserName === "chromium" ? undefined : /@once/,
	})),
	webServer: {
		// Launch the long-lived server directly so Playwright owns its process
		// group; a native pnpm wrapper can leave descendants holding pipes open.
		command: `${process.env.BARBA_TEST_USE_EXISTING_BUILD === "1" ? "" : "pnpm build:specimen && "}node node_modules/http-server/bin/http-server src/packages/css-lib/.output/specimen -a 127.0.0.1 -p 4173 -c-1`,
		url: `${baseURL}/index.html`,
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
