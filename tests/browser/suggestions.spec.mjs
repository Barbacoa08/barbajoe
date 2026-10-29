import { readFile } from "node:fs/promises";
import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

async function fixture(page, packaged) {
	await page.goto(packaged ? "/package-theme.html" : "/forms.html");
	await page.locator("html").evaluate((el) => {
		el.style.fontSize = "16px";
	});
	await page
		.locator('link[rel="stylesheet"]:not([data-library]), style')
		.evaluateAll((elements) => {
			for (const element of elements) element.remove();
		});
	if (packaged) {
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
	await page.locator("main").evaluate((element) => {
		element.innerHTML = `<label for="query">Find a destination</label><input id="query" type="text">
<div class="suggestion-panel" id="panel"><ul role="listbox" aria-label="Destinations">
<li role="presentation"><button type="button" class="suggestion-option" role="option" aria-selected="false" tabindex="-1">Orchard</button></li>
<li role="presentation"><button type="button" class="suggestion-option" role="option" aria-selected="true" tabindex="-1">River walk<span class="suggestion-secondary">A quieter route</span></button></li>
<li role="presentation"><button type="button" class="suggestion-option" role="option" aria-selected="false" tabindex="-1">An exceptionally long destination name with several words and UnbrokenDestinationNameUnbrokenDestinationNameUnbrokenDestinationName</button></li>
<li role="presentation"><button type="button" class="suggestion-option" role="option" aria-selected="false" disabled>Unavailable</button></li>
<li role="presentation"><button type="button" class="suggestion-option" role="option" hidden>Hidden option</button></li></ul>
<p class="suggestion-empty" hidden>No destinations available.</p></div>
<button type="button" id="ordinary" role="option">Unrelated option</button><ul id="ordinary-list"><li>Ordinary list</li></ul><select aria-label="Native selection"><option>Native option</option></select>`;
	});
}

for (const packaged of [false, true]) {
	const build = packaged ? "package" : "source";
	for (const colorScheme of ["light", "dark"]) {
		test(`${packaged ? "@light " : ""}${build} ${colorScheme}: opt-in suggestion geometry and states preserve nearby controls`, async ({
			page,
		}, testInfo) => {
			await page.emulateMedia({ colorScheme });
			await fixture(page, packaged);
			const rows = page.locator("#panel .suggestion-option");
			const row = rows.first();
			await expect(
				page.getByRole("listbox", { name: "Destinations" }),
			).toBeVisible();
			await expect(row).toHaveCSS("font-weight", "400");
			await expect(row).toHaveCSS("border-top-width", "0px");
			await expect(row).toHaveCSS("text-align", "start");
			await expect(page.locator("#panel > ul")).toHaveCSS(
				"list-style-type",
				"none",
			);
			await expect(page.locator("#panel > ul")).toHaveCSS("padding-top", "4px");
			await expect(row).toHaveCSS("padding-top", "8px");
			await expect(row).toHaveCSS("padding-inline-start", "12px");
			const size = await row.boundingBox();
			expect(size.height).toBeGreaterThanOrEqual(44);
			expect(size.width).toBeCloseTo(
				await page.locator("#panel > ul").evaluate((el) => el.clientWidth - 8),
				0,
			);
			await expect(page.locator("#ordinary")).toHaveCSS(
				"border-top-width",
				"1px",
			);
			await expect(page.locator("#ordinary")).toHaveCSS("font-weight", "600");
			await expect(page.locator("#ordinary-list")).not.toHaveCSS(
				"list-style-type",
				"none",
			);
			await expect(
				page.getByRole("combobox", { name: "Native selection" }),
			).toHaveCSS("border-top-width", "1px");
			await expect(rows.last()).toBeHidden();
			const background = await row.evaluate(
				(el) => getComputedStyle(el).backgroundColor,
			);
			await row.hover();
			await expect(row).not.toHaveCSS("background-color", background);
			await page.mouse.move(0, 0);
			await expect(rows.nth(1)).not.toHaveCSS("background-color", background);
			const disabled = rows.nth(3);
			await disabled.hover();
			await expect(disabled).toHaveCSS("background-color", background);
			await expect(disabled).toBeDisabled();
			await row.focus();
			await page.keyboard.press("ArrowRight");
			await expect(row).toHaveCSS("outline-style", "solid");
			await capture(testInfo, page.locator("#panel"), `${build}-suggestions`);
			await page.locator("#panel").evaluate((el) => {
				el.hidden = true;
			});
			await expect(row).toBeHidden();
		});
	}

	test(`${build}: suggestion content reflows at 320px in both directions with enlarged text`, async ({
		page,
	}) => {
		await fixture(page, packaged);
		await page.setViewportSize({ width: 320, height: 844 });
		for (const direction of ["ltr", "rtl"]) {
			for (const fontSize of ["16px", "32px"]) {
				await page.locator("html").evaluate(
					(el, settings) => {
						el.dir = settings.direction;
						el.style.fontSize = settings.fontSize;
					},
					{ direction, fontSize },
				);
				await expectNoPageOverflow(page);
				const long = page.locator(".suggestion-option").nth(2);
				expect(
					await long.evaluate((el) => el.scrollWidth - el.clientWidth),
				).toBeLessThanOrEqual(1);
				await expect(long).toHaveCSS("text-align", "start");
			}
		}
		await page.locator("#panel ul").evaluate((el) => {
			el.hidden = true;
		});
		await page.locator(".suggestion-empty").evaluate((el) => {
			el.hidden = false;
		});
		await expect(page.locator(".suggestion-empty")).toBeVisible();
		await expectNoPageOverflow(page);
	});
}

for (const [file, prefix] of [
	["forms.html", "suggestion"],
	["package-theme.html", "packaged-suggestion"],
]) {
	test(`${file}: example keeps keyboard and pointer selection on the input and exposes empty results`, async ({
		page,
	}) => {
		await page.goto(`/${file}`);
		const demo = page.locator("[data-suggestion-demo]");
		const input = demo.getByRole("combobox");
		await input.focus();
		await input.press("ArrowDown");
		await expect(input).toHaveAttribute(
			"aria-activedescendant",
			`${prefix}-orchard`,
		);
		await expect(input).toBeFocused();
		await expect(input).toHaveCSS("outline-style", "solid");
		await input.press("ArrowDown");
		await expect(input).toHaveAttribute(
			"aria-activedescendant",
			`${prefix}-river`,
		);
		await input.press("ArrowUp");
		await input.press("Enter");
		await expect(input).toHaveValue("Orchard");
		await expect(demo.locator(".suggestion-panel")).toBeHidden();
		await expect(input).not.toHaveAttribute("aria-activedescendant");
		await input.fill("River");
		await demo
			.getByRole("option", { name: "River walk A quieter route" })
			.click();
		await expect(input).toHaveValue("River walk");
		await expect(input).toBeFocused();
		await input.fill("No match");
		await expect(demo.locator(".suggestion-empty")).toBeVisible();
		await expect(demo.getByRole("option")).toHaveCount(0);
		await input.press("ArrowDown");
		await expect(input).not.toHaveAttribute("aria-activedescendant");
		await input.press("Escape");
		await expect(input).toHaveAttribute("aria-expanded", "false");
		await input.fill("");
		await input.press("ArrowUp");
		await expect(input).toHaveAttribute(
			"aria-activedescendant",
			`${prefix}-long`,
		);
		await input.press("Tab");
		await expect(demo.locator(".suggestion-panel")).toBeHidden();
	});

	test(`${file}: forced colors distinguish the arrow-controlled active option while focus remains on input`, async ({
		page,
	}, testInfo) => {
		await page.emulateMedia({ forcedColors: "active" });
		test.skip(
			!(await page.evaluate(
				() => matchMedia("(forced-colors: active)").matches,
			)),
			"Browser engine does not implement forced-colors emulation.",
		);
		await page.goto(`/${file}`);
		const demo = page.locator("[data-suggestion-demo]");
		const input = demo.getByRole("combobox");
		const first = demo.locator(`#${prefix}-orchard`);
		const second = demo.locator(`#${prefix}-river`);
		await input.focus();
		await input.press("ArrowDown");
		await expect(input).toBeFocused();
		await expect(first).toHaveCSS("outline-style", "solid");
		await expect(first).toHaveCSS("outline-width", "2px");
		await expect(first).toHaveCSS("outline-offset", "-2px");
		await expect(second).toHaveCSS("outline-style", "none");
		await input.press("ArrowDown");
		await expect(input).toBeFocused();
		await expect(first).toHaveCSS("outline-style", "none");
		await expect(second).toHaveCSS("outline-style", "solid");
		await input.press("ArrowUp");
		await expect(input).toHaveAttribute(
			"aria-activedescendant",
			`${prefix}-orchard`,
		);
		await expect(first).toHaveCSS("outline-style", "solid");
		await capture(testInfo, demo, `${file}-forced-colors-input-focus`);
	});
}
