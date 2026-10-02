import { capture, expect, test } from "./fixtures.mjs";

test("catalog reset restores fields inside and associated with the form", async ({
	page,
}, testInfo) => {
	await page.goto("/index.html");
	const form = page.locator("#catalog-form");
	const text = form.getByRole("textbox", { name: /^Text\b/ });
	const associated = page.getByLabel("Associated by form attribute");
	await text.fill("Edited inside");
	await associated.fill("Edited outside");
	await form.getByRole("button", { name: "Reset", exact: true }).click();
	await expect(text).toHaveValue("Barbajoe");
	await expect(associated).toHaveValue("Associated with catalog form");
	await expect(
		form.getByRole("button", { name: "Disabled button" }),
	).toBeDisabled();
	await capture(
		testInfo,
		page.locator('section[aria-labelledby="forms-heading"]'),
		"forms",
	);
});

test("catalog submit and cancel keep the non-networked example intact", async ({
	page,
}) => {
	await page.goto("/index.html");
	const form = page.locator("#catalog-form");
	const text = form.getByRole("textbox", { name: /^Text\b/ });
	await text.fill("Keep this value");
	const requests = [];
	page.on("request", (request) => requests.push(request.url()));
	await form.getByRole("button", { name: "Submit", exact: true }).click();
	await expect(text).toHaveValue("Keep this value");
	expect(requests, "Submit must not make a network request").toEqual([]);
	await form.getByRole("button", { name: "Cancel", exact: true }).click();
	await expect(text).toHaveValue("Keep this value");
	expect(requests, "Cancel must not make a network request").toEqual([]);
	await expect(page).toHaveURL(/\/index\.html$/);
});
