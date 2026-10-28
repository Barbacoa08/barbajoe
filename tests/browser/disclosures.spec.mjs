import { readFile } from "node:fs/promises";
import { capture, expect, test } from "./fixtures.mjs";

// Catch lost component styling/imports, clipped long labels, and styles that
// obscure the padded summary target, native controls, or keyboard focus.
for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: disclosure panels keep padded targets, focus and content reachable`, async ({
		page,
		browserName,
	}, testInfo) => {
		await page.goto("/disclosures.html");
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
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "100%";
		});
		await page.locator("main").evaluate((el) => {
			el.innerHTML = `<section id="disclosure-fixture"><details class="disclosure" id="first"><summary><h2 class="disclosure-label disclosure-title">Account</h2></summary><div class="disclosure-content"><p>Account preferences</p><label><input type="checkbox"> Show hints</label></div></details><details class="disclosure" id="second" open><summary><span class="disclosure-label"><span class="disclosure-title">Filters</span><span class="disclosure-description">All stores · All categories</span></span></summary><div class="disclosure-content"><p>Shopping preferences</p><details class="disclosure" id="nested"><summary><span class="disclosure-label">More information</span></summary><div class="disclosure-content"><p>Nested information</p></div></details></div></details><details id="plain"><summary>Unstyled disclosure</summary><p>Native defaults</p></details></section>`;
		});
		const first = page.locator("#first");
		const summary = first.locator("summary");
		const box = await summary.boundingBox();
		expect(box.height).toBeGreaterThanOrEqual(44);
		const panel = await first.boundingBox();
		expect(Math.abs(box.width - (panel.width - 2))).toBeLessThan(1);
		await expect(first).toHaveCSS("border-top-width", "1px");
		await expect(summary.locator("h2")).toHaveCSS("border-bottom-width", "0px");
		await expect(summary.locator("h2")).toHaveCSS("margin-top", "0px");
		await expect(page.locator("#plain")).toHaveCSS("border-top-width", "0px");
		await expect(page.locator("#plain > summary")).toHaveCSS(
			"display",
			"list-item",
		);
		// Activate the padded right edge, away from the text and chevron.
		await summary.click({ position: { x: box.width - 4, y: box.height / 2 } });
		await expect(first).toHaveAttribute("open", "");
		await expect(summary).toHaveCSS("border-bottom-width", "1px");
		await first.getByLabel("Show hints").check();
		await summary.press("Enter");
		await expect(first).not.toHaveAttribute("open");
		await summary.press("Space");
		await expect(first.getByLabel("Show hints")).toBeChecked();
		await expect(page.locator("#second")).toHaveAttribute("open", "");
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		const backTab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Shift+Tab"
				: "Shift+Tab";
		await page.keyboard.press(tab);
		await page.keyboard.press(backTab);
		await expect(summary).toBeFocused();
		await expect(summary).toHaveCSS("outline-style", "solid");
		await page.mouse.move(0, 0);
		const resting = await summary.evaluate(
			(el) => getComputedStyle(el).backgroundColor,
		);
		await summary.hover();
		expect(
			await summary.evaluate((el) => getComputedStyle(el).backgroundColor),
		).not.toBe(resting);
		await page.locator("#nested > summary").press("Space");
		await expect(page.locator("#nested .disclosure-content")).toBeVisible();
		await capture(
			testInfo,
			page.locator("#disclosure-fixture"),
			`${source}-disclosures`,
		);
		await page.setViewportSize({ width: 320, height: 720 });
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "200%";
		});
		await page
			.locator("#first .disclosure-title, #nested .disclosure-label")
			.evaluateAll((els) => {
				for (const el of els)
					el.textContent =
						"AccountAndHouseholdShoppingPreferencesAcrossMultipleDevicesWithoutSpaces";
			});
		expect(
			await page
				.locator("#disclosure-fixture")
				.evaluate((el) => el.scrollWidth - el.clientWidth),
		).toBeLessThanOrEqual(1);
		const label = await summary.locator(".disclosure-label").boundingBox();
		const wrapped = await summary.boundingBox();
		expect(label.x + label.width).toBeLessThan(wrapped.x + wrapped.width - 8);
		await capture(
			testInfo,
			page.locator("#disclosure-fixture"),
			`${source}-disclosures-reflow`,
		);
		await page.emulateMedia({ forcedColors: "active" });
		await summary.press("Enter");
		await page.keyboard.press(tab);
		await page.keyboard.press(backTab);
		await expect(summary).toBeFocused();
		await expect(summary).toHaveCSS("outline-style", "solid");
		await expect(first).toHaveCSS("border-style", "solid");
	});
}
