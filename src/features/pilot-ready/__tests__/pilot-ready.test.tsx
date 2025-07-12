import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PilotreadyView } from '../components/PilotreadyView';
import { PilotreadyApi } from '../api';

// Mock the API
jest.mock('../api');

describe('Pilotready Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<PilotreadyView id="test-id" />);
    expect(screen.getByText('Loading PilotReady...')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    const mockData = {
      id: 'test-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (PilotreadyApi.getById as jest.Mock).mockResolvedValueOnce(mockData);

    render(<PilotreadyView id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Pilotready Details')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    const errorMessage = 'Failed to load';
    (PilotreadyApi.getById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<PilotreadyView id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('renders empty state when no id provided', () => {
    render(<PilotreadyView />);
    expect(screen.getByText('No PilotReady data available')).toBeInTheDocument();
  });
});