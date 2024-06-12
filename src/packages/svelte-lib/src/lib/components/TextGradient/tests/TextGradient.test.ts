import { render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import H1TextGradient from "./H1TextGradient.svelte";
import InnerParapraphTextGradient from "./InnerParapraphTextGradient.svelte";

describe("TextGradient component", () => {
	describe("H1TextGradient", () => {
		it("H1TextGradient: fully renders without exploding", () => {
			render(H1TextGradient);

			const element = screen.getByRole("heading");
			expect(element).toBeInTheDocument();
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(H1TextGradient);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("InnerParapraphTextGradient", () => {
		it("InnerParapraphTextGradient: fully renders without exploding", () => {
			render(InnerParapraphTextGradient);

			const element = screen.getByText("gradient");
			expect(element).toBeInTheDocument();
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(InnerParapraphTextGradient);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
