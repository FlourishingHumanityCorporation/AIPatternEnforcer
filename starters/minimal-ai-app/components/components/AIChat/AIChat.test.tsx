import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIChat } from "./AIChat";

describe("AIChat", () => {
  it("renders children correctly", () => {
    render(<AIChat>Test Content</AIChat>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    const { container } = render(<AIChat disabled>Disabled</AIChat>);
    expect(container.firstChild).toHaveAttribute("aria-disabled", "true");
  });

  it("shows loading state", () => {
    render(<AIChat isLoading>Content</AIChat>);
    expect(screen.getByTestId("aichat-loading")).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <AIChat className="custom-class">Interactive Content</AIChat>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies custom test ID", () => {
    render(<AIChat testId="custom-test-id">Content</AIChat>);
    expect(screen.getByTestId("custom-test-id")).toBeInTheDocument();
  });
});
