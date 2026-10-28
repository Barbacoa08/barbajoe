import { readFile } from "node:fs/promises";
import { expect, test } from "./fixtures.mjs";

// Catch a missing bundle import, visually exposed context, or hiding methods
// that remove the label from the accessible name instead of just the layout.
for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: hidden context names the visible action without enlarging it`, async ({
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
test("catalog: hidden-text examples preserve names, concise results and clear focus", async ({
	page,
	browserName,
}) => {
	await page.goto("/accessibility.html#visually-hidden-heading");
	const examples = page.locator("#visually-hidden-examples");
	for (const theme of ["light", "dark"]) {
		const statusPanel = examples.locator(
			`[data-hidden-demo="status"].specimen-theme-${theme}`,
		);
		const select = statusPanel.getByLabel("Category", { exact: true });
		const status = statusPanel.getByRole("status");
		await expect(status).toHaveCount(1);
		await expect(status).toBeEmpty();
		await select.focus();
		await select.selectOption("pantry");
		await expect(select).toBeFocused();
		await expect(status).toHaveText("1 of 3 items shown.");
		await expect(statusPanel.locator("[data-category]:visible")).toHaveText([
			"Oats",
		]);
		await select.selectOption("all");
		await expect(status).toHaveText("3 of 3 items shown.");
		await expect(statusPanel.locator("[data-category]:visible")).toHaveCount(3);
		const context = examples.locator(
			`[data-hidden-demo="context"].specimen-theme-${theme}`,
		);
		await expect(context.getByRole("status")).toBeEmpty();
		await context
			.getByRole("button", { name: "Edit Apples", exact: true })
			.press("Enter");
		await expect(context.getByRole("status")).toContainText(
			"Apples selected for editing.",
		);
		await context
			.getByRole("button", { name: "Edit Oats", exact: true })
			.press("Space");
		await expect(context.getByRole("status")).toContainText(
			"Oats selected for editing.",
		);
		const icon = examples.locator(
			`[data-hidden-demo="icon"].specimen-theme-${theme}`,
		);
		const input = icon.getByLabel("Item name", { exact: true });
		const clear = icon.getByRole("button", {
			name: "Clear item name",
			exact: true,
		});
		await input.focus();
		await page.keyboard.press(
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab",
		);
		await expect(clear).toBeFocused();
		await expect(clear).toHaveCSS("outline-style", "solid");
		await clear.press("Space");
		await expect(input).toHaveValue("");
		await expect(input).toBeFocused();
		await expect(clear).toHaveCount(0);
		await input.fill("New supplies");
		await expect(clear).toBeVisible();
	}
	const liveAncestors = await examples
		.locator('[role="status"]')
		.evaluateAll((els) =>
			els.some((el) =>
				el.parentElement.closest(
					'[aria-live], [role="status"], [role="alert"]',
				),
			),
		);
	expect(liveAncestors).toBe(false);
	await page.setViewportSize({ width: 320, height: 720 });
	expect(
		await examples.evaluate((el) => el.scrollWidth - el.clientWidth),
	).toBeLessThanOrEqual(1);
});
