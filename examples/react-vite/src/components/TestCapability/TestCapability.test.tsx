import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { TestCapability } from './TestCapability';

describe('TestCapability', () => {
  it('renders children correctly', () => {
    render(<TestCapability>Test Content</TestCapability>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const { container } = render(<TestCapability disabled>Disabled</TestCapability>);
    expect(container.firstChild).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows loading state', () => {
    render(<TestCapability isLoading>Content</TestCapability>);
    expect(screen.getByTestId('test-capability-loading')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <TestCapability className="custom-class">
        Interactive Content
      </TestCapability>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies custom test ID', () => {
    render(
      <TestCapability testId="custom-test-id">
        Content
      </TestCapability>
    );
    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });
});