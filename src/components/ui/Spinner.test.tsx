import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("exposes an accessible status role", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the provided label for screen readers", () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByText("Fetching data")).toBeInTheDocument();
  });

  it("applies the size preset classes", () => {
    const { container } = render(<Spinner size="lg" />);
    const indicator = container.querySelector("span > span");
    expect(indicator).toHaveClass("h-10", "w-10");
  });
});
