import { expect, loadPackage, test } from "./fixtures.mjs";

test("editor demonstrates editing and returns focus after saving", async ({
	page,
}) => {
	await loadPackage(page, "/editor.html");
	const open = page.getByRole("button", { name: "Edit sample", exact: true });
	await open.click();
	const dialog = page.getByRole("dialog", { name: "Edit sample item" });
	const name = dialog.getByRole("textbox", { name: "Name", exact: true });
	await expect(name).toBeFocused();
	await name.fill("Synthetic pears");
	await dialog.getByRole("button", { name: "Save", exact: true }).click();
	await expect(dialog).toBeHidden();
	await expect(open).toBeFocused();
	await expect(page.locator("#saved-item")).toContainText("Synthetic pears");
});
