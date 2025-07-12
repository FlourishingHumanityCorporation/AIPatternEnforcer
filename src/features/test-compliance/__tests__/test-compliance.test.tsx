import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TestcomplianceView } from '../components/TestcomplianceView';
import { TestcomplianceApi } from '../api';

// Mock the API
jest.mock('../api');

describe('Testcompliance Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<TestcomplianceView id="test-id" />);
    expect(screen.getByText('Loading TestCompliance...')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    const mockData = {
      id: 'test-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (TestcomplianceApi.getById as jest.Mock).mockResolvedValueOnce(mockData);

    render(<TestcomplianceView id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Testcompliance Details')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    const errorMessage = 'Failed to load';
    (TestcomplianceApi.getById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<TestcomplianceView id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('renders empty state when no id provided', () => {
    render(<TestcomplianceView />);
    expect(screen.getByText('No TestCompliance data available')).toBeInTheDocument();
  });
});