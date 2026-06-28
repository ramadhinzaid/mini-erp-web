import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with the pulse animation", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass("animate-pulse", "h-4", "w-32");
  });

  it("is hidden from assistive technology", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("uses a circular shape when requested", () => {
    const { container } = render(<Skeleton circle />);
    expect(container.firstChild).toHaveClass("rounded-full");
  });
});
