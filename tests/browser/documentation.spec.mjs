import { expect, expectNoPageOverflow, test } from "./fixtures.mjs";

const topics = [
	"getting-started.html",
	"foundations.html",
	"headers.html",
	"buttons.html",
	"forms.html",
	"chips.html",
	"disclosures.html",
	"accessibility.html",
	"dialogs.html",
	"editor.html",
];

test("home links to every topic and keeps full demonstrations on their pages", async ({
	page,
}) => {
	await page.goto("/index.html");
	for (const file of topics)
		await expect(
			page.locator(`main a[href$="/${file}"]`).first(),
		).toBeVisible();
	await expect(
		page.locator("main form, main dialog, [data-chip-demo]"),
	).toHaveCount(0);
	await page.setViewportSize({ width: 320, height: 844 });
	await expectNoPageOverflow(page);
});

test("topic navigation works by keyboard without JavaScript", async ({
	browser,
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 320, height: 844 },
	});
	const page = await context.newPage();
	await page.goto("http://127.0.0.1:4173/forms.html");
	const summary = page.getByRole("button", { name: "Components", exact: true });
	await summary.focus();
	await summary.press("Enter");
	const nav = page.getByRole("navigation", {
		name: "Documentation",
		exact: true,
	});
	await expect(
		nav.getByRole("link", { name: "Forms and input actions", exact: true }),
	).toHaveAttribute("aria-current", "page");
	await expectNoPageOverflow(page);
	await nav.getByRole("link", { name: "Chips", exact: true }).press("Enter");
	await expect(page).toHaveURL(/chips\.html$/);
	await expect(page.locator("#chips-heading")).toBeVisible();
	await context.close();
});

test.describe("legacy catalog bookmarks", () => {
	test.use({ cancelledNavigationSourcePaths: ["/", "/index.html"] });
	test("old catalog bookmarks preserve sections and queries on load and hash changes", async ({
		page,
	}) => {
		for (const [old, target] of [
			["/index.html#chips-heading", "chips.html#chips-heading"],
			[
				"/?review=old#inline-forms-heading",
				"forms.html?review=old#inline-forms-heading",
			],
			["/index.html#hidden-status", "accessibility.html#hidden-status"],
			["/index.html#%64ialog-heading", "dialogs.html#dialog-heading"],
			["/index.html#motion-heading", "foundations.html#motion-heading"],
		]) {
			await page.goto(old);
			await expect(page).toHaveURL(`http://127.0.0.1:4173/${target}`);
			await expect(page.locator(`[id="${target.split("#")[1]}"]`)).toHaveCount(
				1,
			);
			// The redirected DOM can appear before its styles and modules finish loading.
			await page.waitForLoadState("load");
		}
		await page.goto("/index.html");
		await page.evaluate(() => {
			location.hash = "forms-heading";
		});
		await expect(page).toHaveURL(/forms\.html#forms-heading$/);
		await page.waitForLoadState("load");
		await page.goto("/index.html#%broken");
		await expect(page.locator("main h1")).toBeVisible();
	});
});

test("every documentation link and fragment resolves in the built site", async ({
	page,
}) => {
	for (const file of [
		"index.html",
		...topics,
		"layout-header.html",
		"layout-footer.html",
		"layout-minimal.html",
		"package-theme.html",
	]) {
		await page.goto(`/${file}`);
		const broken = await page.evaluate(async () => {
			const links = [...document.querySelectorAll("a[href]")].filter(
				(link) =>
					!link.matches('[aria-disabled="true"], [data-header-page]') &&
					link.origin === location.origin,
			);
			const documents = new Map();
			const failures = [];
			for (const link of links) {
				const url = new URL(link.href);
				if (!documents.has(url.pathname)) {
					const response = await fetch(url.pathname);
					documents.set(
						url.pathname,
						response.ok
							? new DOMParser().parseFromString(
									await response.text(),
									"text/html",
								)
							: null,
					);
				}
				const doc = documents.get(url.pathname);
				if (
					!doc ||
					(url.hash &&
						!doc.getElementById(decodeURIComponent(url.hash.slice(1))))
				)
					failures.push(link.getAttribute("href"));
			}
			return failures;
		});
		expect(broken, file).toEqual([]);
		const duplicates = await page.locator("[id]").evaluateAll((elements) => {
			const ids = elements.map((el) => el.id);
			return ids.filter((id, index) => ids.indexOf(id) !== index);
		});
		expect(duplicates, file).toEqual([]);
	}
});
