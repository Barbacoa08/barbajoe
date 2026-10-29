import {
	expect,
	expectNoPageOverflow,
	loadPackage,
	test,
} from "./fixtures.mjs";

test("@light package buttons preserve interaction, disabled state, and a consumer override", async ({
	page,
	browserName,
}) => {
	await loadPackage(page);
	await page.locator("body").evaluate((el) => {
		el.innerHTML =
			'<button id="before">Before</button><button id="action">Action</button><button disabled id="disabled">Unavailable</button><button class="custom">Custom</button>';
	});
	const action = page.locator("#action");
	const rest = await action.evaluate(
		(el) => getComputedStyle(el).backgroundColor,
	);
	expect(rest).not.toBe("rgba(0, 0, 0, 0)");
	await action.hover();
	expect(
		await action.evaluate((el) => getComputedStyle(el).backgroundColor),
	).not.toBe(rest);
	await page.mouse.move(0, 0);
	await page.locator("#before").focus();
	await page.keyboard.press(
		browserName === "webkit" && process.platform === "darwin"
			? "Alt+Tab"
			: "Tab",
	);
	await expect(action).toBeFocused();
	await expect(action).toHaveCSS("outline-style", "solid");
	await expect(page.locator("#disabled")).toBeDisabled();
	await page.evaluate(() => {
		const style = document.createElement("style");
		style.textContent = ".custom { background: rgb(1, 2, 3); }";
		document.head.prepend(style);
	});
	await expect(page.locator(".custom")).toHaveCSS(
		"background-color",
		"rgb(1, 2, 3)",
	);
});

test("@light adjacent chip targets stay separate and support selection and removal", async ({
	page,
}) => {
	await loadPackage(page, "/chips.html");
	await page.setViewportSize({ width: 320, height: 720 });
	const panel = page.locator("[data-chip-demo]").first();
	await panel.evaluate((el) => (el.style.padding = "var(--barba-space-2)"));
	const targets = panel.locator(".chip-list button");
	const boxes = await targets.evaluateAll((els) =>
		els.map((el) => {
			const r = el.getBoundingClientRect(),
				s = getComputedStyle(el),
				p = getComputedStyle(el, "::after");
			if (p.content === "none")
				return { x: r.x, y: r.y, w: r.width, h: r.height };
			return {
				x: r.x + parseFloat(s.borderLeftWidth) + parseFloat(p.left),
				y: r.y + parseFloat(s.borderTopWidth) + parseFloat(p.top),
				w: parseFloat(p.width),
				h: parseFloat(p.height),
			};
		}),
	);
	for (let i = 0; i < boxes.length; i++) {
		const a = boxes[i];
		expect(a.w).toBeGreaterThanOrEqual(35.999);
		expect(a.h).toBeGreaterThanOrEqual(35.999);
		for (const b of boxes.slice(i + 1))
			expect(
				Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0.5 &&
					Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0.5,
			).toBe(false);
	}
	const filter = panel.getByRole("button", { name: "Pantry", exact: true });
	await filter.press("Space");
	await expect(filter).toHaveAttribute("aria-pressed", "true");
	await panel
		.getByRole("button", { name: "Remove Produce", exact: true })
		.press("Enter");
	await expect(
		panel.getByRole("button", { name: "Remove Pantry", exact: true }),
	).toBeFocused();
	await expectNoPageOverflow(page);
});

test("@light plain and filled disclosures keep closed controls out of keyboard navigation", async ({
	page,
	browserName,
}) => {
	await loadPackage(page);
	await page.locator("body").evaluate((el) => {
		el.innerHTML = ["disclosure", "disclosure disclosure--filled"]
			.map(
				(classes, i) =>
					`<details class="${classes}"><summary><span class="disclosure-label">Panel ${i}</span></summary><div class="disclosure-content"><button>Inside ${i}</button></div></details><button>After ${i}</button>`,
			)
			.join("");
	});
	const tab =
		browserName === "webkit" && process.platform === "darwin"
			? "Alt+Tab"
			: "Tab";
	for (const [i, panel] of (await page.locator("details").all()).entries()) {
		const summary = panel.locator("summary"),
			inside = panel.getByRole("button");
		expect((await summary.boundingBox()).height).toBeGreaterThanOrEqual(44);
		await summary.focus();
		await page.keyboard.press(tab);
		await expect(
			page.getByRole("button", { name: `After ${i}`, exact: true }),
		).toBeFocused();
		await summary.press("Enter");
		await expect(inside).toBeVisible();
		await page.keyboard.press(tab);
		await expect(inside).toBeFocused();
		await summary.press("Enter");
		await expect(inside).toBeHidden();
	}
});
