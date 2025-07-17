import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestValidation } from "./TestValidation";

describe("TestValidation", () => {
  it("renders children correctly", () => {
    render(<TestValidation>Test Content</TestValidation>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    const { container } = render(
      <TestValidation className="custom-class">Display Content</TestValidation>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies custom test ID", () => {
    render(<TestValidation testId="custom-test-id">Content</TestValidation>);
    expect(screen.getByTestId("custom-test-id")).toBeInTheDocument();
  });
});
