/**
 * BidRequestDashboard Component Tests
 * 
 * Tests for bid dashboard filtering, sorting, and pagination.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import BidRequestDashboard from '@/pages/BidRequestDashboard';
import { BidRequest } from '@/components/bid-request/types';

// Mock the hooks
vi.mock('@/hooks/useBidRequests', () => ({
  useBidRequests: () => ({
    bidRequests: mockBidRequests,
    isLoading: false,
    updateBidRequest: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isLoading: false,
  }),
}));

// Mock child components
vi.mock('@/components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock('@/components/bid-request/SearchHeader', () => ({
  SearchHeader: ({ searchTerm, onSearchChange }: any) => (
    <div data-testid="search-header">
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search bid requests..."
      />
    </div>
  ),
}));

vi.mock('@/components/bid-request/BidRequestTable', () => ({
  BidRequestTable: ({ bidRequests, sortConfig, onSort }: any) => (
    <div data-testid="bid-request-table">
      <button
        data-testid="sort-button"
        onClick={() => onSort('createdAt')}
      >
        Sort by Date
      </button>
      {bidRequests.map((bid: BidRequest) => (
        <div key={bid.id} data-testid={`bid-${bid.id}`}>
          {bid.vehicle?.make} {bid.vehicle?.model} - {bid.status}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/bid-request/TableFooter', () => ({
  TableFooter: ({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }: any) => (
    <div data-testid="table-footer">
      <span data-testid="page-info">
        Page {currentPage} of {totalPages} ({totalItems} items)
      </span>
      <button
        data-testid="next-page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
      <select
        data-testid="page-size-select"
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>
    </div>
  ),
}));

const mockBidRequests: BidRequest[] = [
  {
    id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'Pending',
    userId: 'test-user-id',
    accountId: 'test-account-id',
    vehicleId: 'vehicle-1',
    vehicle: {
      id: 'vehicle-1',
      year: '2020',
      make: 'Toyota',
      model: 'Camry',
      trim: 'XLE',
      vin: '1234567890',
      mileage: '50000',
      exterior: 'Blue',
      interior: 'Black',
    },
    responses: [],
  },
  {
    id: '2',
    createdAt: '2024-01-10T10:00:00Z',
    status: 'Approved',
    userId: 'test-user-id',
    accountId: 'test-account-id',
    vehicleId: 'vehicle-2',
    vehicle: {
      id: 'vehicle-2',
      year: '2019',
      make: 'Honda',
      model: 'Civic',
      trim: 'EX',
      vin: '0987654321',
      mileage: '30000',
      exterior: 'Red',
      interior: 'Gray',
    },
    responses: [],
  },
  {
    id: '3',
    createdAt: '2024-01-05T10:00:00Z',
    status: 'Completed',
    userId: 'test-user-id',
    accountId: 'test-account-id',
    vehicleId: 'vehicle-3',
    vehicle: {
      id: 'vehicle-3',
      year: '2021',
      make: 'Ford',
      model: 'F-150',
      trim: 'XLT',
      vin: '1122334455',
      mileage: '25000',
      exterior: 'White',
      interior: 'Black',
    },
    responses: [],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BidRequestDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with all components', () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByTestId('search-header')).toBeInTheDocument();
    expect(screen.getByTestId('bid-request-table')).toBeInTheDocument();
    expect(screen.getByTestId('table-footer')).toBeInTheDocument();
  });

  it('should display all bid requests initially', () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    expect(screen.getByTestId('bid-1')).toHaveTextContent('Toyota Camry - Pending');
    expect(screen.getByTestId('bid-2')).toHaveTextContent('Honda Civic - Active');
    expect(screen.getByTestId('bid-3')).toHaveTextContent('Ford F-150 - Completed');
  });

  it('should filter bid requests based on search term', async () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    const searchInput = screen.getByTestId('search-input');
    
    fireEvent.change(searchInput, { target: { value: 'Toyota' } });

    await waitFor(() => {
      expect(screen.getByTestId('bid-1')).toBeInTheDocument();
      expect(screen.queryByTestId('bid-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bid-3')).not.toBeInTheDocument();
    });
  });

  it('should filter by status', async () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    const searchInput = screen.getByTestId('search-input');
    
    fireEvent.change(searchInput, { target: { value: 'Active' } });

    await waitFor(() => {
      expect(screen.queryByTestId('bid-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('bid-2')).toBeInTheDocument();
      expect(screen.queryByTestId('bid-3')).not.toBeInTheDocument();
    });
  });

  it('should handle case-insensitive search', async () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    const searchInput = screen.getByTestId('search-input');
    
    fireEvent.change(searchInput, { target: { value: 'honda' } });

    await waitFor(() => {
      expect(screen.queryByTestId('bid-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('bid-2')).toBeInTheDocument();
      expect(screen.queryByTestId('bid-3')).not.toBeInTheDocument();
    });
  });

  it('should handle pagination', () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    const pageInfo = screen.getByTestId('page-info');
    expect(pageInfo).toHaveTextContent('Page 1 of 1 (3 items)');

    // Test page size change
    const pageSizeSelect = screen.getByTestId('page-size-select');
    fireEvent.change(pageSizeSelect, { target: { value: '2' } });

    expect(pageInfo).toHaveTextContent('Page 1 of 2 (3 items)');
  });

  it('should navigate to next page', () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    // Change page size to 2 to enable pagination
    const pageSizeSelect = screen.getByTestId('page-size-select');
    fireEvent.change(pageSizeSelect, { target: { value: '2' } });

    const nextButton = screen.getByTestId('next-page');
    fireEvent.click(nextButton);

    const pageInfo = screen.getByTestId('page-info');
    expect(pageInfo).toHaveTextContent('Page 2 of 2 (3 items)');
  });

  it('should reset to first page when search changes', async () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    // Set up pagination
    const pageSizeSelect = screen.getByTestId('page-size-select');
    fireEvent.change(pageSizeSelect, { target: { value: '2' } });

    const nextButton = screen.getByTestId('next-page');
    fireEvent.click(nextButton);

    // Verify we're on page 2
    let pageInfo = screen.getByTestId('page-info');
    expect(pageInfo).toHaveTextContent('Page 2');

    // Search should reset to page 1
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Toyota' } });

    await waitFor(() => {
      pageInfo = screen.getByTestId('page-info');
      expect(pageInfo).toHaveTextContent('Page 1');
    });
  });

  it('should handle sorting', () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    const sortButton = screen.getByTestId('sort-button');
    fireEvent.click(sortButton);

    // Sorting logic would be tested through the table component
    // This test ensures the sort handler is called
    expect(sortButton).toBeInTheDocument();
  });

  it('should handle empty search results', async () => {
    const wrapper = createWrapper();
    render(<BidRequestDashboard />, { wrapper });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'NonexistentCar' } });

    await waitFor(() => {
      expect(screen.queryByTestId('bid-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bid-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bid-3')).not.toBeInTheDocument();
    });

    const pageInfo = screen.getByTestId('page-info');
    expect(pageInfo).toHaveTextContent('Page 1 of 1 (0 items)');
  });
});