import { render, screen } from "@testing-library/svelte";
import { axe } from "jest-axe";

import PostsExamples from "./PostsExamples.svelte";

describe("Posts component", () => {
  describe("PostsExamples", () => {
    it("ExternalLink: fully renders without exploding", () => {
      render(PostsExamples);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute("aria-disabled", "true");
      expect(links[1]).toHaveAttribute("aria-disabled", "false");
    });

    it("passes basic axe compliance", async () => {
      const { container } = render(PostsExamples);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
