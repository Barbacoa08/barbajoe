import { readFile } from "node:fs/promises";
import {
	expect,
	expectNoPageOverflow,
	loadPackage,
	test,
} from "./fixtures.mjs";

const nav = (page) =>
	page.getByRole("navigation", { name: "Documentation", exact: true });
const trigger = (page, name) =>
	nav(page).getByRole("button", { name, exact: true });
const menu = (page, name) => page.locator(`#docs-${name.toLowerCase()}`);

test("@light header categories toggle, dismiss, and restore keyboard focus", async ({
	page,
	browserName,
}) => {
	await loadPackage(page, "/forms.html");
	const components = trigger(page, "Components");
	await components.focus();
	await components.press("Enter");
	await expect(menu(page, "Components")).toBeVisible();
	await expect(
		nav(page).getByRole("link", {
			name: "Forms and input actions",
			exact: true,
		}),
	).toHaveAttribute("aria-current", "page");
	await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
	await expect(
		nav(page).getByRole("link", { name: "Buttons and actions", exact: true }),
	).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(menu(page, "Components")).toBeHidden();
	await expect(components).toBeFocused();
	await components.press("Space");
	await trigger(page, "Guides").click();
	await expect(menu(page, "Components")).toBeHidden();
	await expect(menu(page, "Guides")).toBeVisible();
	await trigger(page, "Guides").click();
	await expect(menu(page, "Guides")).toBeHidden();
	await trigger(page, "Examples").click();
	// The menu can cover the heading on narrow screens; click the viewport edge.
	await page.mouse.click(2, page.viewportSize().height - 2);
	await expect(menu(page, "Examples")).toBeHidden();
	await components.focus();
	await components.press("Enter");
	await trigger(page, "Examples").focus();
	await expect(menu(page, "Components")).toBeHidden();
	await expect(trigger(page, "Examples")).toBeFocused();
	await components.focus();
	await components.press("Enter");
	await menu(page, "Components").getByRole("link").last().focus();
	await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
	await expect(trigger(page, "Examples")).toBeFocused();
	await expect(menu(page, "Components")).toBeHidden();
});

test("header menus fit narrow, RTL, enlarged-text, and short viewports", async ({
	page,
}) => {
	await page.goto("/forms.html");
	for (const dir of ["ltr", "rtl"]) {
		await page.evaluate((direction) => {
			document.documentElement.dir = direction;
		}, dir);
		await page.setViewportSize({ width: 320, height: 480 });
		await page.locator(".skip-link").focus();
		await expect(page.locator(".skip-link")).toBeInViewport();
		await expectNoPageOverflow(page);
		await trigger(page, "Guides").focus();
		for (const name of ["Guides", "Components", "Examples"]) {
			await trigger(page, name).click();
			const box = await menu(page, name).boundingBox();
			expect(box.width).toBeGreaterThanOrEqual(288);
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(321);
			expect(box.y).toBeGreaterThanOrEqual(0);
			expect(box.y + box.height).toBeLessThanOrEqual(481);
			await expectNoPageOverflow(page);
			await page.keyboard.press("Escape");
		}
	}
	// Isolate header reflow from unrelated form-control minimum widths.
	await page.locator("main, footer").evaluateAll((els) => {
		for (const el of els) el.remove();
	});
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "200%";
	});
	await trigger(page, "Components").click();
	await expectNoPageOverflow(page);
	const last = menu(page, "Components").getByRole("link").last();
	await last.scrollIntoViewIfNeeded();
	await expect(last).toBeInViewport();
	await page.keyboard.press("Escape");
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "100%";
	});
	await page.setViewportSize({ width: 320, height: 180 });
	await trigger(page, "Examples").click();
	const shortMenu = menu(page, "Examples");
	const shortBox = await shortMenu.boundingBox();
	expect(shortBox.y).toBeGreaterThanOrEqual(0);
	expect(shortBox.y + shortBox.height).toBeLessThanOrEqual(181);
	await shortMenu.getByRole("link").last().scrollIntoViewIfNeeded();
	await expect(shortMenu.getByRole("link").last()).toBeInViewport();
});

test("@light header destination selection navigates and marks its current page", async ({
	page,
}) => {
	await loadPackage(page, "/index.html");
	await trigger(page, "Components").click();
	await nav(page).getByRole("link", { name: "Chips", exact: true }).click();
	await expect(page).toHaveURL(/chips\.html$/);
	await trigger(page, "Components").click();
	await expect(
		nav(page).getByRole("link", { name: "Chips", exact: true }),
	).toHaveAttribute("aria-current", "page");
	await page.keyboard.press("Escape");
	await page.locator("header > .site-header-brand").click();
	await expect(page).toHaveURL(/index\.html$/);
});

for (const build of ["source", "package"]) {
	test(`${build} menu styling is independent of specimen CSS`, async ({
		page,
	}) => {
		await page.goto("/forms.html");
		await page.locator("main, footer").evaluateAll((els) => {
			for (const el of els) el.remove();
		});
		if (build === "package") {
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
		} else {
			await page
				.locator('link[rel="stylesheet"]:not([data-library])')
				.evaluateAll((els) => {
					for (const el of els) el.remove();
				});
		}
		await page.setViewportSize({ width: 320, height: 480 });
		await trigger(page, "Guides").focus();
		await trigger(page, "Guides").press("Enter");
		await expect(trigger(page, "Guides")).toHaveCSS("outline-style", "solid");
		const popup = menu(page, "Guides");
		await expect(popup).toHaveCSS("position", "fixed");
		await expect(popup).toHaveCSS("border-top-style", "solid");
		for (const link of await popup.getByRole("link").all()) {
			const box = await link.boundingBox();
			expect(box.height).toBeGreaterThanOrEqual(44);
		}
		await popup
			.getByRole("link")
			.first()
			.evaluate((el) => {
				el.textContent =
					"AnExceptionallyLongUnbrokenTranslatedDocumentationDestination";
			});
		await expectNoPageOverflow(page);
		expect(
			await popup.evaluate((el) => el.scrollWidth - el.clientWidth),
		).toBeLessThanOrEqual(1);
	});
}

test("menu fallbacks remain usable without anchors or native popovers", async ({
	page,
}) => {
	await page.goto("/forms.html");
	await page.locator("main, footer").evaluateAll((els) => {
		for (const el of els) el.remove();
	});
	const css = await readFile(
		new URL(
			"../../src/packages/css-lib/lib/components/header.css",
			import.meta.url,
		),
		"utf8",
	);
	// Exercise the actual fallback rules while suppressing their feature enhancements.
	await page.locator('link[rel="stylesheet"], style').evaluateAll((els) => {
		for (const el of els) el.remove();
	});
	const fallback = await page.addStyleTag({
		content: css.replace(
			"@supports (position-area: block-end span-inline-end)",
			"@supports (unknown-header-feature: unsupported)",
		),
	});
	await page.setViewportSize({ width: 320, height: 480 });
	await trigger(page, "Guides").click();
	const box = await menu(page, "Guides").boundingBox();
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width).toBeLessThanOrEqual(320);
	await expect(menu(page, "Guides")).toHaveCSS("position", "fixed");
	await page.keyboard.press("Escape");
	await fallback.evaluate((el) => el.remove());
	await page.addStyleTag({
		content: css.replaceAll(
			"selector(:popover-open)",
			"(unknown-header-feature: unsupported)",
		),
	});
	await page.locator(".site-header-menu").evaluateAll((els) => {
		for (const el of els) el.removeAttribute("popover");
	});
	await expect(trigger(page, "Guides")).toBeHidden();
	await expect(
		nav(page).getByRole("link", { name: "Getting started", exact: true }),
	).toBeVisible();
	await expectNoPageOverflow(page);
});
