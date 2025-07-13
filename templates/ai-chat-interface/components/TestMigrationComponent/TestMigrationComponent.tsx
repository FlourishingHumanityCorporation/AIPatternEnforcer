import * as React from 'react';
import styles from './TestMigrationComponent.module.css';

export interface TestMigrationComponentProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Optional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * TestMigrationComponent component
 * 
 * @example
 * <TestMigrationComponent onClick={() => alert('clicked')}>
 *   Content here
 * </TestMigrationComponent>
 */
export const TestMigrationComponent: React.FC<TestMigrationComponentProps> = ({
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

TestMigrationComponent.displayName = 'TestMigrationComponent';