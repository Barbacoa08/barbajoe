import { render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import BasicAccordion from "./BasicAccordion.svelte";
import ComplexAccordion from "./ComplexAccordion.svelte";

describe("Accordion component", () => {
	describe("BasicAccordion", () => {
		it("Basic Accordion: fully renders without exploding", () => {
			render(BasicAccordion);

			const accordion = screen.getByRole("list");
			expect(accordion).toBeInTheDocument();
			const items = screen.getAllByRole("listitem");
			expect(items).toHaveLength(2);
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(BasicAccordion);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("ComplexAccordion", () => {
		it("Complex Accordion: fully renders without exploding", () => {
			render(ComplexAccordion);

			const accordion = screen.getByRole("list");
			expect(accordion).toBeInTheDocument();
			const items = screen.getAllByRole("listitem");
			expect(items).toHaveLength(3);

			const accordionToggleButtons = screen.getAllByRole("button");
			expect(accordionToggleButtons).toHaveLength(3);
			expect(accordionToggleButtons[0]).toHaveAttribute(
				"aria-expanded",
				"false",
			);
			expect(accordionToggleButtons[1]).toHaveAttribute(
				"aria-expanded",
				"true",
			);
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(ComplexAccordion);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
