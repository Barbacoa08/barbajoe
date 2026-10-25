import { readFile } from "node:fs/promises";
import { expect, test } from "./fixtures.mjs";

for (const packaged of [false, true]) {
	test(`${packaged ? "package" : "source"}: ordinary hidden survives component display rules and reveal restores keyboard use`, async ({
		page,
		browserName,
	}) => {
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
		await page.locator("body").evaluate((el) => {
			el.innerHTML = `<button type="button" id="before">Before</button>
   <header class="site-header"><nav><ul class="site-header-links"><li><a id="link" href="#after" hidden>Hidden navigation</a></li><li><button type="button" id="action" hidden="hidden">Hidden action</button></li></ul></nav></header>
   <span class="chip" hidden id="info">Information</span>
   <button type="button" class="chip" aria-pressed="false" hidden="false" id="filter"><span class="chip-face">Filter</span></button>
   <ul class="chip-list" hidden id="list"><li class="chip">Hidden list</li></ul>
   <span class="chip chip-removable" hidden id="removable"><span>Produce</span><button type="button" id="remove" data-barba-variant="icon" data-barba-shape="icon" data-barba-size="compact" aria-label="Remove Produce">×</button></span>
   <form><div class="inline-field" hidden id="field"><label for="name">Name</label><input id="name"></div>
   <div class="input-row" hidden id="row"><input aria-label="Row" id="row-input"></div>
   <div class="input-action" hidden id="group"><input aria-label="Grouped" id="group-input"><button type="button" id="clear" data-barba-variant="icon" data-barba-shape="icon" aria-label="Clear grouped">×</button></div>
   <div class="input-action"><input aria-label="Visible" id="visible"><button type="button" id="empty-clear" hidden data-barba-variant="icon" data-barba-shape="icon">×</button></div></form>
   <button type="button" id="after">After</button><div id="findable" hidden="UNTIL-FOUND"><p>Findable text</p></div>`;
			document.querySelector("#action").addEventListener("click", (e) => {
				e.currentTarget.textContent = "Activated";
			});
			document.querySelector("#filter").addEventListener("click", (e) => {
				e.currentTarget.setAttribute("aria-pressed", "true");
			});
		});
		const hidden = page.locator("[hidden]:not(#findable)");
		for (const el of await hidden.all())
			expect
				.soft(
					await el.evaluate((el) => ({
						id: el.id,
						display: getComputedStyle(el).display,
					})),
				)
				.toMatchObject({ display: "none" });
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		await page.locator("#before").focus();
		await page.keyboard.press(tab);
		await expect(page.locator("#visible")).toBeFocused();
		await page.keyboard.press(tab);
		await expect(page.locator("#after")).toBeFocused();
		await hidden.evaluateAll((els) => {
			for (const el of els) el.removeAttribute("hidden");
		});
		for (const id of ["info", "list", "removable", "field", "row", "group"])
			await expect(page.locator(`#${id}`)).toBeVisible();
		await page.locator("#before").focus();
		for (const id of [
			"link",
			"action",
			"filter",
			"remove",
			"name",
			"row-input",
			"group-input",
			"clear",
			"visible",
			"empty-clear",
			"after",
		]) {
			await page.keyboard.press(tab);
			await expect(page.locator(`#${id}`)).toBeFocused();
		}
		await page.locator("#action").press("Enter");
		await expect(page.locator("#action")).toHaveText("Activated");
		await page.locator("#filter").press("Space");
		await expect(page.locator("#filter")).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		await page.locator("#group-input").fill("Revealed field");
		await expect(page.locator("#group-input")).toHaveValue("Revealed field");
		// Keep native find-in-page / fragment reveal available where implemented.
		if (
			await page
				.locator("#findable")
				.evaluate((el) => el.hidden === "until-found")
		) {
			await expect(page.locator("#findable")).not.toHaveCSS("display", "none");
			await page.evaluate(() => {
				location.hash = "findable";
			});
			await expect(page.locator("#findable")).not.toHaveAttribute("hidden");
			await expect(page.locator("#findable p")).toBeVisible();
		}
	});
}
