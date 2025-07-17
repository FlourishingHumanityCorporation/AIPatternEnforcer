import React from "react";
import styles from "./TestValidation.module.css";

export interface TestValidationProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * TestValidation component - Cards, lists, badges - components that display information
 *
 * @example
 * <TestValidation>
 *   Content here
 * </TestValidation>
 */
export const TestValidation: React.FC<TestValidationProps> = ({
  children,
  className = "",
  testId = "test-validation",
}) => {
  return (
    <div className={`${styles.container} ${className}`} data-testid={testId}>
      {children}
    </div>
  );
};

TestValidation.displayName = "TestValidation";
