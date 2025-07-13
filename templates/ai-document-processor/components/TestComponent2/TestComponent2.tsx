import * as React from 'react';
import styles from './TestComponent2.module.css';

export interface TestComponent2Props {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * TestComponent2 component
 * 
 * @example
 * <TestComponent2 onClick={() => alert('clicked')}>
 *   Content here
 * </TestComponent2>
 */
export const TestComponent2: React.FC<TestComponent2Props> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`${styles.container} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

TestComponent2.displayName = 'TestComponent2';