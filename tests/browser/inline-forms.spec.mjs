import { readFile } from "node:fs/promises";
import { capture, expect, test } from "./fixtures.mjs";

async function load(page, packaged) {
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
}
for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: inline controls align and wrap without ancestry differences`, async ({
		page,
	}, testInfo) => {
		await load(page, packaged);
		await page.locator("main").evaluate((el) => {
			el.innerHTML = `<section id="inline-fixture" style="width:100%;max-width:700px"><form id="owner"><div class="inline-field"><label for="inside">Item name</label><div class="input-row"><input id="inside"><button>Add</button></div></div></form><div class="inline-field"><label for="outside">Alternative name</label><div class="input-row"><input id="outside" form="owner"><button form="owner">Add</button></div></div></section>`;
		});
		await page.setViewportSize({ width: 1280, height: 720 });
		for (const id of ["inside", "outside"]) {
			const input = page.locator(`#${id}`),
				button = input.locator("..").locator("button");
			const i = await input.boundingBox(),
				b = await button.boundingBox();
			expect(i.y).toBeCloseTo(b.y, 0);
			expect(i.height).toBeCloseTo(b.height, 0);
			expect(i.height).toBeGreaterThanOrEqual(44);
			await expect(page.locator(`label[for="${id}"]`)).toHaveCSS(
				"font-weight",
				"500",
			);
		}
		await page.setViewportSize({ width: 320, height: 720 });
		await page.locator("html").evaluate((el) => (el.style.fontSize = "200%"));
		await page.locator("label").evaluateAll((els) => {
			for (const el of els)
				el.textContent += " for the shared weekend shopping list";
		});
		for (const row of await page.locator(".input-row").all()) {
			const input = await row.locator("input").boundingBox(),
				button = await row.locator("button").boundingBox(),
				box = await row.boundingBox();
			expect(button.y).toBeGreaterThanOrEqual(input.y + input.height);
			expect(button.x + button.width).toBeCloseTo(box.x + box.width, 0);
			expect(
				await row.evaluate((el) => el.scrollWidth - el.clientWidth),
			).toBeLessThanOrEqual(1);
		}
		await capture(
			testInfo,
			page.locator("#inline-fixture"),
			`${source}-inline-reflow`,
		);
	});
}

for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: X clears by keyboard, preserves geometry, and synchronizes resets`, async ({
		page,
		browserName,
	}, testInfo) => {
		await load(page, packaged);
		// macOS WebKit includes buttons with Option-Tab, as in dialog tests.
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		const input = page.locator("#inline-clear");
		const clear = page.getByRole("button", {
			name: "Clear item to clear",
			exact: true,
		});
		const box = await input.boundingBox();
		const c = await clear.boundingBox();
		expect(c.width).toBeGreaterThanOrEqual(44);
		expect(c.height).toBeGreaterThanOrEqual(44);
		await input.focus();
		await page.keyboard.press(tab);
		await expect(clear).toBeFocused();
		expect(
			await clear.evaluate((el) => getComputedStyle(el).outlineStyle),
		).not.toBe("none");
		await page.keyboard.press("Space");
		await expect(input).toHaveValue("");
		await expect(input).toBeFocused();
		await expect(clear).toBeHidden();
		expect((await input.boundingBox()).width).toBeCloseTo(box.width, 0);
		await page.keyboard.press(tab);
		await expect(
			input
				.locator("..")
				.locator("..")
				.getByRole("button", { name: "Add", exact: true }),
		).toBeFocused();
		await input.fill("Coffee");
		await expect(clear).toBeVisible();
		await clear.hover();
		expect(
			await clear.evaluate((el) => getComputedStyle(el).borderTopColor),
		).toBe("rgba(0, 0, 0, 0)");
		await clear.click();
		await page
			.getByRole("button", { name: "Reset example", exact: true })
			.click();
		await expect(input).toHaveValue("Weekend supplies");
		await expect(clear).toBeVisible();
		await input.press("Enter");
		await expect(
			input
				.locator("..")
				.locator("..")
				.locator("..")
				.locator("..")
				.getByRole("status"),
		).toContainText("Weekend supplies");
		await expect(clear).toBeHidden();
		await expect(input).toBeFocused();
		await capture(
			testInfo,
			page.locator('[aria-labelledby="inline-forms-heading"]'),
			`${source}-inline-catalog`,
		);
	});
	test(`${source}: empty, standalone, associated and unavailable fields behave consistently`, async ({
		page,
	}) => {
		await load(page, packaged);
		await expect(
			page.getByRole("button", { name: "Clear new item", exact: true }),
		).toBeHidden();
		await page.locator("#inline-empty").fill("Tea");
		await expect(
			page.getByRole("button", { name: "Clear new item", exact: true }),
		).toBeVisible();
		await page
			.getByRole("button", { name: "Clear filter text", exact: true })
			.click();
		await expect(page.locator("#inline-standalone")).toBeFocused();
		await expect(page.locator("#inline-standalone")).toHaveValue("");
		const association = await page
			.locator("#inline-associated")
			.evaluate((el) => ({
				ancestor: el.closest("form")?.id || null,
				owner: el.form?.id,
			}));
		expect(association).toEqual({ ancestor: null, owner: "inline-owner" });
		await page.locator("#inline-associated").fill("Ground coffee");
		await page.locator("#inline-associated").press("Enter");
		await expect(page.locator("#inline-associated-status")).toContainText(
			"Ground coffee",
		);
		for (const label of ["Clear disabled item", "Clear read-only item"])
			await expect(
				page.getByRole("button", { name: label, exact: true }),
			).toBeDisabled();
		await page.setViewportSize({ width: 320, height: 720 });
		await page.locator("html").evaluate((el) => (el.style.fontSize = "200%"));
		const section = page.locator('[aria-labelledby="inline-forms-heading"]');
		expect(
			await section.evaluate((el) => el.scrollWidth - el.clientWidth),
		).toBeLessThanOrEqual(1);
		await page
			.getByRole("button", {
				name: "Open content-fit short dialog",
				exact: true,
			})
			.click();
		const close = page
			.locator("#content-fit-short")
			.getByRole("button", { name: "Close dialog", exact: true });
		const clearPath = await page
			.locator('[aria-controls="inline-clear"] path')
			.getAttribute("d");
		expect(await close.locator("path").getAttribute("d")).toBe(clearPath);
		await close.click();
		await expect(page.locator("#content-fit-short")).not.toBeVisible();
	});
}
