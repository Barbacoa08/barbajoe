import { readFile } from "node:fs/promises";
import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

async function fixture(page, packaged) {
	await page.goto("/index.html");
	if (packaged) {
		await page
			.locator('link[rel="stylesheet"], style')
			.evaluateAll((elements) => {
				for (const element of elements) element.remove();
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
	await page.locator("body").evaluate((body) => {
		body.innerHTML = `<main>
  <button type="button" data-barba-variant="text" id="text">Edit</button>
  <button type="button" data-barba-variant="text" disabled id="text-disabled">Edit unavailable</button>
  <button type="button" data-barba-intent="danger" id="danger">Delete</button>
  <button type="submit" data-barba-intent="danger" disabled id="danger-disabled">Delete unavailable</button>
  <button type="submit" class="consumer-action">Custom submit</button>
  <button type="reset" class="consumer-action">Custom reset</button>
  <input type="button" class="consumer-action" value="Custom input button" />
  <input type="submit" class="consumer-action" value="Custom input submit" />
  <input type="reset" class="consumer-action" value="Custom input reset" />
  <button type="button" data-barba-variant="icon" data-barba-shape="icon" class="consumer-action" aria-label="Custom close">×</button>
  <button type="button" data-barba-variant="icon" data-barba-shape="icon" data-barba-size="compact" class="consumer-action" aria-label="Custom remove">×</button>
  <button type="button" class="consumer-action" disabled>Custom disabled</button>
  <input type="submit" class="consumer-action" disabled value="Custom disabled input" />
  <span id="palette" style="color:var(--barba-color-danger);background:var(--barba-color-surface);border:1px solid var(--barba-color-link-hover)"></span>
  </main>`;
		const style = document.createElement("style");
		// Deliberately before the library: specificity, not import order, enables customization.
		style.textContent =
			".consumer-action { background-color: transparent; border-color: transparent; color: var(--barba-color-link); opacity: 0.8; }";
		document.head.prepend(style);
	});
}

for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: one application class controls button appearance across states`, async ({
		page,
		browserName,
	}, testInfo) => {
		await fixture(page, packaged);
		for (const control of await page.locator(".consumer-action").all()) {
			await expect(control).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(control).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
			await expect(control).toHaveCSS("opacity", "0.8");
			await control.hover();
			await expect(control).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(control).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
			if (await control.isEnabled()) {
				await page.mouse.down();
				await expect(control).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
				await page.mouse.up();
				// Approach this control from its previous keyboard stop; tabbing
				// past the final control can transfer focus to browser chrome.
				const tab =
					browserName === "webkit" && process.platform === "darwin"
						? "Alt+Tab"
						: "Tab";
				await control.focus();
				await page.keyboard.press(`Shift+${tab}`);
				await page.keyboard.press(tab);
				await expect(control).toBeFocused();
				await expect(control).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
				await expect(control).toHaveCSS("outline-style", "solid");
			}
		}
		await capture(
			testInfo,
			page.locator("main"),
			`${source}-consumer-overrides`,
		);
	});
	test(`${source}: text actions reveal their face and border only during interaction`, async ({
		page,
	}, testInfo) => {
		await fixture(page, packaged);
		const text = page.locator("#text");
		await expect(text).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(text).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
		expect((await text.boundingBox()).height).toBeGreaterThanOrEqual(44);
		await text.hover();
		const hoverColor = await page
			.locator("#palette")
			.evaluate((el) => getComputedStyle(el).borderTopColor);
		await expect(text).toHaveCSS("border-top-color", hoverColor);
		await expect(text).toHaveCSS("color", hoverColor);
		expect(
			await text.evaluate((el) => getComputedStyle(el).backgroundColor),
		).not.toBe("rgba(0, 0, 0, 0)");
		await page.mouse.down();
		await expect(text).toHaveCSS("border-top-color", hoverColor);
		await page.mouse.up();
		await page.mouse.move(0, 0);
		await page.keyboard.press("Tab");
		await text.focus();
		await expect(text).toHaveCSS("outline-style", "solid");
		await expect(text).toHaveCSS("border-top-color", hoverColor);
		await capture(testInfo, text, `${source}-text-focus`);
		const disabled = page.locator("#text-disabled");
		await disabled.hover();
		await expect(disabled).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(disabled).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
		await expect(disabled).toBeDisabled();
	});
	test(`${source}: danger is text at rest and outlined on hover or disabled`, async ({
		page,
	}, testInfo) => {
		await fixture(page, packaged);
		const palette = await page.locator("#palette").evaluate((el) => ({
			red: getComputedStyle(el).color,
			surface: getComputedStyle(el).backgroundColor,
		}));
		const danger = page.locator("#danger");
		await expect(danger).toHaveCSS("color", palette.red);
		await expect(danger).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(danger).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
		await danger.hover();
		await expect(danger).toHaveCSS("background-color", palette.surface);
		await expect(danger).toHaveCSS("border-top-color", palette.red);
		await page.mouse.down();
		await expect(danger).toHaveCSS("border-top-color", palette.red);
		await page.mouse.up();
		await page.mouse.move(0, 0);
		await page.keyboard.press("Tab");
		await danger.focus();
		await expect(danger).toHaveCSS("outline-style", "solid");
		await expect(danger).toHaveCSS("border-top-color", palette.red);
		await capture(testInfo, danger, `${source}-danger-focus`);
		const disabled = page.locator("#danger-disabled");
		await disabled.hover();
		await expect(disabled).toHaveCSS("background-color", palette.surface);
		await expect(disabled).toHaveCSS("border-top-color", palette.red);
		await expect(disabled).toHaveCSS("opacity", "0.65");
		await expect(disabled).toBeDisabled();
		await page.setViewportSize({ width: 320, height: 844 });
		await expectNoPageOverflow(page);
	});
}

test("built specimen actions provide local feedback", async ({ page }) => {
	await page.goto("/index.html");
	for (const panel of await page
		.locator(".specimen-theme")
		.filter({ has: page.locator("[data-action-status]") })
		.all()) {
		await panel.getByRole("button", { name: "Edit", exact: true }).click();
		await expect(panel.locator("[data-action-status]")).toContainText("Edit");
		await panel
			.getByRole("button", { name: "Delete", exact: true })
			.and(page.locator(":enabled"))
			.click();
		await expect(panel.locator("[data-action-status]")).toContainText("Delete");
	}
});
