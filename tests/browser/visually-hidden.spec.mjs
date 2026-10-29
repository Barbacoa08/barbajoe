import { readFile } from "node:fs/promises";
import { expect, test } from "./fixtures.mjs";

// Catch a missing bundle import, visually exposed context, or hiding methods
// that remove the label from the accessible name instead of just the layout.
for (const packaged of [true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: @light hidden context names the visible action without enlarging it`, async ({
		page,
	}) => {
		await page.goto("/accessibility.html");
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
		await page.locator("main").evaluate((el) => {
			el.innerHTML = `<button id="named" type="button">Edit<span class="visually-hidden"> Weekend shopping supplies</span></button><button id="reference" type="button">Edit</button><p class="visually-hidden" role="status" aria-atomic="true">3 items shown.</p>`;
		});
		const named = page.getByRole("button", {
			name: "Edit Weekend shopping supplies",
			exact: true,
		});
		await expect(named).toBeVisible();
		await expect(page.getByRole("status")).toHaveText("3 items shown.");
		await expect(page.getByRole("status")).toMatchAriaSnapshot(
			"- status: 3 items shown.",
		);
		for (const size of ["100%", "200%"]) {
			await page.locator("html").evaluate((el, value) => {
				el.style.fontSize = value;
			}, size);
			const actual = await named.boundingBox();
			const reference = await page.locator("#reference").boundingBox();
			expect(Math.abs(actual.width - reference.width)).toBeLessThan(1);
			expect(Math.abs(actual.height - reference.height)).toBeLessThan(1);
			const label = named.locator("span");
			const bounds = await label.boundingBox();
			expect(bounds.width).toBeLessThanOrEqual(1);
			expect(bounds.height).toBeLessThanOrEqual(1);
			await expect(label).not.toHaveCSS("clip-path", "none");
		}
	});
}

// Catch discarded specimen scripts, duplicate announcements, and losing focus
// when a clear control hides itself. Speech output still needs a real AT check.
