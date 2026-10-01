import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

for (const kind of ["short", "long"]) {
	const label = kind === "short" ? "Short" : "Long";
	test(`${kind} dialog resets, validates, cancels, and submits`, async ({
		page,
	}, testInfo) => {
		await page.goto("/index.html");
		const opener = page.getByRole("button", { name: `Open ${kind} dialog` });
		const dialog = page.getByRole("dialog", {
			name: `${label} dialog`,
			exact: true,
		});
		// Native dialogs restore previously focused controls; Safari does not
		// focus buttons on pointer click. Start this check with keyboard activation.
		await opener.focus();
		await opener.press("Enter");
		await expect(dialog).toBeVisible();
		const title = dialog.getByLabel(`${label} title`, { exact: true });
		await expect(title).toBeFocused();
		await title.fill("Edited title");
		if (kind === "long") {
			await dialog
				.getByRole("textbox", { name: "Notes", exact: true })
				.fill("Edited notes");
			await dialog
				.getByLabel("Final field", { exact: true })
				.fill("Edited final value");
		}
		await dialog.getByRole("button", { name: "Reset", exact: true }).click();
		await expect(title).toHaveValue(`Initial ${kind} title`);
		if (kind === "long") {
			await expect(
				dialog.getByRole("textbox", { name: "Notes", exact: true }),
			).toHaveValue("Initial notes to restore with Reset.");
			await expect(
				dialog.getByLabel("Final field", { exact: true }),
			).toHaveValue("Initial final value");
		}
		await expect(dialog).toBeVisible();
		await title.fill("");
		await dialog.getByRole("button", { name: "Submit", exact: true }).click();
		await expect(dialog).toBeVisible();
		await expect(title).toBeFocused();
		await expect
			.poll(() => title.evaluate((element) => element.validity.valueMissing))
			.toBe(true);
		await capture(testInfo, dialog, `${kind}-invalid-dialog`);
		await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
		await expect(dialog).not.toBeVisible();
		await expect(opener).toBeFocused();
		await opener.press("Enter");
		await expect(title).toHaveValue("");
		await title.fill("Valid submission");
		await dialog.getByRole("button", { name: "Submit", exact: true }).click();
		await expect(dialog).not.toBeVisible();
		await expect(opener).toBeFocused();
	});

	test(`${kind} dialog cancels outside and with Escape, retaining inside gestures`, async ({
		page,
	}) => {
		await page.goto("/index.html");
		const opener = page.getByRole("button", { name: `Open ${kind} dialog` });
		const dialog = page.getByRole("dialog", {
			name: `${label} dialog`,
			exact: true,
		});
		await opener.focus();
		await opener.press("Enter");
		await dialog.getByLabel(`${label} title`, { exact: true }).fill("");
		await dialog.locator(".dialog-header").click();
		await expect(dialog).toBeVisible();
		const box = await dialog.locator(".dialog-header").boundingBox();
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await page.mouse.move(2, 2);
		await page.mouse.up();
		await expect(dialog).toBeVisible();
		await page.mouse.click(2, 2);
		await expect(dialog).not.toBeVisible();
		await expect(opener).toBeFocused();
		await opener.press("Enter");
		await page.keyboard.press("Escape");
		await expect(dialog).not.toBeVisible();
		await expect(opener).toBeFocused();
	});
}

test("short and long dialogs share a top anchor and keep long scrolling in the body", async ({
	page,
}, testInfo) => {
	await page.goto("/index.html");
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

test("dialog keyboard navigation reaches the final field and footer actions at 320px", async ({
	page,
	browserName,
}) => {
	await page.goto("/index.html");
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
