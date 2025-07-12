import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TestButton } from './TestButton';

describe('TestButton', () => {
  it('renders children correctly', () => {
    render(<TestButton>Test Content</TestButton>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<TestButton className="custom-class">Content</TestButton>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<TestButton onClick={handleClick}>Clickable</TestButton>);
    
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events when clickable', () => {
    const handleClick = vi.fn();
    render(<TestButton onClick={handleClick}>Clickable</TestButton>);
    
    const element = screen.getByText('Clickable');
    fireEvent.keyDown(element, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(element, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('does not handle keyboard events when not clickable', () => {
    const { container } = render(<TestButton>Not Clickable</TestButton>);
    expect(container.firstChild).not.toHaveAttribute('role');
    expect(container.firstChild).not.toHaveAttribute('tabIndex');
  });

  it('renders without children', () => {
    const { container } = render(<TestButton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});