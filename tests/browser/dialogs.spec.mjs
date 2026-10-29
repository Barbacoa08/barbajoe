import {
	capture,
	expect,
	expectNoPageOverflow,
	loadPackage,
	test,
} from "./fixtures.mjs";

test("short and long dialogs share a top anchor and keep long scrolling in the body", async ({
	page,
}, testInfo) => {
	await page.goto("/dialogs.html");
	const short = page.getByRole("dialog", { name: "Short dialog", exact: true });
	const long = page.getByRole("dialog", { name: "Long dialog", exact: true });
	await page.getByRole("button", { name: "Open short dialog" }).click();
	const shortBox = await short.boundingBox();
	await capture(testInfo, short, "short-dialog");
	await short.getByRole("button", { name: "Cancel" }).click();
	await page.getByRole("button", { name: "Open long dialog" }).click();
	const longBox = await long.boundingBox();
	expect(Math.abs(shortBox.y - longBox.y)).toBeLessThanOrEqual(1);
	expect(longBox.height).toBeGreaterThan(shortBox.height);
	expect(longBox.y + longBox.height).toBeLessThan(page.viewportSize().height);
	const body = long.locator(".dialog-body");
	const header = long.locator(".dialog-header");
	const footer = long.locator(".dialog-footer");
	const headerBefore = await header.boundingBox();
	const footerBefore = await footer.boundingBox();
	expect(
		await body.evaluate(
			(element) => element.scrollHeight > element.clientHeight,
		),
	).toBe(true);
	await body.evaluate((element) => {
		element.scrollTop = element.scrollHeight;
	});
	await expect
		.poll(() => body.evaluate((element) => element.scrollTop))
		.toBeGreaterThan(0);
	expect(
		Math.abs((await header.boundingBox()).y - headerBefore.y),
	).toBeLessThanOrEqual(1);
	expect(
		Math.abs((await footer.boundingBox()).y - footerBefore.y),
	).toBeLessThanOrEqual(1);
	await expectNoPageOverflow(page);
	await capture(testInfo, long, "long-dialog-scrolled");
});

test("@light dialog keyboard navigation reaches the final field and footer actions at 320px", async ({
	page,
	browserName,
}) => {
	await loadPackage(page, "/dialogs.html");
	await page.setViewportSize({ width: 320, height: 568 });
	await page.getByRole("button", { name: "Open long dialog" }).click();
	const dialog = page.getByRole("dialog", { name: "Long dialog", exact: true });
	await expect(dialog.getByLabel("Long title", { exact: true })).toBeFocused();
	await page.keyboard.press("Tab");
	await expect(
		dialog.getByRole("textbox", { name: "Notes", exact: true }),
	).toBeFocused();
	await page.keyboard.press("Tab");
	const final = dialog.getByLabel("Final field", { exact: true });
	await expect(final).toBeFocused();
	await expect(final).toBeInViewport();
	// macOS WebKit's default Tab navigation skips buttons. Option-Tab includes
	// them without changing the user's OS or browser keyboard settings.
	const tab =
		browserName === "webkit" && process.platform === "darwin"
			? "Alt+Tab"
			: "Tab";
	for (const name of ["Reset", "Cancel", "Submit"]) {
		await page.keyboard.press(tab);
		const button = dialog.getByRole("button", { name, exact: true });
		await expect(button).toBeFocused();
		await expect(button).toBeInViewport();
	}
	await page.keyboard.press(`Shift+${tab}`);
	await expect(
		dialog.getByRole("button", { name: "Cancel", exact: true }),
	).toBeFocused();
	await expectNoPageOverflow(page);
});
