import { render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import BasicTextarea from "./BasicTextarea.svelte";

describe("Textarea component", () => {
	it("fully renders without exploding", () => {
		render(BasicTextarea);

		const inputs = screen.getAllByRole("textbox");
		expect(inputs.length).toBe(1);
	});

	it("passes basic axe compliance", async () => {
		const { container } = render(BasicTextarea);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
