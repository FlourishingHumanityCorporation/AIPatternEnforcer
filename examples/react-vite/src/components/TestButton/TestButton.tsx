import * as React from 'react';
import styles from './TestButton.module.css';

export interface TestButtonProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * TestButton component
 * 
 * @example
 * <TestButton onClick={() => alert('clicked')}>
 *   Content here
 * </TestButton>
 */
export const TestButton: React.FC<TestButtonProps> = ({
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

TestButton.displayName = 'TestButton';