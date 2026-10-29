import { readFile } from "node:fs/promises";
import { capture, expect, test } from "./fixtures.mjs";

async function fixture(page, packaged) {
	await page.goto("/dialogs.html");
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

for (const packaged of [true]) {
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
	test(`${label}: full dialog dividers meet the scrolling body edges`, async ({
		page,
	}, testInfo) => {
		const dialog = await fixture(page, packaged);
		await dialog.evaluate((el) => {
			el.dataset.barbaDialogDividers = "full";
			el.dataset.barbaDialogHeight = "content";
			el.dataset.barbaDialogSpacing = "compact";
			el.querySelector(".dialog-body").insertAdjacentHTML(
				"beforeend",
				`<p>${"Review long content. ".repeat(150)}</p><input aria-label="Last field" value="End">`,
			);
		});
		const header = dialog.locator(".dialog-header");
		const footer = dialog.locator(".dialog-footer");
		const body = dialog.locator(".dialog-body");
		await expect(header).toHaveCSS("border-bottom-width", "1px");
		await expect(footer).toHaveCSS("border-top-width", "1px");
		await expect(header.locator("h2")).toHaveCSS("border-bottom-width", "0px");
		expect(
			await header.evaluate((el) => getComputedStyle(el, "::after").display),
		).toBe("none");
		for (const width of [1280, 320]) {
			await page.setViewportSize({ width, height: 720 });
			const h = await header.boundingBox(),
				b = await body.boundingBox(),
				f = await footer.boundingBox();
			expect(h.x).toBeCloseTo(b.x, 0);
			expect(h.width).toBeCloseTo(b.width, 0);
			expect(h.y + h.height).toBeCloseTo(b.y, 0);
			expect(f.x).toBeCloseTo(b.x, 0);
			expect(f.width).toBeCloseTo(b.width, 0);
			expect(f.y).toBeCloseTo(b.y + b.height, 0);
			await body.getByLabel("Last field").focus();
			expect(await body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
			expect((await header.boundingBox()).y).toBeCloseTo(h.y, 0);
			expect((await footer.boundingBox()).y).toBeCloseTo(f.y, 0);
			expect(
				await dialog.evaluate((el) => el.scrollWidth - el.clientWidth),
			).toBeLessThanOrEqual(1);
		}
		await capture(testInfo, dialog, `${label}-full-dividers`);
	});
}
