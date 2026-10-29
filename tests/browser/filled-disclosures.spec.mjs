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

for (const packaged of [true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: shaded list rows reach the filled disclosure edge in both directions`, async ({
		page,
	}, testInfo) => {
		await page.goto("/disclosures.html#edge-content");
		if (packaged) await usePackage(page);
		await page.locator("html").evaluate((el) => {
			el.style.fontSize = "16px";
		});
		const examples = page.locator("#edge-content details");
		await expect(examples).toHaveCount(2);
		await page
			.getByRole("button", { name: "Collapse all", exact: true })
			.click();
		for (const details of await examples.all())
			await expect(details).not.toHaveAttribute("open");
		await page
			.getByRole("button", { name: "Reset examples", exact: true })
			.click();
		for (const details of await examples.all())
			await expect(details).toHaveAttribute("open", "");
		for (const width of [1280, 320]) {
			await page.setViewportSize({ width, height: 844 });
			for (const dir of ["ltr", "rtl"]) {
				await page.locator("#edge-content").evaluate((el, direction) => {
					el.dir = direction;
				}, dir);
				for (const details of await examples.all()) {
					const summary = await details.locator("summary").boundingBox();
					for (const row of await details.getByRole("listitem").all()) {
						const box = await row.boundingBox();
						const gap =
							dir === "ltr"
								? summary.x + summary.width - box.x - box.width
								: box.x - summary.x;
						expect(Math.abs(gap)).toBeLessThan(1);
					}
					await expect(details.locator(".disclosure-content")).toHaveCSS(
						"padding-inline-start",
						"16px",
					);
					await expect(details.locator("summary")).toHaveCSS(
						"padding-inline-end",
						"16px",
					);
				}
				await expectNoPageOverflow(page);
				if (dir === "ltr" && width !== 320)
					await capture(
						testInfo,
						page.locator("#edge-content"),
						`${source}-edge-${width}`,
					);
			}
		}
	});

	test(`${source}: disclosure labels balance spare target height without clipping wrapped content`, async ({
		page,
	}) => {
		await page.goto("/disclosures.html");
		if (packaged) await usePackage(page);
		await page.locator("main").evaluate((el) => {
			const labels = [
				'<h2 class="disclosure-label disclosure-title">Preferences</h2>',
				'<span class="disclosure-label disclosure-title">Preferences</span>',
				'<span class="disclosure-label"><span class="disclosure-title">Preferences</span></span>',
				'<span class="disclosure-label"><span class="disclosure-title">Preferences</span><span class="disclosure-description">Supporting information</span></span>',
				'<span class="disclosure-label disclosure-title">Shopping preferences across multiple shared household devices</span>',
			];
			el.innerHTML = ["disclosure", "disclosure disclosure--filled"]
				.flatMap((classes) =>
					labels.map(
						(label) =>
							`<details class="${classes}" style="inline-size:100%;max-inline-size:280px"><summary>${label}</summary><div class="disclosure-content">Optional content</div></details>`,
					),
				)
				.join("");
		});
		for (const fontSize of [16, 32]) {
			await page.locator("html").evaluate((el, size) => {
				el.style.fontSize = `${size}px`;
			}, fontSize);
			for (const open of [true]) {
				for (const details of await page.locator("main details").all()) {
					await details.evaluate((el, value) => {
						el.open = value;
					}, open);
					const geometry = await details.locator("summary").evaluate((el) => {
						const p = getComputedStyle(el, "::after");
						const m = new DOMMatrix(p.transform);
						return {
							angle: (Math.atan2(m.b, m.a) * 180) / Math.PI,
							stroke: parseFloat(p.borderBottomWidth),
							width: parseFloat(p.width),
						};
					});
					expect(geometry.stroke).toBeGreaterThan(0);
					expect(geometry.width).toBeGreaterThan(0);
					expect(geometry.angle).toBeCloseTo(
						open ? 45 : dir === "rtl" ? -45 : 135,
						1,
					);
				}
			}
		}
	});

	test(`${source}: filled disclosure preserves native behavior and isolates nested bordered panels`, async ({
		page,
		browserName,
	}, testInfo) => {
		await page.goto("/disclosures.html");
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
}

for (const packaged of [false, true]) {
	const source = packaged ? "package" : "source";
	test(`${source}: shared chevrons retain visible direction across source and package`, async ({
		page,
	}) => {
		await page.goto("/disclosures.html");
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
				for (const open of [true]) {
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
}
