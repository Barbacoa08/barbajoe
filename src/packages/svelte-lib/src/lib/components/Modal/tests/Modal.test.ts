import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";

import BasicModalImplementation from "./BasicModalImplementation.svelte";
import FormModal from "./FormModal.svelte";
import OpenModal from "./OpenModal.svelte";

describe("Modal component", () => {
	const user = userEvent.setup();

	// BUG: <dialog> is not supported by JSDOM: https://github.com/jsdom/jsdom/issues/3294
	beforeAll(() => {
		HTMLDialogElement.prototype.show = vi.fn();
		HTMLDialogElement.prototype.showModal = vi.fn();
		HTMLDialogElement.prototype.close = vi.fn();
	});

	describe("BasicModalImplementation", () => {
		it("fully renders without exploding", async () => {
			render(BasicModalImplementation);

			const element = screen.getByText("Put Title Here");
			expect(element).toBeInTheDocument();

			const closeButton = screen.getByText("open basic modal");
			await user.click(closeButton);
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(BasicModalImplementation);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("FormModal", () => {
		it("fully renders without exploding", async () => {
			render(FormModal);

			const element = screen.getByText("Insert Entry");
			expect(element).toBeInTheDocument();

			const closeButton = screen.getByText("open form modal");
			await user.click(closeButton);
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(FormModal);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("OpenModal", () => {
		it("passes basic axe compliance", async () => {
			const { container } = render(OpenModal);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
