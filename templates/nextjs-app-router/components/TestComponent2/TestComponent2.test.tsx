import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// Jest mocking is available globally in Next.js

// Simple console replacement for this tool
const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
};
import { TestComponent2 } from "./TestComponent2";

describe("TestComponent2", () => {
  it("renders children correctly", () => {
    render(<TestComponent2>Test Content</TestComponent2>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <TestComponent2 className="custom-class">Content</TestComponent2>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<TestComponent2 onClick={handleClick}>Clickable</TestComponent2>);

    fireEvent.click(screen.getByText("Clickable"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("handles keyboard events when clickable", () => {
    const handleClick = jest.fn();
    render(<TestComponent2 onClick={handleClick}>Clickable</TestComponent2>);

    const element = screen.getByText("Clickable");
    fireEvent.keyDown(element, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(element, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("does not handle keyboard events when not clickable", () => {
    const { container } = render(
      <TestComponent2>Not Clickable</TestComponent2>,
    );
    expect(container.firstChild).not.toHaveAttribute("role");
    expect(container.firstChild).not.toHaveAttribute("tabIndex");
  });

  it("renders without children", () => {
    const { container } = render(<TestComponent2 />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
