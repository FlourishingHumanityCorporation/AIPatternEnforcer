import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SamplefeatureView } from '../components/SamplefeatureView';
import { SamplefeatureApi } from '../api';

// Mock the API
jest.mock('../api');

describe('Samplefeature Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<SamplefeatureView id="test-id" />);
    expect(screen.getByText('Loading SampleFeature...')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    const mockData = {
      id: 'test-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (SamplefeatureApi.getById as jest.Mock).mockResolvedValueOnce(mockData);

    render(<SamplefeatureView id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Samplefeature Details')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    const errorMessage = 'Failed to load';
    (SamplefeatureApi.getById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<SamplefeatureView id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('renders empty state when no id provided', () => {
    render(<SamplefeatureView />);
    expect(screen.getByText('No SampleFeature data available')).toBeInTheDocument();
  });
});