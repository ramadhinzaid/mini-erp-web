import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { faUsers } from "@/lib/icons";
import { StatCard } from "../components/StatCard";
import type { DashboardStat } from "../types";

const baseStat: DashboardStat = {
  id: "customers",
  label: "Customers",
  value: "612",
  delta: 6.7,
  icon: faUsers,
};

describe("StatCard", () => {
  it("renders the value and label", () => {
    render(<StatCard stat={baseStat} />);
    expect(screen.getByText("612")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
  });

  it("shows a positive delta in green", () => {
    render(<StatCard stat={baseStat} />);
    const delta = screen.getByText("6.7%");
    expect(delta).toHaveClass("text-emerald-600");
  });

  it("shows a negative delta in red as an absolute value", () => {
    render(<StatCard stat={{ ...baseStat, delta: -2.3 }} />);
    const delta = screen.getByText("2.3%");
    expect(delta).toHaveClass("text-red-600");
  });
});
