import * as React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText('Welcome to AIPatternEnforcer')).toBeInTheDocument();
  });

  it('renders editing instruction', () => {
    render(<App />);
    expect(screen.getByText('Start editing src/App.tsx')).toBeInTheDocument();
  });

  it('renders main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome to AIPatternEnforcer');
  });
});