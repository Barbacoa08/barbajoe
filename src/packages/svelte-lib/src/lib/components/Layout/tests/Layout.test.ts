import { render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import LayoutWithHeaderAndFooter from "./LayoutWithHeaderAndFooter.svelte";
import LayoutWithLinks from "./LayoutWithLinks.svelte";
import LayoutWithLogo from "./LayoutWithLogo.svelte";
import MinimalLayout from "./MinimalLayout.svelte";

describe("Layout component", () => {
	describe("LayoutWithHeaderAndFooter", () => {
		it("LayoutWithHeaderAndFooter: fully renders without exploding", () => {
			render(LayoutWithHeaderAndFooter);

			const element = screen.getByText("Layout With Header And Footer");
			expect(element).toBeInTheDocument();
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(LayoutWithHeaderAndFooter);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("MinimalLayout", () => {
		it("MinimalLayout: fully renders without exploding", () => {
			render(MinimalLayout);

			const element = screen.getByText("Minimal Layout");
			expect(element).toBeInTheDocument();
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(MinimalLayout);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("LayoutWithLinks", () => {
		it("LayoutWithLinks: fully renders without exploding", () => {
			render(LayoutWithLinks);

			const element = screen.getByText("Layout With Links");
			expect(element).toBeInTheDocument();
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(LayoutWithLinks);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});

	describe("LayoutWithLogo", () => {
		it("LayoutWithLogo: fully renders without exploding", () => {
			render(LayoutWithLogo);

			const element = screen.getByText("Layout With Logo");
			expect(element).toBeInTheDocument();
		});

		it("passes basic axe compliance", async () => {
			const { container } = render(LayoutWithLogo);
			const results = await axe(container);
			expect(results).toHaveNoViolations();
		});
	});
});
