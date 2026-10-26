import { readFile } from "node:fs/promises";
import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

async function usePackage(page) {
	// Preserve specimen-only layout while replacing the library source stylesheet.
	await page.locator("link[data-library]").evaluate((el) => el.remove());
	await page.addStyleTag({
		content: await readFile(
			new URL("../../src/packages/css-lib/dist/barbajoe.css", import.meta.url),
			"utf8",
		),
	});
}

for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: filled disclosure preserves native behavior and isolates nested bordered panels`, async ({
		page,
		browserName,
	}, testInfo) => {
		await page.goto("/index.html");
		if (packaged) {
			// Fixture checks do not depend on catalog layout.
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
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "16px";
		});
		await page.locator("main").evaluate((el) => {
			el.innerHTML = `<details id="filled" class="disclosure disclosure--filled"><summary><span class="disclosure-label disclosure-title">Filters</span></summary><div class="disclosure-content"><label><input type="checkbox"> Show hints</label><details id="bordered" class="disclosure" open><summary><span class="disclosure-label disclosure-title">Nested help</span></summary><div class="disclosure-content"><p>Optional information</p></div></details></div></details>`;
		});
		const panel = page.locator("#filled");
		const summary = page.locator("#filled > summary");
		const content = page.locator("#filled > .disclosure-content");
		await expect(panel).toHaveCSS("border-top-width", "0px");
		await expect(summary).toHaveCSS(
			"background-color",
			await page.evaluate(() => {
				const el = document.createElement("span");
				el.style.backgroundColor = "var(--barba-color-surface)";
				document.body.append(el);
				const color = getComputedStyle(el).backgroundColor;
				el.remove();
				return color;
			}),
		);
		const box = await summary.boundingBox();
		expect(box.height).toBeGreaterThanOrEqual(44);
		await summary.click({ position: { x: box.width - 4, y: box.height / 2 } });
		await expect(panel).toHaveAttribute("open", "");
		await expect(content).toHaveCSS("border-inline-start-width", "3px");
		expect(
			(await content.boundingBox()).y -
				((await summary.boundingBox()).y +
					(await summary.boundingBox()).height),
		).toBeCloseTo(8, 1);
		await expect(summary).toHaveCSS("border-bottom-width", "0px");
		await expect(page.locator("#bordered")).toHaveCSS(
			"border-top-width",
			"1px",
		);
		await expect(page.locator("#bordered > summary")).toHaveCSS(
			"border-bottom-width",
			"1px",
		);
		await panel.getByLabel("Show hints").check();
		const openIcon = await summary.evaluate(
			(el) => getComputedStyle(el, "::after").transform,
		);
		await summary.press("Enter");
		await expect(panel).not.toHaveAttribute("open");
		await expect(content).toBeHidden();
		expect(
			await summary.evaluate((el) => getComputedStyle(el, "::after").transform),
		).not.toBe(openIcon);
		await summary.press("Space");
		await expect(panel.getByLabel("Show hints")).toBeChecked();
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		await page.keyboard.press(tab);
		await page.keyboard.press(tab === "Tab" ? "Shift+Tab" : "Alt+Shift+Tab");
		await expect(summary).toBeFocused();
		await expect(summary).toHaveCSS("outline-style", "solid");
		await page.mouse.move(0, 0);
		const rest = await summary.evaluate(
			(el) => getComputedStyle(el).backgroundColor,
		);
		await summary.hover();
		expect(
			await summary.evaluate((el) => getComputedStyle(el).backgroundColor),
		).not.toBe(rest);
		await page.setViewportSize({ width: 320, height: 720 });
		await summary.locator(".disclosure-label").evaluate((el) => {
			el.textContent =
				"LongShoppingFilterSelectionWithoutSpacesAcrossManyStores";
		});
		await expectNoPageOverflow(page);
		await capture(testInfo, panel, `${source}-filled`);
		await page.emulateMedia({ forcedColors: "active" });
		await expect(content).toHaveCSS("border-inline-start-style", "solid");
		expect(
			await summary.evaluate(
				(el) => getComputedStyle(el, "::after").borderBottomStyle,
			),
		).toBe("solid");
	});

	test(`${source}: filter example retains summaries, independent groups, clear focus, and separate targets`, async ({
		page,
		browserName,
	}, testInfo) => {
		await page.goto("/index.html#filled-disclosures-heading");
		if (packaged) await usePackage(page);
		const panel = page.locator('[data-filled-filter-demo="light"]');
		const summary = panel.locator("summary");
		const details = panel.locator("details");
		const clear = panel.getByRole("button", {
			name: "Clear all filters",
			exact: true,
		});
		await expect(summary).toHaveText("FiltersAll items");
		await expect(clear).toBeHidden();
		for (const name of ["aldis", "costco", "black", "blue"])
			await panel.getByRole("button", { name, exact: true }).click();
		await expect(summary).toHaveText("Filtersaldis · costco · black · blue");
		await panel
			.getByRole("button", { name: "All stores", exact: true })
			.click();
		await expect(summary).toHaveText("Filtersblack · blue");
		await panel
			.getByRole("button", { name: "blue", exact: true })
			.press("Space");
		await expect(summary).toHaveText("Filtersblack");
		await summary.press("Enter");
		await expect(details).not.toHaveAttribute("open");
		await expect(
			panel.getByRole("button", { name: "black", exact: true }),
		).toBeHidden();
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		await page.keyboard.press(tab);
		await expect(clear).toBeFocused();
		await clear.press("Space");
		await expect(summary).toBeFocused();
		await expect(summary).toHaveText("FiltersAll items");
		await expect(clear).toBeHidden();
		await expect(details).not.toHaveAttribute("open");
		await summary.press("Space");
		await expect(
			panel.getByRole("button", { name: "All stores", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
		await expect(
			panel.getByRole("button", { name: "All categories", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
		await page.setViewportSize({ width: 320, height: 720 });
		for (const button of await panel
			.locator('.chip[data-value]:not([data-value=""])')
			.all())
			await button.click();
		await expectNoPageOverflow(page);
		const s = await summary.boundingBox();
		const c = await clear.boundingBox();
		expect(c.x).toBeGreaterThan(s.x);
		expect(c.x + c.width).toBeLessThan(s.x + s.width);
		const title = await panel.locator(".disclosure-title").boundingBox();
		expect(
			Math.abs(c.y + c.height / 2 - title.y - title.height / 2),
		).toBeLessThan(1);
		const selection = await panel
			.locator(".specimen-filter-selection")
			.boundingBox();
		expect(selection.y).toBeGreaterThanOrEqual(title.y + title.height);
		await clear.scrollIntoViewIfNeeded();
		// A sibling overlays a reserved summary slot. Test actual hit regions,
		// not the overlapping bounding boxes of the header and sibling action.
		const hits = await panel.evaluate((el) => {
			const summary = el.querySelector("summary");
			const clear = el.querySelector(".specimen-filter-clear");
			const c = clear.getBoundingClientRect();
			const s = summary.getBoundingClientRect();
			const inset = Number.parseFloat(
				getComputedStyle(summary).paddingInlineEnd,
			);
			return {
				clear:
					document
						.elementFromPoint(c.x + 2, c.y + c.height / 2)
						?.closest("button") === clear,
				toggle:
					document
						.elementFromPoint(s.right - inset / 2, c.y + c.height / 2)
						?.closest("summary") === summary,
			};
		});
		expect(hits).toEqual({ clear: true, toggle: true });
		await clear.click({ position: { x: 2, y: c.height / 2 } });
		await expect(details).toHaveAttribute("open", "");
		await expect(summary).toBeFocused();
		// Restore selections for the long-state capture and summary assertion.
		for (const button of await panel
			.locator('.chip[data-value]:not([data-value=""])')
			.all())
			await button.click();
		expect(c.width).toBeGreaterThanOrEqual(44);
		await expect(panel.locator(".specimen-filter-selection")).toHaveText(
			"aldis · costco · freddies · target · tjs · black · blue · fresh · frozen · fruit · green · red · yellow",
		);
		await capture(testInfo, panel, `${source}-filter-long`);
		await expect(
			page.locator('[data-filled-filter-demo="dark"] summary'),
		).toHaveText("FiltersAll items");
	});
}

for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: shared chevrons point inward/down and center their visible strokes on the title`, async ({
		page,
	}) => {
		await page.goto("/index.html");
		if (packaged) await usePackage(page);
		await page.locator("main").evaluate((el) => {
			el.innerHTML = ["disclosure", "disclosure disclosure--filled"]
				.map(
					(classes) =>
						`<details class="${classes}"><summary><span class="disclosure-label"><span class="disclosure-title">Preferences</span><span class="disclosure-description">Supporting text on a separate line</span></span></summary><div class="disclosure-content">Content</div></details>`,
				)
				.join("");
		});
		for (const dir of ["ltr", "rtl"]) {
			await page.locator("main").evaluate((el, dir) => {
				el.dir = dir;
			}, dir);
			for (const details of await page.locator("main details").all()) {
				for (const open of [false, true]) {
					await details.evaluate((el, open) => {
						el.open = open;
					}, open);
					if (
						await details.evaluate((el) =>
							el.classList.contains("disclosure--filled"),
						)
					) {
						await expect(details.locator(".disclosure-content")).toHaveCSS(
							dir === "rtl" ? "border-right-width" : "border-left-width",
							"3px",
						);
						await expect(details.locator(".disclosure-content")).toHaveCSS(
							dir === "rtl" ? "border-left-width" : "border-right-width",
							"0px",
						);
					}
					const geometry = await details.evaluate((el) => {
						const summary = el.querySelector("summary");
						const title = el
							.querySelector(".disclosure-title")
							.getBoundingClientRect();
						const r = summary.getBoundingClientRect();
						const s = getComputedStyle(summary),
							p = getComputedStyle(summary, "::after");
						const px = Number.parseFloat;
						const matrix = new DOMMatrix(p.transform);
						const w =
							px(p.width) + px(p.borderLeftWidth) + px(p.borderRightWidth);
						const h =
							px(p.height) + px(p.borderTopWidth) + px(p.borderBottomWidth);
						const b = px(p.borderBottomWidth);
						// Actual ink vertices of the right/bottom border, not the empty square.
						const points = [
							[0, h - b],
							[0, h],
							[w, h],
							[w, 0],
							[w - b, 0],
							[w - b, h - b],
						].map(([x, y]) => ({
							x: matrix.a * (x - w / 2) + matrix.c * (y - h / 2) + matrix.e,
							y: matrix.b * (x - w / 2) + matrix.d * (y - h / 2) + matrix.f,
						}));
						const inkCenterY =
							(Math.min(...points.map((p) => p.y)) +
								Math.max(...points.map((p) => p.y))) /
							2;
						const boxCenterY =
							r.y +
							px(s.borderTopWidth) +
							px(s.paddingTop) +
							px(p.marginTop) +
							h / 2;
						return {
							angle: (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI,
							offset: boxCenterY + inkCenterY - title.y - title.height / 2,
							borders: [p.borderRightWidth, p.borderBottomWidth],
							background: p.backgroundImage,
						};
					});
					expect(geometry.borders).toEqual(["2px", "2px"]);
					expect(geometry.background).toBe("none");
					expect(geometry.angle).toBeCloseTo(
						open ? 45 : dir === "rtl" ? -45 : 135,
						1,
					);
					expect(Math.abs(geometry.offset)).toBeLessThan(0.6);
				}
			}
		}
		// Direction is semantic, not language-based. Check opposite explicit
		// boundaries and auto text direction inside an opposite-direction parent.
		for (const boundary of [
			{ parent: "ltr", own: "rtl", text: "Preferences", rtl: true },
			{ parent: "rtl", own: "ltr", text: "Preferences", rtl: false },
			{ parent: "ltr", own: "auto", text: "העדפות", rtl: true },
			{ parent: "rtl", own: "auto", text: "Preferences", rtl: false },
		]) {
			await page.locator("main").evaluate((el, b) => {
				el.dir = b.parent;
			}, boundary);
			for (const details of await page.locator("main details").all()) {
				await details.evaluate((el, b) => {
					el.dir = b.own;
					el.open = false;
					el.querySelector(".disclosure-title").textContent = b.text;
				}, boundary);
				const angle = await details.locator("summary").evaluate((el) => {
					const m = new DOMMatrix(getComputedStyle(el, "::after").transform);
					return (Math.atan2(m.b, m.a) * 180) / Math.PI;
				});
				expect(angle).toBeCloseTo(boundary.rtl ? -45 : 135, 1);
				if (
					await details.evaluate((el) =>
						el.classList.contains("disclosure--filled"),
					)
				) {
					await expect(details.locator(".disclosure-content")).toHaveCSS(
						boundary.rtl ? "border-right-width" : "border-left-width",
						"3px",
					);
				}
			}
		}
	});
	test(`${source}: disclosure gallery covers empty, selected, and wrapped states with reset`, async ({
		page,
	}, testInfo) => {
		await page.goto("/disclosures.html");
		if (packaged) await usePackage(page);
		const panels = page.locator("[data-filled-filter-demo]");
		await expect(panels).toHaveCount(12);
		for (const panel of await panels.all()) {
			const state = await panel.getAttribute("data-filter-state");
			const open = (await panel.getAttribute("data-filter-open")) === "true";
			await expect(panel.locator("details")).toHaveJSProperty("open", open);
			await expect(panel.locator(".specimen-filter-clear")).toBeVisible({
				visible: state !== "empty",
			});
			await expect(panel.locator("summary")).toHaveText(
				state === "empty"
					? "FiltersAll items"
					: state === "selected"
						? "Filtersaldis"
						: /Filtersaldis · costco.*yellow/,
			);
		}
		await page
			.getByRole("checkbox", { name: "Narrow panels (320px)", exact: true })
			.check();
		await expectNoPageOverflow(page);
		const panel = page.locator(
			'[data-filter-state="many"][data-filter-open="true"][data-filled-filter-demo="dark"]',
		);
		const title = await panel.locator(".disclosure-title").boundingBox();
		const clear = panel.locator(".specimen-filter-clear");
		const c = await clear.boundingBox();
		expect(
			Math.abs(c.y + c.height / 2 - title.y - title.height / 2),
		).toBeLessThan(1);
		await clear.click();
		await expect(panel.locator("summary")).toBeFocused();
		await expect(panel.locator("summary")).toHaveText("FiltersAll items");
		await page
			.getByRole("button", { name: "Reset examples", exact: true })
			.click();
		await expect(panel.locator("summary")).toHaveText(
			/Filtersaldis · costco.*yellow/,
		);
		await expect(panel.locator("details")).toHaveAttribute("open", "");
		await page.setViewportSize({ width: 320, height: 720 });
		await expectNoPageOverflow(page);
		await capture(testInfo, panel, `${source}-gallery-narrow`);
	});
}
