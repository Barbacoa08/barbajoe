import { expect, test } from "@playwright/test";

for (const path of ["foundations.html", "package-theme.html"]) {
	test(`motion contract in ${path} @light`, async ({ page }) => {
		await page.goto(`/${path}`);
		const tokens = await page.evaluate(() => {
			const style = getComputedStyle(document.documentElement);
			return Object.fromEntries(
				[
					"duration-fast",
					"duration-base",
					"easing-decelerate",
					"easing-emphasized",
				].map((name) => [
					name,
					style.getPropertyValue(`--barba-motion-${name}`).trim(),
				]),
			);
		});
		const ms = (value) =>
			Number.parseFloat(value) * (value.endsWith("ms") ? 1 : 1000);
		expect(ms(tokens["duration-fast"])).toBe(150);
		expect(ms(tokens["duration-base"])).toBe(300);
		expect(tokens["easing-decelerate"]).toMatch(/^cubic-bezier\(/);
		const points = tokens["easing-decelerate"]
			.match(/-?\d*\.?\d+/g)
			.map(Number);
		expect(points).toEqual([0.333333, 1, 0.666667, 1]);
		// CSS solves x(parameter)=elapsed progress before evaluating y(parameter).
		const coordinate = (t, a, b) =>
			3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
		for (let step = 0; step <= 100; step++) {
			const progress = step / 100;
			let low = 0;
			let high = 1;
			for (let i = 0; i < 40; i++) {
				const middle = (low + high) / 2;
				if (coordinate(middle, points[0], points[2]) < progress) low = middle;
				else high = middle;
			}
			const value = coordinate((low + high) / 2, points[1], points[3]);
			expect(Math.abs(value - (1 - (1 - progress) ** 3))).toBeLessThan(
				0.000001,
			);
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThanOrEqual(1);
		}
		expect(
			tokens["easing-emphasized"].match(/-?\d*\.?\d+/g).map(Number),
		).toEqual([0, 0.2, 0.5, 3]);
	});
}
