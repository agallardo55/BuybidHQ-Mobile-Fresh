
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateBidRequest from '../CreateBidRequest';
import { renderWithProviders } from '../../test/utils';
import { mockBidRequest } from '../../test/utils';

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    currentUser: { id: '123' },
    isLoading: false,
  }),
}));

describe('CreateBidRequest', () => {
  it('renders the form correctly', () => {
    renderWithProviders(<CreateBidRequest />);
    expect(screen.getByText('Create Bid Request')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateBidRequest />);

    // Fill in basic vehicle info
    await user.type(screen.getByLabelText(/VIN/i), mockBidRequest.vin);
    await user.type(screen.getByLabelText(/Year/i), mockBidRequest.year);
    await user.type(screen.getByLabelText(/Make/i), mockBidRequest.make);
    await user.type(screen.getByLabelText(/Model/i), mockBidRequest.model);
    await user.type(screen.getByLabelText(/Mileage/i), mockBidRequest.mileage);

    // Navigate to next step
    await user.click(screen.getByText('Next'));

    // Verify navigation to next step
    await waitFor(() => {
      expect(screen.getByText(/Exterior Color/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateBidRequest />);

    // Try to navigate without filling required fields
    await user.click(screen.getByText('Next'));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Year is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Make is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Model is required/i)).toBeInTheDocument();
    });
  });
});
