import { readFile } from "node:fs/promises";
import { platform, release } from "node:os";
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
	reviewEvidence: [
		async ({ page, browser, browserName, reducedMotion }, use, testInfo) => {
			const errors = [];
			page.on("pageerror", (error) => errors.push(error.message));
			page.on("requestfailed", (request) =>
				errors.push(`${request.url()}: ${request.failure()?.errorText}`),
			);
			page.on("response", (response) => {
				if (response.status() >= 400)
					errors.push(`${response.status()} ${response.url()}`);
			});
			await use();
			await testInfo.attach("environment", {
				body: JSON.stringify(
					{
						date: new Date().toISOString(),
						...testInfo.config.metadata,
						browser: browserName,
						browserVersion: browser.version(),
						os: `${platform()} ${release()}`,
						project: testInfo.project.name,
						configuredViewport: testInfo.project.use.viewport,
						viewport: page.viewportSize(),
						colorScheme: testInfo.project.use.colorScheme,
						reducedMotion,
						url: page.url(),
						pageErrors: errors,
					},
					null,
					2,
				),
				contentType: "application/json",
			});
			expect(errors, "Page scripts and requested assets must load").toEqual([]);
		},
		{ auto: true },
	],
});

export { expect };

export async function capture(testInfo, target, name, options = {}) {
	if (process.env.BARBA_CAPTURE !== "1") return;
	await testInfo.attach(name, {
		body: await target.screenshot({ animations: "disabled", ...options }),
		contentType: "image/png",
	});
}

export async function expectNoPageOverflow(page) {
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth,
			),
		)
		.toBeLessThanOrEqual(1);
}

// Exercise shipped CSS without allowing specimen-only styles to hide regressions.
export async function loadPackage(page, url = "/index.html") {
	await page.goto(url);
	await page.locator('link[rel="stylesheet"], style').evaluateAll((els) => {
		for (const el of els) el.remove();
	});
	await page.addStyleTag({
		content: await readFile(
			new URL("../../src/packages/css-lib/dist/barbajoe.css", import.meta.url),
			"utf8",
		),
	});
}
