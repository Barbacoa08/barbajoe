import { readFile } from "node:fs/promises";
import { expect, test } from "./fixtures.mjs";

test.use({ reducedMotion: "no-preference" });

async function loadLibrary(page, packaged) {
	await page.goto("/disclosures.html");
	// No specimen CSS: this must work from the library alone.
	await page
		.locator('link[rel="stylesheet"], style')
		.evaluateAll((elements, packaged) => {
			for (const element of elements) {
				if (packaged || !element.hasAttribute("data-library")) element.remove();
			}
		}, packaged);
	if (packaged)
		await page.addStyleTag({
			content: await readFile(
				new URL(
					"../../src/packages/css-lib/dist/barbajoe.css",
					import.meta.url,
				),
				"utf8",
			),
		});
}

async function hasMotionSupport(page) {
	return page.evaluate(
		() =>
			CSS.supports("interpolate-size: allow-keywords") &&
			CSS.supports("transition-behavior: allow-discrete") &&
			CSS.supports("interactivity: inert") &&
			CSS.supports("selector(details::details-content)"),
	);
}

for (const packaged of [true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: library alone animates disclosures with usable instant fallbacks`, async ({
		page,
	}) => {
		await loadLibrary(page, packaged);
		const supported = await hasMotionSupport(page);
		for (const reducedMotion of ["no-preference", "reduce"]) {
			await page.emulateMedia({ reducedMotion });
			for (const selector of ["#empty-closed details", "#bordered details"]) {
				const panel = page.locator(selector).first();
				await panel.scrollIntoViewIfNeeded();
				const samples = await panel.evaluate(async (el) => {
					const height = () => el.getBoundingClientRect().height;
					const sample = async (open) => {
						await new Promise(requestAnimationFrame);
						const start = performance.now();
						el.open = open;
						const frames = [];
						do {
							await new Promise(requestAnimationFrame);
							frames.push(height());
						} while (performance.now() - start < 450);
						return frames;
					};
					const closed = height();
					const opening = await sample(true);
					const opened = height();
					const closing = await sample(false);
					const ended = height();
					return { closed, opening, opened, closing, ended };
				});
				expect(samples.opened).toBeGreaterThan(samples.closed + 10);
				expect(Math.abs(samples.ended - samples.closed)).toBeLessThan(2);
				const intermediate = (frames) =>
					frames.some((h) => h > samples.closed + 2 && h < samples.opened - 2);
				expect(intermediate(samples.opening)).toBe(
					supported && reducedMotion === "no-preference",
				);
				expect(intermediate(samples.closing)).toBe(
					supported && reducedMotion === "no-preference",
				);
			}
		}
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page
			.locator("main")
			.evaluate((el) =>
				el.insertAdjacentHTML(
					"beforeend",
					'<details id="unclassed"><summary>Plain native disclosure</summary><p>Unclassed content remains native.</p></details>',
				),
			);
		const plain = page.locator("#unclassed");
		expect(
			await plain.evaluate(
				(el) => getComputedStyle(el, "::details-content").transitionDuration,
			),
		).toBe("0s");
	});

	// Catch a permanent inert guard hiding closed content from browser search, or
	// a guard that expires too early and lets closing controls receive focus.
	test(`@once ${source}: animated disclosures restore search after closing and cancel the guard on reopening`, async ({
		page,
		browserName,
	}) => {
		test.skip(
			browserName !== "chromium",
			"window.find characterization uses Chromium; native Find is reviewed separately.",
		);
		await loadLibrary(page, packaged);
		const supportsMotion = await page.evaluate(
			() =>
				CSS.supports("interpolate-size: allow-keywords") &&
				CSS.supports("transition-behavior: allow-discrete") &&
				CSS.supports("interactivity: inert") &&
				CSS.supports("selector(details::details-content)"),
		);
		test.skip(!supportsMotion, "This browser uses the instant fallback.");

		for (const selector of ["#empty-closed details", "#bordered details"]) {
			const panel = page.locator(selector).first();
			await panel.locator(".disclosure-content").evaluate((content) => {
				const marker = document.createElement("button");
				marker.type = "button";
				marker.textContent = "Disclosure search regression needle";
				marker.dataset.searchProbe = "";
				content.append(marker);
			});
			const findClosedContent = () =>
				page.evaluate(() => {
					getSelection().removeAllRanges();
					return window.find(
						"Disclosure search regression needle",
						false,
						false,
						true,
					);
				});
			await page.emulateMedia({ reducedMotion: "reduce" });
			await expect.poll(findClosedContent).toBe(true);
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await expect.poll(findClosedContent).toBe(true);

			await panel.locator("summary").press("Enter");
			await expect(panel).toHaveAttribute("open", "");
			await expect
				.poll(() =>
					panel.evaluate(
						(el) => getComputedStyle(el, "::details-content").contentVisibility,
					),
				)
				.toBe("visible");
			// Test the immediate closing phase within one frame, avoiding a race
			// between separate automation commands and the short transition.
			expect(
				await panel.evaluate((el) => {
					const summary = el.querySelector("summary");
					const probe = el.querySelector("[data-search-probe]");
					summary.focus();
					el.open = false;
					probe.focus();
					return document.activeElement === summary;
				}),
			).toBe(true);
			await expect.poll(findClosedContent).toBe(true);
			await expect(panel).not.toHaveAttribute("open");
			// Native closed content remains unfocusable even once search is restored.
			expect(
				await panel.evaluate((el) => {
					el.querySelector("summary").focus();
					el.querySelector("[data-search-probe]").focus();
					return !el
						.querySelector(".disclosure-content")
						.contains(document.activeElement);
				}),
			).toBe(true);

			// Reopening cancels inertness immediately. Native details may reveal its
			// content on the next rendering update before a control can take focus.
			await panel.locator("summary").press("Enter");
			expect(
				await panel.evaluate(async (el) => {
					el.getBoundingClientRect();
					el.open = false;
					el.getBoundingClientRect();
					el.open = true;
					const inert = getComputedStyle(el, "::details-content").interactivity;
					await new Promise(requestAnimationFrame);
					await new Promise(requestAnimationFrame);
					const probe = el.querySelector("[data-search-probe]");
					probe.focus();
					return inert === "auto" && document.activeElement === probe;
				}),
			).toBe(true);
			await panel.evaluate((el) => {
				el.open = false;
			});
			await page.emulateMedia({ reducedMotion: "reduce" });
			expect(await findClosedContent()).toBe(true);
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await panel.evaluate((el) =>
				el.style.setProperty("--barba-motion-duration-base", "0s"),
			);
			expect(await findClosedContent()).toBe(true);
			await panel.locator("[data-search-probe]").evaluate((el) => el.remove());
		}
	});
}
