import { fireEvent, render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import AllVariants from "./AllVariants.svelte";
import ClickTest from "./ClickTest.svelte";

describe("Button component", () => {
  describe("AllVariants", () => {
    it("fully renders without exploding", () => {
      render(AllVariants);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(4);

      expect(buttons[0]).toHaveClass("primary");
      expect(buttons[0]).not.toHaveClass(
        "secondary",
        "tertiary",
        "custom-button-class",
      );

      expect(buttons[1]).toHaveClass("secondary");
      expect(buttons[1]).not.toHaveClass(
        "primary",
        "tertiary",
        "custom-button-class",
      );

      expect(buttons[2]).toHaveClass("tertiary");
      expect(buttons[2]).not.toHaveClass(
        "primary",
        "secondary",
        "custom-button-class",
      );

      expect(buttons[3]).toHaveClass("custom-button-class");
      expect(buttons[3]).not.toHaveClass("primary", "secondary", "tertiary");
    });

    it("responds to click events", async () => {
      render(ClickTest);
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("no action");

      await fireEvent.click(button);
      expect(button).toHaveTextContent("clicked");
    });

    it("passes basic axe compliance", async () => {
      const { container } = render(AllVariants);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
