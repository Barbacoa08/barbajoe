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
	test(`${source}: chip actions fit dense chips and preserve inset backgrounds`, async ({
		page,
		browserName,
	}, testInfo) => {
		await load(page, packaged);
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "100%";
		});
		await page.locator("main").evaluate((el) => {
			el.innerHTML = `<section id="chip-fixture"><p>Category: <span class="chip" id="standalone">Produce</span></p><ul class="chip-list"><li class="chip" id="info">Produce</li><li class="chip chip-removable" id="removable"><span>Produce</span><button type="button" data-barba-variant="icon" data-barba-shape="icon" data-barba-size="compact" aria-label="Remove Produce"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></li></ul><button type="button" class="chip" aria-pressed="true" id="selected">Produce</button><button type="button" data-barba-variant="icon" data-barba-shape="icon" id="large" aria-label="Close example">×</button><button type="button" data-barba-variant="icon" data-barba-shape="icon" disabled id="disabled" aria-label="Unavailable close">×</button></section>`;
		});
		for (const selector of [
			"#info",
			"#standalone",
			"#removable",
			"#selected",
			"#removable button",
		])
			expect((await page.locator(selector).boundingBox()).height).toBeCloseTo(
				24,
				1,
			);
		expect((await page.locator("#large").boundingBox()).height).toBeCloseTo(
			44,
			1,
		);
		for (const selector of ["#large", "#removable button"]) {
			const button = page.locator(selector);
			const color = await button.evaluate((el) => getComputedStyle(el).color);
			await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await button.hover();
			await expect(button).toHaveCSS("border-top-width", "2px");
			await expect(button).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
			await expect(button).toHaveCSS("background-clip", "padding-box");
			await expect(button).toHaveCSS("color", color);
			const contrast = await button.evaluate((el) => {
				const style = getComputedStyle(el);
				const luminance = (value) => {
					const values = value
						.match(/[\d.]+/g)
						.map(Number)
						.slice(0, 3);
					const channels = values
						.map((v) => (value.startsWith("color(") ? v : v / 255))
						.map((v) =>
							v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
						);
					return (
						channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
					);
				};
				const a = luminance(style.color),
					b = luminance(style.backgroundColor);
				return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
			});
			expect(contrast).toBeGreaterThanOrEqual(3);

			expect(
				await button.evaluate((el) => getComputedStyle(el).backgroundColor),
			).not.toBe("rgba(0, 0, 0, 0)");
			await page.mouse.move(0, 0);
		}
		expect(
			await page
				.locator("#selected")
				.evaluate((el) => getComputedStyle(el).boxShadow),
		).not.toBe("none");
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		await page.locator("#selected").focus();
		await page.keyboard.press(tab);
		await expect(page.locator("#large")).toBeFocused();
		await expect(page.locator("#large")).toHaveCSS("outline-style", "solid");
		await page.locator("#disabled").hover();
		await expect(page.locator("#disabled")).toHaveCSS(
			"background-color",
			"rgba(0, 0, 0, 0)",
		);
		await page.setViewportSize({ width: 320, height: 720 });
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "200%";
		});
		await page
			.locator("#info, #removable > span, #selected")
			.evaluateAll((els) => {
				for (const el of els)
					el.textContent =
						"ProduceForTheSharedWeekendShoppingListWithAnUnbrokenLabel";
			});
		expect(
			await page
				.locator("#chip-fixture")
				.evaluate((el) => el.scrollWidth - el.clientWidth),
		).toBeLessThanOrEqual(1);
		await capture(
			testInfo,
			page.locator("#chip-fixture"),
			`${source}-chips-reflow`,
		);
		await page.emulateMedia({ forcedColors: "active" });
		await expect(page.locator("#selected")).toHaveCSS("outline-style", "solid");
		await expect(page.locator("#removable")).toHaveCSS(
			"outline-style",
			"solid",
		);
	});
	test(`${source}: catalog filters and removal work by keyboard`, async ({
		page,
		browserName,
	}) => {
		await load(page, packaged);
		const panel = page.locator("[data-chip-demo]").first();
		const filter = panel.getByRole("button", { name: "Pantry", exact: true });
		await filter.press("Space");
		await expect(filter).toHaveAttribute("aria-pressed", "true");
		await expect(panel.locator("[data-chip-results]")).toContainText("Rice");
		await panel
			.getByRole("button", { name: "Remove Produce", exact: true })
			.press("Enter");
		await expect(
			panel.getByRole("button", { name: "Remove Pantry", exact: true }),
		).toBeFocused();
		await panel
			.getByRole("button", { name: "Remove Pantry", exact: true })
			.press("Space");
		await expect(
			panel.getByRole("button", { name: "Restore selections", exact: true }),
		).toBeFocused();
		await panel
			.getByRole("button", { name: "Restore selections", exact: true })
			.click();
		await expect(
			panel.getByRole("button", { name: "Remove Produce", exact: true }),
		).toBeVisible();
		await expect(
			panel.getByRole("button", { name: "Remove Locked", exact: true }),
		).toBeDisabled();
		const clear = page.getByRole("button", {
			name: "Clear item to clear",
			exact: true,
		});
		await clear.hover();
		await expect(clear).toHaveCSS("border-top-width", "2px");
		await expect(clear).toHaveCSS("background-clip", "padding-box");
		await expect(clear).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
		await page.locator("#inline-clear").focus();
		await page.keyboard.press(
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab",
		);
		await expect(clear).toBeFocused();
		await page.keyboard.press("Space");
		await expect(page.locator("#inline-clear")).toBeFocused();
		await expect(clear).toBeHidden();
	});
}
