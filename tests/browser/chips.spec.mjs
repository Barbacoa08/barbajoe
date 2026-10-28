import { readFile } from "node:fs/promises";
import { capture, expect, test } from "./fixtures.mjs";

async function load(page, packaged, url = "/chips.html") {
	await page.goto(url);
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
		// Removing specimen styles also removes its panel padding. Supply only
		// the documented outer clearance; chip geometry still comes from the package.
		await page.locator("[data-chip-demo]").evaluateAll((panels) => {
			for (const panel of panels) panel.style.padding = "var(--barba-space-2)";
		});
	}
}
// Include the transparent hit region; border-box measurements alone miss it.
async function targetBoxes(targets) {
	return targets.evaluateAll((els) =>
		els.map((el) => {
			const r = el.getBoundingClientRect();
			const style = getComputedStyle(el);
			const hit = getComputedStyle(el, "::after");
			if (hit.content === "none")
				return {
					x: r.x,
					y: r.y,
					right: r.right,
					bottom: r.bottom,
					width: r.width,
					height: r.height,
				};
			const x = r.x + parseFloat(style.borderLeftWidth) + parseFloat(hit.left);
			const y = r.y + parseFloat(style.borderTopWidth) + parseFloat(hit.top);
			const width = parseFloat(hit.width),
				height = parseFloat(hit.height);
			return { x, y, right: x + width, bottom: y + height, width, height };
		}),
	);
}
// Allow only 0.001 CSS px of browser protocol rounding.
const minimumTarget = 36 - 0.001;

for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: animated disclosure filters retain their extended targets`, async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto("/disclosures.html");
		if (packaged) {
			await page.locator("link[data-library]").evaluate((el) => el.remove());
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
		for (const width of [356, 320, 390]) {
			await page.setViewportSize({ width, height: 844 });
			for (const dir of ["ltr", "rtl"]) {
				await page.locator("main").evaluate((el, direction) => {
					el.dir = direction;
				}, dir);
				for (const button of await page
					.locator(
						'section[aria-labelledby="disclosures-heading"] .specimen-filter-group button.chip',
					)
					.all()) {
					await button.evaluate((el) =>
						el.scrollIntoView({ block: "center", inline: "nearest" }),
					);
					const [hit] = await targetBoxes(button);
					const point = {
						x: dir === "ltr" ? hit.right - 1 : hit.x + 1,
						y: hit.y + hit.height / 2,
					};
					expect(
						await button.evaluate(
							(el, p) =>
								document.elementFromPoint(p.x, p.y)?.closest("button") === el,
							point,
						),
					).toBe(true);
				}
				const red = page
					.locator(
						'section[aria-labelledby="disclosures-heading"] .specimen-filter-group',
					)
					.getByRole("button", { name: "red", exact: true })
					.first();
				await red.evaluate((el) =>
					el.scrollIntoView({ block: "center", inline: "nearest" }),
				);
				const selected = await red.getAttribute("aria-pressed");
				const [hit] = await targetBoxes(red);
				await page.mouse.click(
					dir === "ltr" ? hit.right - 1 : hit.x + 1,
					hit.y + hit.height / 2,
				);
				await expect(red).toHaveAttribute(
					"aria-pressed",
					String(selected !== "true"),
				);
			}
		}
	});
	test(`${source}: wrapped targets preserve compact geometry in both directions`, async ({
		page,
	}) => {
		await load(page, packaged);
		await page.locator("main").evaluate((main) => {
			const names = [
				"A",
				"Pantry",
				"Frozen",
				"Dairy",
				"Bakery",
				"Snacks",
				"Drinks",
				"Household",
				"Pets",
				"Breakfast",
				"Weekend shopping for the whole household",
				"AnUnbrokenLabelThatMustWrapWithinTheAvailableSpace",
			];
			const selectable = (name) =>
				`<li><button type="button" class="chip" aria-pressed="false"><span class="chip-face">${name}</span></button></li>`;
			const removable = (name) =>
				`<li class="chip chip-removable"><span>${name}</span><button type="button" data-barba-variant="icon" data-barba-shape="icon" data-barba-size="compact" aria-label="Remove ${name}">×</button></li>`;
			main.innerHTML = `<section id="dense-chips" style="padding:var(--barba-space-2)"><ul class="chip-list">${names.map((n) => `<li class="chip">${n}</li>`).join("")}</ul><ul class="chip-list">${names.map(selectable).join("")}</ul><ul class="chip-list">${names.map(removable).join("")}</ul><ul class="chip-list">${names.map((n, i) => (i % 2 ? selectable(n) : removable(n))).join("")}</ul></section>`;
		});
		for (const direction of ["ltr", "rtl"]) {
			await page.locator("main").evaluate((el, dir) => {
				el.dir = dir;
			}, direction);
			for (const fontSize of [16, 32]) {
				await page.locator("html").evaluate((el, size) => {
					el.style.fontSize = `${size}px`;
				}, fontSize);
				await page.setViewportSize({ width: 320, height: 844 });
				for (const gap of [8, 12]) {
					await page.locator("#dense-chips").evaluate((el, space) => {
						el.style.setProperty("--barba-space-2", `${space}px`);
					}, gap);
					const boxes = await targetBoxes(page.locator("#dense-chips button"));
					for (let i = 0; i < boxes.length; i++) {
						expect(boxes[i].width).toBeGreaterThanOrEqual(minimumTarget);
						expect(boxes[i].height).toBeGreaterThanOrEqual(minimumTarget);
						for (const b of boxes.slice(i + 1)) {
							const a = boxes[i];
							expect(
								Math.min(a.right, b.right) - Math.max(a.x, b.x) > 0.001 &&
									Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 0.001,
							).toBe(false);
						}
					}
					expect(
						await page
							.locator("#dense-chips")
							.evaluate((el) => el.scrollWidth - el.clientWidth),
					).toBeLessThanOrEqual(1);
					for (const selector of [
						".chip[aria-pressed]",
						".chip-removable button",
					]) {
						const button = page.locator(`#dense-chips ${selector}`).first();
						await button.scrollIntoViewIfNeeded();
						const [hit] = await targetBoxes(button);
						// Sample a full CSS pixel inside: engines round fractional hit coordinates
						// differently at touching edges. Geometry above still forbids overlap.
						const points = [
							[hit.x + 1, hit.y + 1],
							[hit.right - 1, hit.y + 1],
							[hit.x + 1, hit.bottom - 1],
							[hit.right - 1, hit.bottom - 1],
						];
						expect(
							await button.evaluate(
								(el, points) =>
									points
										.map(([x, y]) => ({
											x,
											y,
											matches:
												document.elementFromPoint(x, y)?.closest("button") ===
												el,
											found: document
												.elementFromPoint(x, y)
												?.outerHTML.slice(0, 200),
										}))
										.filter((p) => !p.matches),
								points,
							),
						).toEqual([]);
					}
				}
			}
		}
	});
	test(`${source}: uniform chip faces retain expanded targets and inset backgrounds`, async ({
		page,
		browserName,
	}, testInfo) => {
		await load(page, packaged);
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "100%";
		});
		await page.locator("main").evaluate((el) => {
			el.innerHTML = `<section id="chip-fixture" style="padding:var(--barba-space-2)"><p>Category: <span class="chip" id="standalone">Produce</span></p><ul class="chip-list"><li class="chip" id="info">Produce</li><li class="chip chip-removable" id="removable"><span>Produce</span><button type="button" data-barba-variant="icon" data-barba-shape="icon" data-barba-size="compact" aria-label="Remove Produce"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></li></ul><button type="button" class="chip" aria-pressed="true" id="selected"><span class="chip-face">Produce</span></button><button type="button" data-barba-variant="icon" data-barba-shape="icon" id="large" aria-label="Close example">×</button><button type="button" data-barba-variant="icon" data-barba-shape="icon" disabled id="disabled" aria-label="Unavailable close">×</button></section>`;
		});
		for (const selector of ["#info", "#standalone"])
			expect((await page.locator(selector).boundingBox()).height).toBeCloseTo(
				28,
				1,
			);
		for (const selector of ["#removable", "#selected", "#removable button"]) {
			const box = await page.locator(selector).boundingBox();
			expect(box.height).toBeCloseTo(28, 1);
			expect(box.width).toBeGreaterThanOrEqual(28 - 0.001);
		}
		expect((await page.locator("#large").boundingBox()).height).toBeCloseTo(
			44,
			1,
		);
		for (const box of await targetBoxes(
			page.locator("#selected, #removable button"),
		)) {
			expect(box.width).toBeGreaterThanOrEqual(minimumTarget);
			expect(box.height).toBeGreaterThanOrEqual(minimumTarget);
		}
		expect(
			(await page.locator("#selected .chip-face").boundingBox()).height,
		).toBeCloseTo(28, 1);
		for (const selector of ["#large", "#removable button"]) {
			const button = page.locator(selector);
			const color = await button.evaluate((el) => getComputedStyle(el).color);
			await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await button.hover();
			const faceWidth = await button.evaluate((el) => {
				const style = getComputedStyle(el);
				return (
					el.getBoundingClientRect().width -
					2 * parseFloat(style.borderLeftWidth)
				);
			});
			expect(faceWidth).toBeCloseTo(selector === "#large" ? 40 : 20, 1);
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
				.locator("#selected .chip-face")
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
			.locator("#info, #removable > span, #selected .chip-face")
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
		await expect(page.locator("#selected .chip-face")).toHaveCSS(
			"outline-style",
			"solid",
		);
		expect(
			await page
				.locator("#removable")
				.evaluate((el) => getComputedStyle(el, "::before").borderTopStyle),
		).toBe("solid");
	});
	test(`${source}: expanded chip targets activate without overlapping adjacent controls`, async ({
		page,
		browserName,
	}) => {
		await load(page, packaged);
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "100%";
		});
		for (const width of [320, 390, 768]) {
			await page.setViewportSize({ width, height: 844 });
			for (const panel of await page.locator("[data-chip-demo]").all()) {
				await panel.locator("[data-chip-restore]").click();
				const targets = panel.locator(".chip-list button");
				const boxes = await targetBoxes(targets);
				for (let i = 0; i < boxes.length; i++) {
					expect(boxes[i].width).toBeGreaterThanOrEqual(minimumTarget);
					expect(boxes[i].height).toBeGreaterThanOrEqual(minimumTarget);
					for (const other of boxes.slice(i + 1)) {
						const overlapX =
							Math.min(boxes[i].right, other.right) -
							Math.max(boxes[i].x, other.x);
						const overlapY =
							Math.min(boxes[i].bottom, other.bottom) -
							Math.max(boxes[i].y, other.y);
						expect(overlapX > 0.5 && overlapY > 0.5).toBe(false);
					}
				}
				expect(
					await panel.evaluate((el) => el.scrollWidth - el.clientWidth),
				).toBeLessThanOrEqual(1);
				const filter = panel.getByRole("button", {
					name: "Pantry",
					exact: true,
				});
				const selected = await filter.getAttribute("aria-pressed");
				await filter.click({ position: { x: 5, y: -2 } });
				await expect(filter).toHaveAttribute(
					"aria-pressed",
					String(selected !== "true"),
				);
				const remove = panel.getByRole("button", {
					name: "Remove Produce",
					exact: true,
				});
				await panel
					.locator("[data-chip-selections] li")
					.first()
					.locator("span")
					.click();
				await expect(remove).toBeVisible();
				await remove.scrollIntoViewIfNeeded();
				const removeBox = await remove.boundingBox();
				await page.mouse.click(
					removeBox.x + removeBox.width + 6,
					removeBox.y - 2,
				);
				await expect(remove).toHaveCount(0);
				await expect(
					panel.getByRole("button", { name: "Remove Pantry", exact: true }),
				).toBeFocused();
				const disabled = panel.getByRole("button", {
					name: "Remove Locked",
					exact: true,
				});
				await disabled.scrollIntoViewIfNeeded();
				const box = await disabled.boundingBox();
				await page.mouse.click(box.x + box.width / 2, box.y + 2);
				await expect(disabled).toBeVisible();
				await expect(disabled).toBeDisabled();
				await expect(disabled).toHaveCSS(
					"background-color",
					"rgba(0, 0, 0, 0)",
				);
			}
		}
		if (!packaged) {
			await page.locator("[data-chip-boundaries]").check();
			const icon = page.locator("[data-chip-remove]").first();
			expect(
				await icon.evaluate(
					(el) => getComputedStyle(el, "::after").outlineStyle,
				),
			).toBe("dashed");
			const filter = page.locator('[data-chip-filter="Pantry"]').first();
			const selected = await filter.getAttribute("aria-pressed");
			await filter.click({ position: { x: 5, y: -2 } });
			await expect(filter).toHaveAttribute(
				"aria-pressed",
				String(selected !== "true"),
			);
			// Enter with Tab: Firefox does not turn a pointer-focused button into
			// :focus-visible merely because Space is pressed on that same button.
			await page.locator('[data-chip-filter="Produce"]').first().focus();
			await page.keyboard.press(
				browserName === "webkit" && process.platform === "darwin"
					? "Alt+Tab"
					: "Tab",
			);
			await expect(filter).toBeFocused();
			await page.keyboard.press("Space");
			await expect(filter).toHaveCSS("outline-style", "solid");
		}
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
		const longRemove = panel.getByRole("button", {
			name: "Remove Weekend shopping for the whole household",
			exact: true,
		});
		await expect(longRemove).toBeFocused();
		await longRemove.press("Enter");
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
		await longRemove.press("Space");
		await expect(
			panel.getByRole("button", { name: "Remove Pantry", exact: true }),
		).toBeFocused();
		await load(page, packaged, "/forms.html");
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
