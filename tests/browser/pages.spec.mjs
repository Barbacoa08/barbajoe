import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

for (const file of [
	"index.html",
	"getting-started.html",
	"foundations.html",
	"forms.html",
	"buttons.html",
	"chips.html",
	"dialogs.html",
	"accessibility.html",
	"disclosures.html",
	"headers.html",
	"layout-header.html",
	"layout-footer.html",
	"layout-minimal.html",
	"editor.html",
	"package-theme.html",
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
	await page.goto("/foundations.html");
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
	await page.goto("/buttons.html");
	for (const scheme of ["light", "dark"]) {
		const buttons = page.locator(
			`section[aria-labelledby="buttons-heading"] .specimen-theme-${scheme}`,
		);
		await capture(testInfo, buttons, `${scheme}-buttons`);
		await buttons.getByRole("button", { name: "Primary", exact: true }).hover();
		await capture(testInfo, buttons, `${scheme}-primary-hover`);
	}
	await page.goto("/forms.html");
	await capture(
		testInfo,
		page.locator(".specimen-placeholder-examples"),
		"placeholders",
	);
});

test("packaged primary example exposes resting, hover, and keyboard-focus states", async ({
	page,
	browserName,
}) => {
	await page.goto("/package-theme.html");
	const primary = page.getByRole("button", {
		name: "Primary action",
		exact: true,
	});
	await expect(primary).toBeEnabled();
	const resting = await primary.evaluate(
		(el) => getComputedStyle(el).backgroundColor,
	);
	expect(resting).not.toBe("rgba(0, 0, 0, 0)");
	await primary.hover();
	expect(
		await primary.evaluate((el) => getComputedStyle(el).backgroundColor),
	).not.toBe(resting);
	await page.mouse.move(0, 0);
	await page.getByRole("link", { name: "Working editor", exact: true }).focus();
	await page.keyboard.press(
		browserName === "webkit" && process.platform === "darwin"
			? "Alt+Tab"
			: "Tab",
	);
	await expect(primary).toBeFocused();
	await expect(primary).toHaveCSS("outline-style", "solid");
	await primary.press("Space");
	await expect(page).toHaveURL(/package-theme.html$/);
});
