import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Testfeature3View } from '../components/Testfeature3View';
import { Testfeature3Api } from '../api';

// Mock the API
jest.mock('../api');

describe('Testfeature3 Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<Testfeature3View id="test-id" />);
    expect(screen.getByText('Loading TestFeature3...')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    const mockData = {
      id: 'test-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Testfeature3Api.getById as jest.Mock).mockResolvedValueOnce(mockData);

    render(<Testfeature3View id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Testfeature3 Details')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    const errorMessage = 'Failed to load';
    (Testfeature3Api.getById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<Testfeature3View id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('renders empty state when no id provided', () => {
    render(<Testfeature3View />);
    expect(screen.getByText('No TestFeature3 data available')).toBeInTheDocument();
  });
});