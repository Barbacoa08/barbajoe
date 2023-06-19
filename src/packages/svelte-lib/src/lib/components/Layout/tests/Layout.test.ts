import { render, screen } from "@testing-library/svelte";

import LayoutWithHeaderAndFooter from "./LayoutWithHeaderAndFooter.svelte";
import MinimalLayout from "./MinimalLayout.svelte";

describe("Layout", () => {
  it("LayoutWithHeaderAndFooter: fully renders without exploding", () => {
    render(LayoutWithHeaderAndFooter);

    const element = screen.getByText("Layout With Header And Footer");
    expect(element).toBeInTheDocument();
  });

  it("MinimalLayout: fully renders without exploding", () => {
    render(MinimalLayout);

    const element = screen.getByText("Minimal Layout");
    expect(element).toBeInTheDocument();
  });
});
