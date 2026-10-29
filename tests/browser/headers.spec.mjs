import { readFile } from "node:fs/promises";
import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

// Isolate the documented header markup while using the real built specimen CSS.
async function loadHeader(page) {
	await page.goto("/headers.html");
	await page.locator("body").evaluate((body) => {
		body.innerHTML = `<header class="site-header" id="test-header">
			<strong class="site-header-brand">Our List</strong>
			<nav aria-label="Main"><ul class="site-header-links">
				<li><a href="#manage" aria-current="page">Manage</a></li>
				<li><button type="button">Update now</button></li>
				<li><a href="#help">Help &amp; settings</a></li>
			</ul></nav>
		</header>`;
	});
}

const bounds = (locator) => locator.boundingBox();

test("headers wrap by available content space and align wrapped rows to the end", async ({
	page,
}, testInfo) => {
	await loadHeader(page);
	await page.setViewportSize({ width: 600, height: 720 });
	const brand = page.locator(".site-header-brand");
	const nav = page.getByRole("navigation");
	const brandBox = await bounds(brand);
	const navBox = await bounds(nav);
	// Both boxes overlap vertically when content fits, even below the old breakpoint.
	expect(navBox.y).toBeLessThan(brandBox.y + brandBox.height);
	expect(brandBox.y).toBeLessThan(navBox.y + navBox.height);
	await page.setViewportSize({ width: 320, height: 844 });
	const narrowBrand = await bounds(brand);
	const narrowNav = await bounds(nav);
	expect(narrowNav.y).toBeGreaterThanOrEqual(
		narrowBrand.y + narrowBrand.height,
	);
	const lastLink = await bounds(
		page.getByRole("link", { name: "Help & settings" }),
	);
	expect(
		Math.abs(lastLink.x + lastLink.width - narrowNav.x - narrowNav.width),
	).toBeLessThanOrEqual(1);
	await expectNoPageOverflow(page);
	await brand.evaluate((element) => element.remove());
	await page.setViewportSize({ width: 600, height: 720 });
	const navigationOnly = await bounds(nav);
	const header = await bounds(page.locator("header"));
	const padding = await page
		.locator("header")
		.evaluate((el) => Number.parseFloat(getComputedStyle(el).paddingRight));
	expect(
		Math.abs(
			navigationOnly.x +
				navigationOnly.width -
				(header.x + header.width - padding),
		),
	).toBeLessThanOrEqual(1);
	await capture(testInfo, page.locator("header"), "navigation-only-narrow");
});

test("header padding belongs to usable link targets", async ({ page }) => {
	await loadHeader(page);
	const help = page.getByRole("link", { name: "Help & settings" });
	const target = await bounds(help);
	expect(target.height).toBeGreaterThanOrEqual(44);
	const item = await bounds(help.locator(".."));
	await page.mouse.click(item.x + 3, item.y + 3);
	await expect(page).toHaveURL(/#help$/);
});

test("semantic current pages and legacy active items both keep their underline", async ({
	page,
}) => {
	await loadHeader(page);
	const current = page.getByRole("link", { name: "Manage" });
	await expect(current).toHaveCSS("border-bottom-style", "solid");
	await expect(current).toHaveCSS("border-bottom-width", "2px");
	expect(
		await current.evaluate((el) => getComputedStyle(el).borderBottomColor),
	).not.toBe("rgba(0, 0, 0, 0)");
	await current.evaluate((el) => {
		el.removeAttribute("aria-current");
		el.parentElement.classList.add("active");
	});
	expect(
		await current.evaluate((el) => getComputedStyle(el).borderBottomColor),
	).not.toBe("rgba(0, 0, 0, 0)");
});

test("header actions match links and preserve keyboard focus and disabled appearance", async ({
	page,
}, testInfo) => {
	await loadHeader(page);
	const action = page.getByRole("button", { name: "Update now" });
	const link = page.getByRole("link", { name: "Manage" });
	await expect(action).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
	await expect(action).toHaveCSS(
		"color",
		await link.evaluate((el) => getComputedStyle(el).color),
	);
	await link.focus();
	await page.keyboard.press(
		testInfo.project.use.browserName === "webkit" ? "Alt+Tab" : "Tab",
	);
	await expect(action).toBeFocused();
	await expect(action).toHaveCSS("outline-style", "solid");
	await capture(testInfo, page.locator("header"), "header-keyboard-focus");
	await action.evaluate((el) => {
		el.disabled = true;
	});
	const before = await action.evaluate((el) => ({
		color: getComputedStyle(el).color,
		background: getComputedStyle(el).backgroundColor,
	}));
	await action.hover();
	await expect(action).toHaveCSS("opacity", "0.5");
	await expect(action).toHaveCSS("color", before.color);
	await expect(action).toHaveCSS("background-color", before.background);
});

test("long labels and semantic brand elements reflow without changing brand typography", async ({
	page,
}, testInfo) => {
	await loadHeader(page);
	await page.setViewportSize({ width: 320, height: 844 });
	const original = await page.locator(".site-header-brand").evaluate((el) => ({
		size: getComputedStyle(el).fontSize,
		weight: getComputedStyle(el).fontWeight,
	}));
	for (const tag of ["a", "h1", "strong"]) {
		await page.locator(".site-header-brand").evaluate((el, tagName) => {
			const replacement = document.createElement(tagName);
			replacement.className = "site-header-brand";
			replacement.textContent = "OurVeryLongUnbrokenHouseholdShoppingListName";
			if (tagName === "a") replacement.href = "#home";
			el.replaceWith(replacement);
		}, tag);
		await expect(page.locator(".site-header-brand")).toHaveCSS(
			"font-size",
			original.size,
		);
		await expect(page.locator(".site-header-brand")).toHaveCSS(
			"font-weight",
			original.weight,
		);
		await expectNoPageOverflow(page);
	}
	await page.getByRole("link", { name: "Help & settings" }).evaluate((el) => {
		el.textContent = "VeryLongUnbrokenNavigationLabelAndPreferences";
	});
	await expectNoPageOverflow(page);
	await capture(testInfo, page.locator("header"), "header-long-labels");
});

function contrast(first, second) {
	const luminance = (color) =>
		color
			.match(/[\d.]+/g)
			.slice(0, 3)
			.map(Number)
			.map((value) => {
				const channel = value / 255;
				return channel <= 0.04045
					? channel / 12.92
					: ((channel + 0.055) / 1.055) ** 2.4;
			})
			.reduce(
				(total, channel, index) =>
					total + channel * [0.2126, 0.7152, 0.0722][index],
				0,
			);
	const a = luminance(first);
	const b = luminance(second);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test("@light packaged header preserves wrapping, current page and text contrast", async ({
	page,
}, testInfo) => {
	await loadHeader(page);
	// Exercise Lightning CSS output independently of Parcel's source imports.
	await page
		.locator('link[rel="stylesheet"], style')
		.evaluateAll((elements) => {
			for (const element of elements) element.remove();
		});
	await page.addStyleTag({
		content: await readFile(
			new URL("../../src/packages/css-lib/dist/barbajoe.css", import.meta.url),
			"utf8",
		),
	});
	await page.setViewportSize({ width: 600, height: 720 });
	const brand = await bounds(page.locator(".site-header-brand"));
	const nav = await bounds(page.getByRole("navigation"));
	expect(nav.y).toBeLessThan(brand.y + brand.height);
	const current = page.getByRole("link", { name: "Manage" });
	await expect(current).toHaveCSS("border-bottom-width", "2px");
	for (const colorScheme of ["light", "dark"]) {
		await page.emulateMedia({ colorScheme });
		const surface = await page
			.locator("header")
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		for (const action of [
			current,
			page.getByRole("button", { name: "Update now" }),
		]) {
			const normal = await action.evaluate((el) => getComputedStyle(el).color);
			expect(contrast(normal, surface)).toBeGreaterThanOrEqual(7);
			await action.hover();
			expect(
				contrast(
					await action.evaluate((el) => getComputedStyle(el).color),
					surface,
				),
			).toBeGreaterThanOrEqual(7);
		}
	}
	await page.setViewportSize({ width: 320, height: 844 });
	await expectNoPageOverflow(page);
	await capture(testInfo, page.locator("header"), "packaged-header-narrow");
});
