import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestButton } from "./TestButton";

describe("TestButton", () => {
  it("renders children correctly", () => {
    render(<TestButton>Test Content</TestButton>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    const { container } = render(<TestButton disabled>Disabled</TestButton>);
    expect(container.firstChild).toHaveAttribute("aria-disabled", "true");
  });

  it("shows loading state", () => {
    render(<TestButton isLoading>Content</TestButton>);
    expect(screen.getByTestId("test-button-loading")).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <TestButton className="custom-class">Interactive Content</TestButton>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies custom test ID", () => {
    render(<TestButton testId="custom-test-id">Content</TestButton>);
    expect(screen.getByTestId("custom-test-id")).toBeInTheDocument();
  });
});
