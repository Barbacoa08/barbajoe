import { fireEvent, render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";
import { vi } from "vitest";

import ShareTest from "./ShareTest.svelte";

describe("Share button component", () => {
	describe("ShareTest", () => {
		it("fully renders without exploding", () => {
			render(ShareTest);

			const button = screen.getByRole("button");
			expect(button).toHaveClass("secondary");
			expect(button).not.toHaveClass(
				"primary",
				"tertiary",
				"custom-button-class",
			);
		});

		it("responds to click events", async () => {
			Object.assign(navigator, {
				clipboard: {
					writeText: vi.fn(),
					readText: vi.fn(),
				},
			});

			render(ShareTest);
			const button = screen.getByRole("button");
			expect(button).toHaveTextContent("no action");

			await fireEvent.click(button);
			expect(button).toHaveTextContent("shared");
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(ShareTest);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
