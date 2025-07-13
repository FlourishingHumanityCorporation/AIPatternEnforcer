import React from 'react';
import styles from './TestAuditComponent.module.css';

export interface TestAuditComponentProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * TestAuditComponent component - Cards, lists, badges - components that display information
 * 
 * @example
 * <TestAuditComponent>
 *   Content here
 * </TestAuditComponent>
 */
export const TestAuditComponent: React.FC<TestAuditComponentProps> = ({
  children,
  className = '',
  testId = 'test-audit-component'
}) => {
  return (
    <div 
      className={`${styles.container} ${className}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

TestAuditComponent.displayName = 'TestAuditComponent';