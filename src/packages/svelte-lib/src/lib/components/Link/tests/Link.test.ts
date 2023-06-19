import { render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import ExternalLink from "./ExternalLink.svelte";
import InternalLink from "./InternalLink.svelte";

describe("Link component", () => {
  describe("ExternalLink", () => {
    it("ExternalLink: fully renders without exploding", () => {
      render(ExternalLink);

      const element = screen.getByRole("link");
      expect(element).toBeInTheDocument();
    });

    it("passes basic axe compliance", async () => {
      const { container } = render(ExternalLink);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("InternalLink", () => {
    it("InternalLink: fully renders without exploding", () => {
      render(InternalLink);

      const element = screen.getByRole("link");
      expect(element).toBeInTheDocument();
    });

    it("passes basic axe compliance", async () => {
      const { container } = render(InternalLink);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
