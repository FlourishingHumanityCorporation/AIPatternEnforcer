import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestAuditComponent } from './TestAuditComponent';

describe('TestAuditComponent', () => {
  it('renders children correctly', () => {
    render(<TestAuditComponent>Test Content</TestAuditComponent>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <TestAuditComponent className="custom-class">
        Display Content
      </TestAuditComponent>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom test ID', () => {
    render(
      <TestAuditComponent testId="custom-test-id">
        Content
      </TestAuditComponent>
    );
    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });
});