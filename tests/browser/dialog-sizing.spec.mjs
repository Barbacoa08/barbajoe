import { readFile } from "node:fs/promises";
import { capture, expect, test } from "./fixtures.mjs";

async function fixture(page, packaged) {
	await page.goto("/index.html");
	if (packaged) {
		await page.locator('link[rel="stylesheet"], style').evaluateAll((els) => {
			for (const el of els) el.remove();
		});
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
	const dialog = page.locator("#specimen-dialog");
	await dialog.evaluate((el) => {
		el.innerHTML = `<form method="dialog" class="dialog-content-container">
  <header class="dialog-header dialog-header-actions"><h2 id="specimen-dialog-title">Edit item</h2><button type="button" data-barba-variant="text" data-barba-shape="icon" aria-label="Close dialog"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></header>
  <div class="dialog-body"><label>Name <input value="Weekend supplies" required autofocus></label></div>
  <footer class="dialog-footer"><button type="reset">Reset</button><button type="button">Cancel</button><button type="submit">Save</button></footer></form>`;
		el.showModal();
	});
	return dialog;
}

for (const packaged of [false, true]) {
	const label = packaged ? "package" : "source";
	test(`${label}: dialog options are independent and retain the standard width`, async ({
		page,
	}, testInfo) => {
		const dialog = await fixture(page, packaged);
		const original = await dialog.boundingBox();
		const header = dialog.locator(".dialog-header");
		const defaultPadding = await header.evaluate((el) =>
			parseFloat(getComputedStyle(el).paddingTop),
		);
		await dialog.evaluate((el) => (el.dataset.barbaDialogSpacing = "compact"));
		expect(
			await header.evaluate((el) =>
				parseFloat(getComputedStyle(el).paddingTop),
			),
		).toBeLessThan(defaultPadding);
		await dialog.evaluate((el) => (el.dataset.barbaDialogHeight = "content"));
		const compact = await dialog.boundingBox();
		expect(compact.height).toBeLessThan(original.height);
		expect(compact.width).toBeCloseTo(original.width, 0);
		expect(compact.y).toBeCloseTo(original.y, 0);
		await dialog.evaluate((el) => (el.dataset.barbaDialogRoom = "extra"));
		expect((await dialog.boundingBox()).y).toBeLessThan(original.y);
		expect((await dialog.boundingBox()).width).toBeCloseTo(original.width, 0);
		const close = dialog.getByRole("button", { name: "Close dialog" });
		const box = await close.boundingBox();
		expect(box.width).toBeGreaterThanOrEqual(44);
		expect(box.width).toBeCloseTo(box.height, 0);
		await expect(close).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(close).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
		await close.hover();
		expect(
			await close.evaluate((el) => getComputedStyle(el).borderTopColor),
		).not.toBe("rgba(0, 0, 0, 0)");
		await capture(testInfo, dialog, `${label}-content-fit-dialog`);
	});
	test(`${label}: long dialog headers wrap and the body owns scrolling`, async ({
		page,
	}, testInfo) => {
		const dialog = await fixture(page, packaged);
		await dialog.evaluate((el) => {
			el.dataset.barbaDialogSpacing = "compact";
			el.dataset.barbaDialogHeight = "content";
			el.dataset.barbaDialogRoom = "extra";
			el.querySelector("h2").textContent =
				"Review InternationalDeliveryPreferencesAndNotificationSettings";
			el.querySelector(".dialog-body").insertAdjacentHTML(
				"beforeend",
				`<p>${"Long sample content. ".repeat(100)}</p><label>Final field <input value="End"></label>`,
			);
		});
		await page.setViewportSize({ width: 320, height: 568 });
		await page.locator("html").evaluate((el) => (el.style.fontSize = "200%"));
		const body = dialog.locator(".dialog-body");
		const header = dialog.locator(".dialog-header");
		expect(
			await dialog.evaluate((el) => el.scrollWidth - el.clientWidth),
		).toBeLessThanOrEqual(1);
		expect(
			await body.evaluate(
				(el) =>
					el.getBoundingClientRect().right <=
					el.closest("dialog").getBoundingClientRect().right,
			),
		).toBe(true);
		expect(
			await header.evaluate((el) =>
				parseFloat(getComputedStyle(el, "::after").width),
			),
		).toBeGreaterThan(100);
		await page.locator("html").evaluate((el) => (el.style.fontSize = "100%"));
		await page.setViewportSize({ width: 390, height: 844 });
		const before = await header.boundingBox();
		const footer = dialog.locator(".dialog-footer");
		const beforeFooter = await footer.boundingBox();
		expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
			true,
		);
		await body.getByLabel("Final field").focus();
		await expect(body.getByLabel("Final field")).toBeInViewport();
		expect(await body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
		expect((await header.boundingBox()).y).toBeCloseTo(before.y, 0);
		expect((await footer.boundingBox()).y).toBeCloseTo(beforeFooter.y, 0);
		const outer = await dialog.boundingBox();
		expect(outer.y + outer.height).toBeLessThanOrEqual(844);
		await page.setViewportSize({ width: 320, height: 240 });
		await dialog.getByRole("button", { name: "Save", exact: true }).focus();
		await expect(
			dialog.getByRole("button", { name: "Save", exact: true }),
		).toBeInViewport();
		expect(
			await dialog.evaluate((el) => el.scrollWidth - el.clientWidth),
		).toBeLessThanOrEqual(1);
		await capture(testInfo, dialog, `${label}-short-screen-dialog`);
	});
}

test("maintained content-fit dialogs validate and close through their icon", async ({
	page,
	browserName,
}) => {
	await page.goto("/index.html");
	for (const kind of ["short", "long"]) {
		const opener = page.getByRole("button", {
			name: `Open content-fit ${kind} dialog`,
			exact: true,
		});
		await opener.focus();
		await opener.press("Enter");
		const dialog = page.getByRole("dialog", {
			name: `Content-fit ${kind} dialog`,
			exact: true,
		});
		const name = dialog.getByLabel("Item name");
		await name.fill("");
		await dialog.getByRole("button", { name: "Save", exact: true }).click();
		await expect(dialog).toBeVisible();
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		await name.press(`Shift+${tab}`);
		// Firefox includes an overflowing scroll region in keyboard navigation.
		if (browserName === "firefox" && kind === "long") {
			await expect(dialog.locator(".dialog-body")).toBeFocused();
			await page.keyboard.press(`Shift+${tab}`);
		}
		const close = dialog.getByRole("button", { name: "Close dialog" });
		await expect(close).toBeFocused();
		await expect(close).toHaveCSS("outline-style", "solid");
		await close.press("Enter");
		await expect(dialog).not.toBeVisible();
		await expect(opener).toBeFocused();
		await opener.press("Enter");
		await name.press("Escape");
		await expect(dialog).not.toBeVisible();
	}
});
