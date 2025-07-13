import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { vi } from 'vitest';

// Mock ReactDOM.createRoot since we can't actually mount to DOM in test
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}));

// Mock App component
vi.mock('./App', () => ({
  default: () => React.createElement('div', null, 'App')
}));

describe('main.tsx', () => {
  beforeEach(() => {
    // Create a mock root element
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('creates React root and renders App', async () => {
    const mockCreateRoot = vi.mocked(ReactDOM.createRoot);
    const mockRender = vi.fn();
    mockCreateRoot.mockReturnValue({ render: mockRender } as ReturnType<typeof ReactDOM.createRoot>);

    // Import main.tsx to execute the code
    await import('./main');

    expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        type: React.StrictMode
      })
    );
  });
});