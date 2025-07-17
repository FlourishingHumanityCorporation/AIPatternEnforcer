import React from "react";
import styles from "./AIChat.module.css";

export interface AIChatProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Disabled state */
  disabled?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  /** Aria described by ID */
  ariaDescribedBy?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * AIChat component - Buttons, inputs, toggles - components that users interact with
 *
 * @example
 * <AIChat>
 *   Content here
 * </AIChat>
 */
export const AIChat: React.FC<AIChatProps> = ({
  children,
  className = "",
  isLoading = false,
  error = null,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  testId = "aichat",
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={`${styles.container} ${styles.loading} ${className}`}
        data-testid={`${testId}-loading`}
      >
        <span className={styles.spinner} aria-label="Loading..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`${styles.container} ${styles.error} ${className}`}
        data-testid={`${testId}-error`}
      >
        <span role="alert">{error}</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${className}`}
      data-testid={testId}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </div>
  );
};

AIChat.displayName = "AIChat";
