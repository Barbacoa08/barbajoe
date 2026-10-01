import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

for (const file of [
	"index.html",
	"headers.html",
	"layout-header.html",
	"layout-footer.html",
	"layout-minimal.html",
]) {
	test(`${file} loads styled content without page overflow`, async ({
		page,
	}, testInfo) => {
		const response = await page.goto(`/${file}`);
		expect(response.status()).toBe(200);
		await expect(page.locator("main h1").first()).toBeVisible();
		// A successful HTML response alone would miss a missing stylesheet.
		expect(
			await page.evaluate(() =>
				getComputedStyle(document.documentElement)
					.getPropertyValue("--barba-color-bg")
					.trim(),
			),
		).not.toBe("");
		await expectNoPageOverflow(page);
		await capture(testInfo, page, file, { fullPage: true });
	});
}

test("wide table stays contained and scrolls from the keyboard", async ({
	page,
}, testInfo) => {
	await page.goto("/index.html");
	await page.setViewportSize({ width: 320, height: 844 });
	await expectNoPageOverflow(page);
	const scroller = page.getByRole("region", { name: "Wide data table" });
	await scroller.focus();
	await expect(scroller).toBeFocused();
	// WebKit starts native scrolling while the key is held, before keyup.
	await scroller.press("ArrowRight", { delay: 100 });
	await expect
		.poll(() => scroller.evaluate((element) => element.scrollLeft))
		.toBeGreaterThan(0);
	await expectNoPageOverflow(page);
	await capture(
		testInfo,
		page.locator('section[aria-labelledby="tables-heading"]'),
		"tables",
	);
});

test("buttons and placeholders are captured for visual review", async ({
	page,
}, testInfo) => {
	await page.goto("/index.html");
	for (const scheme of ["light", "dark"]) {
		const buttons = page.locator(
			`section[aria-labelledby="buttons-heading"] .specimen-theme-${scheme}`,
		);
		await capture(testInfo, buttons, `${scheme}-buttons`);
		await buttons.getByRole("button", { name: "Primary", exact: true }).hover();
		await capture(testInfo, buttons, `${scheme}-primary-hover`);
	}
	await capture(
		testInfo,
		page.locator(".specimen-placeholder-examples"),
		"placeholders",
	);
});
