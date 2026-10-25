import { readFile } from "node:fs/promises";
import { capture, expect, expectNoPageOverflow, test } from "./fixtures.mjs";

for (const packaged of [false, true]) {
	test(`${packaged ? "package" : "source"}: editor saves drafts, cancels, restores focus and handles disabled/long content`, async ({
		page,
		browserName,
	}, testInfo) => {
		await page.goto("/editor.html");
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
		const dialog = page.getByRole("dialog", { name: "Edit sample item" });
		const open = page.getByRole("button", { name: "Edit sample", exact: true });
		await open.click();
		await expect(
			dialog.getByRole("textbox", { name: "Name", exact: true }),
		).toBeFocused();
		await dialog
			.getByRole("textbox", { name: "Name", exact: true })
			.fill("Synthetic pears");
		await dialog
			.getByRole("textbox", { name: "Notes", exact: true })
			.fill("A local draft");
		await dialog
			.getByRole("button", { name: "Pantry", exact: true })
			.press("Space");
		await expect(
			dialog.getByRole("button", { name: "Pantry", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
		await dialog
			.getByRole("button", { name: "Remove Produce", exact: true })
			.press("Enter");
		await expect(
			dialog.getByRole("button", {
				name: "Remove Weekend shopping for the shared household",
				exact: true,
			}),
		).toBeFocused();
		await dialog.getByRole("button", { name: "Save", exact: true }).click();
		await expect(dialog).toBeHidden();
		await expect(open).toBeFocused();
		await expect(page.locator("#saved-item")).toContainText("Synthetic pears");
		await expect(page.locator("#saved-item")).toContainText("Locked example");
		await open.click();
		await expect(
			dialog.getByRole("textbox", { name: "Notes", exact: true }),
		).toHaveValue("A local draft");
		await dialog
			.getByRole("textbox", { name: "Name", exact: true })
			.fill("Discard this");
		await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
		await expect(open).toBeFocused();
		await open.click();
		await expect(
			dialog.getByRole("textbox", { name: "Name", exact: true }),
		).toHaveValue("Synthetic pears");
		await page.keyboard.press("Escape");
		await expect(open).toBeFocused();
		await page.getByRole("checkbox", { name: "Read-only example" }).check();
		await page.getByRole("checkbox", { name: "Long content" }).check();
		await page.setViewportSize({ width: 320, height: 720 });
		await open.click();
		await expect(
			dialog.getByRole("button", { name: "Save", exact: true }),
		).toBeDisabled();
		await expect(
			dialog.getByRole("button", { name: "Delete", exact: true }),
		).toBeDisabled();
		await expect(
			dialog.getByRole("button", { name: "Pantry", exact: true }),
		).toBeDisabled();
		await expect(
			dialog.getByRole("textbox", { name: "Name", exact: true }),
		).toHaveAttribute("readonly", "");
		const tab =
			browserName === "webkit" && process.platform === "darwin"
				? "Alt+Tab"
				: "Tab";
		await page.keyboard.press(tab);
		await expect(
			dialog.getByRole("textbox", { name: "Notes", exact: true }),
		).toBeFocused();
		await expect(
			dialog.getByRole("textbox", { name: "Notes", exact: true }),
		).toHaveCSS("outline-style", "solid");
		await expectNoPageOverflow(page);
		const body = dialog.locator(".dialog-body");
		expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
			true,
		);
		expect(
			await dialog.evaluate((el) => el.scrollWidth - el.clientWidth),
		).toBeLessThanOrEqual(1);
		await capture(
			testInfo,
			dialog,
			`${packaged ? "package" : "source"}-editor-narrow`,
		);
		await dialog
			.getByRole("button", { name: "Close editor", exact: true })
			.click();
		await expect(open).toBeFocused();
		await page.getByRole("checkbox", { name: "Read-only example" }).uncheck();
		await open.click();
		await dialog.getByRole("button", { name: "Delete", exact: true }).click();
		await expect(dialog).toBeHidden();
		const restore = page.getByRole("button", {
			name: "Restore sample",
			exact: true,
		});
		await expect(restore).toBeFocused();
		await expect(open).toBeDisabled();
		await restore.click();
		await expect(open).toBeEnabled();
		await open.click();
		await expect(
			dialog.getByRole("textbox", { name: "Name", exact: true }),
		).toHaveValue("Weekend groceries");
	});
}
