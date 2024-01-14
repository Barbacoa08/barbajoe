import { fireEvent, render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import AllVariants from "./AllVariants.svelte";
import BasicInput from "./BasicInput.svelte";
import Password from "./Password.svelte";

describe("Input component", () => {
  describe("BasicInput", () => {
    it("BasicInput fully renders without exploding", () => {
      render(BasicInput);

      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBe(1);
    });

    it("BasicInput passes basic axe compliance", async () => {
      const { container } = render(BasicInput);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Password", () => {
    it("shows and hides the contents of the input", async () => {
      render(Password);

      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute("type", "password");

      const toggle = screen.getByRole("button");
      await fireEvent.click(toggle);
      expect(input).toHaveAttribute("type", "text");

      await fireEvent.click(toggle);
      expect(input).toHaveAttribute("type", "password");
    });

    it("Password passes basic axe compliance", async () => {
      const { container } = render(Password);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("AllVariants", () => {
    it("AllVariants fully renders without exploding", () => {
      render(AllVariants);

      const textboxs = screen.getAllByRole("textbox");
      expect(textboxs.length).toBe(4);

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBe(1);

      const searchboxs = screen.getAllByRole("searchbox");
      expect(searchboxs.length).toBe(1);

      // NOTE: passwords do not have a role: https://github.com/testing-library/dom-testing-library/issues/567
      const passwords = screen.getAllByLabelText("Password");
      expect(passwords.length).toBe(1);
    });

    it("AllVariants passes basic axe compliance", async () => {
      const { container } = render(AllVariants);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
