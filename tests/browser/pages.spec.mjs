import {
	capture,
	expect,
	expectNoPageOverflow,
	loadPackage,
	test,
} from "./fixtures.mjs";

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
	test(`@once ${file} loads styled content without page overflow`, async ({
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

test("@light wide table stays contained and scrolls from the keyboard", async ({
	page,
}, testInfo) => {
	await loadPackage(page, "/foundations.html");
	// Scroll containment belongs to the consuming application, as documented.
	await page.addStyleTag({
		content:
			".specimen-table-scroll { overflow-x: auto; } .specimen-table-scroll table { min-inline-size: 42rem; }",
	});
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
