import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });
for (const path of ["foundations.html", "package-theme.html"]) {
	test(`repositioning, fade, and live reduction in ${path}`, async ({
		page,
	}) => {
		await page.goto(`/${path}`);
		const demo = page.locator("[data-motion-demo]");
		await expect(demo).toBeVisible();
		// Freeze effects synchronously when created, avoiding wall-clock assertions.
		await page.evaluate(() => {
			const animate = Element.prototype.animate;
			Element.prototype.animate = function (...args) {
				const animation = animate.apply(this, args);
				animation.pause();
				return animation;
			};
		});
		const first = demo.getByRole("button", {
			name: "Move Apricot to end",
			exact: true,
		});
		await first.focus();
		await page.keyboard.press("Enter");
		await expect(first).toBeFocused();
		await expect(demo.locator("li").last()).toHaveText("Apricot");
		const effects = await demo.evaluate((node) =>
			node.getAnimations({ subtree: true }).map((a) => {
				const timing = a.effect.getTiming();
				a.currentTime = 150;
				return {
					duration: timing.duration,
					easing: timing.easing,
					frames: a.effect.getKeyframes(),
					progress: a.effect.getComputedTiming().progress,
				};
			}),
		);
		expect(effects.length).toBeGreaterThan(0);
		for (const effect of effects) {
			expect(effect.duration).toBe(300);
			expect(effect.easing).toMatch(/^cubic-bezier\(/);
			expect(effect.progress).toBeCloseTo(0.875, 5);
			expect(effect.frames[0].transform).not.toBe(effect.frames[1].transform);
		}
		await demo.getByRole("button", { name: "Add or replay entry" }).click();
		const fade = await demo
			.locator("li")
			.last()
			.evaluate((node) =>
				node.getAnimations().map((a) => ({
					duration: a.effect.getTiming().duration,
					easing: a.effect.getTiming().easing,
					frames: a.effect.getKeyframes(),
				})),
			);
		expect(fade).toHaveLength(1);
		expect(fade[0].duration).toBe(150);
		expect(fade[0].easing).toBe("linear");
		expect(fade[0].frames.map((f) => f.opacity)).toEqual(["0", "1"]);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect(demo.getByRole("status")).toContainText("Reduced motion");
		await expect
			.poll(() =>
				demo.evaluate((node) => node.getAnimations({ subtree: true }).length),
			)
			.toBe(0);
		await demo.getByRole("button", { name: "Move first to end" }).click();
		await demo.getByRole("button", { name: "Add or replay entry" }).click();
		expect(
			await demo.evaluate(
				(node) => node.getAnimations({ subtree: true }).length,
			),
		).toBe(0);
		await expect(demo.locator("li")).toHaveCount(5);
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await demo
			.getByRole("checkbox", { name: "Use instant comparison" })
			.check();
		await demo.getByRole("button", { name: "Move first to end" }).click();
		expect(
			await demo.evaluate(
				(node) => node.getAnimations({ subtree: true }).length,
			),
		).toBe(0);
	});

	test(`scoped overrides, rapid actions, and reflow in ${path}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 800 });
		await page.goto(`/${path}`);
		const demo = page.locator("[data-motion-demo]");
		await expect(demo).toBeVisible();
		await demo.evaluate((node) => {
			node.dir = "rtl";
			document.documentElement.style.fontSize = "200%";
			node.style.setProperty("--barba-motion-duration-base", "2s");
			node.style.setProperty("--barba-motion-duration-fast", "1s");
			node.style.setProperty(
				"--barba-motion-easing-decelerate",
				"cubic-bezier(0, 0, 1, 1)",
			);
		});
		await demo.getByRole("button", { name: "Move first to end" }).click();
		expect(
			await demo.evaluate((node) =>
				node
					.getAnimations({ subtree: true })
					.map((a) => a.effect.getTiming().duration),
			),
		).toContain(2000);
		await demo.getByRole("button", { name: "Move first to end" }).click();
		await demo.getByRole("button", { name: "Add or replay entry" }).click();
		expect(
			await demo
				.locator("li")
				.last()
				.evaluate(
					(node) => node.getAnimations()[0].effect.getTiming().duration,
				),
		).toBe(1000);
		await demo.evaluate((node) => {
			node.style.setProperty("--barba-motion-duration-base", "0s");
			node.style.setProperty("--barba-motion-duration-fast", "0ms");
		});
		await demo.getByRole("button", { name: "Move first to end" }).click();
		await demo.getByRole("button", { name: "Add or replay entry" }).click();
		expect(
			await demo.evaluate(
				(node) => node.getAnimations({ subtree: true }).length,
			),
		).toBe(0);
		expect(
			await demo.evaluate((node) => {
				const box = node.getBoundingClientRect();
				return (
					node.scrollWidth <= node.clientWidth &&
					box.left >= 0 &&
					box.right <= innerWidth
				);
			}),
		).toBe(true);
	});
}
