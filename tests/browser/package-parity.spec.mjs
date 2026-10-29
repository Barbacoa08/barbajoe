import { expect, loadPackage, test } from "./fixtures.mjs";

test("@once source and package agree on both theme palettes", async ({
	page,
}) => {
	const palette = async () => {
		await page
			.locator("body")
			.evaluate((el) =>
				el.insertAdjacentHTML(
					"beforeend",
					'<span id="palette-probe" style="color:var(--barba-color-text);background:var(--barba-color-bg)">Palette</span>',
				),
			);
		return page
			.locator("#palette-probe")
			.evaluate((el) => ({
				text: getComputedStyle(el).color,
				background: getComputedStyle(el).backgroundColor,
			}));
	};
	const colors = [];
	for (const colorScheme of ["light", "dark"]) {
		await page.emulateMedia({ colorScheme });
		await page.goto("/index.html");
		const source = await palette();
		await loadPackage(page);
		const built = await palette();
		expect(built).toEqual(source);
		colors.push(built.background);
	}
	expect(colors[0]).not.toBe(colors[1]);
});
