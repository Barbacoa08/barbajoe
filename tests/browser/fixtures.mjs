import { platform, release } from "node:os";
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
	cancelledNavigationSourcePaths: [[], { option: true }],
	reviewEvidence: [
		async (
			{
				page,
				browser,
				browserName,
				reducedMotion,
				baseURL,
				cancelledNavigationSourcePaths,
			},
			use,
			testInfo,
		) => {
			const errors = [];
			const completedAssets = new Set();
			const navigationCancellations = [];
			page.on("requestfinished", (request) =>
				completedAssets.add(request.url()),
			);
			page.on("pageerror", (error) => errors.push(error.message));
			page.on("requestfailed", (request) => {
				const failure = request.failure()?.errorText;
				const message = `${request.url()}: ${failure}`;
				const referer = request.headers().referer;
				const source = referer ? new URL(referer) : null;
				// A client redirect can cancel the old document's shared assets.
				// Only the explicit bookmark fixture permits these, and only if
				// the same asset also finishes loading during this test.
				if (
					["Load request cancelled", "cancelled"].includes(failure) &&
					["stylesheet", "script"].includes(request.resourceType()) &&
					source?.origin === new URL(baseURL).origin &&
					new URL(request.url()).origin === source.origin &&
					cancelledNavigationSourcePaths.includes(source.pathname)
				) {
					navigationCancellations.push({
						url: request.url(),
						source: referer,
						message,
					});
				} else errors.push(message);
			});
			page.on("response", (response) => {
				if (response.status() >= 400)
					errors.push(`${response.status()} ${response.url()}`);
			});
			await use();
			for (const cancellation of navigationCancellations) {
				if (!completedAssets.has(cancellation.url))
					errors.push(cancellation.message);
			}
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
						navigationCancellations,
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
