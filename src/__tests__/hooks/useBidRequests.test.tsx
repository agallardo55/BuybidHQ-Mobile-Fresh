/**
 * useBidRequests Hook Tests
 * 
 * Tests for bid request data normalization and state management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useBidRequests } from '@/hooks/useBidRequests';
import { supabase } from '@/integrations/supabase/client';
import { BidRequest } from '@/components/bid-request/types';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isLoading: false,
  }),
}));

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
      {children}
    </QueryClientProvider>
  );
};

describe('useBidRequests', () => {
  const mockBidRequestData = [
    {
      id: '1',
      created_at: '2024-01-01T00:00:00Z',
      status: 'Pending',
      user_id: 'test-user-id',
      account_id: 'test-account-id',
      vehicle_id: 'vehicle-1',
      recon: 'recon-1',
      vehicles: {
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
      reconditioning: {
        id: 'recon-1',
        windshield: 'Good',
        brakes: 'Fair',
        tires: 'Good',
        engine_light: 'None',
        maintenance: 'Recent oil change',
        recon_estimate: '$2000',
        recon_details: 'Minor cosmetic work needed',
      },
      images: [
        {
          id: 'img-1',
          image_url: 'https://example.com/image1.jpg',
          sequence_order: 1,
        },
        {
          id: 'img-2', 
          image_url: 'https://example.com/image2.jpg',
          sequence_order: 2,
        },
      ],
      bid_responses: [
        {
          id: 'response-1',
          offer_amount: 15000,
          status: 'pending',
          buyer_id: 'buyer-1',
          buyers: {
            id: 'buyer-1',
            buyer_name: 'John Doe',
            dealer_name: 'Doe Motors',
            email: 'john@doemotors.com',
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and normalize bid request data', async () => {
    const mockFrom = vi.mocked(supabase.from);
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockOrder = vi.fn();

    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    mockSelect.mockReturnValue({
      eq: mockEq,
    } as any);

    mockEq.mockReturnValue({
      order: mockOrder,
    } as any);

    mockOrder.mockResolvedValue({
      data: mockBidRequestData,
      error: null,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidRequests(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bidRequests).toHaveLength(1);
    
    const bidRequest = result.current.bidRequests[0];
    expect(bidRequest.id).toBe('1');
    expect(bidRequest.status).toBe('Pending');
    expect(bidRequest.vehicle?.make).toBe('Toyota');
    expect(bidRequest.vehicle?.model).toBe('Camry');
    expect(bidRequest.reconditioning?.windshield).toBe('Good');
    expect(bidRequest.images).toHaveLength(2);
    expect(bidRequest.responses).toHaveLength(1);
    expect(bidRequest.responses?.[0].offer_amount).toBe(15000);
  });

  it('should handle empty data', async () => {
    const mockFrom = vi.mocked(supabase.from);
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockOrder = vi.fn();

    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    mockSelect.mockReturnValue({
      eq: mockEq,
    } as any);

    mockEq.mockReturnValue({
      order: mockOrder,
    } as any);

    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidRequests(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bidRequests).toEqual([]);
  });

  it('should handle query errors', async () => {
    const mockFrom = vi.mocked(supabase.from);
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockOrder = vi.fn();

    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    mockSelect.mockReturnValue({
      eq: mockEq,
    } as any);

    mockEq.mockReturnValue({
      order: mockOrder,
    } as any);

    mockOrder.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidRequests(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.bidRequests).toEqual([]);
  });

  it('should update bid request status', async () => {
    const mockFrom = vi.mocked(supabase.from);
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockOrder = vi.fn();
    const mockUpdate = vi.fn();

    // Setup initial fetch
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    } as any);

    mockSelect.mockReturnValue({
      eq: mockEq,
    } as any);

    mockEq.mockReturnValue({
      order: mockOrder,
    } as any);

    mockOrder.mockResolvedValue({
      data: mockBidRequestData,
      error: null,
    });

    // Setup update
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ ...mockBidRequestData[0], status: 'Active' }],
          error: null,
        }),
      }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidRequests(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bidRequests[0].status).toBe('Pending');

    // Test update function
    if (result.current.updateBidRequest) {
      await result.current.updateBidRequest('1', { status: 'Active' });
    }

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'Active' });
  });

  it('should handle missing vehicle data gracefully', async () => {
    const incompleteData = [
      {
        id: '1',
        created_at: '2024-01-01T00:00:00Z',
        status: 'Pending',
        user_id: 'test-user-id',
        account_id: 'test-account-id',
        vehicle_id: null,
        recon: null,
        vehicles: null,
        reconditioning: null,
        images: [],
        bid_responses: [],
      },
    ];

    const mockFrom = vi.mocked(supabase.from);
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockOrder = vi.fn();

    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    mockSelect.mockReturnValue({
      eq: mockEq,
    } as any);

    mockEq.mockReturnValue({
      order: mockOrder,
    } as any);

    mockOrder.mockResolvedValue({
      data: incompleteData,
      error: null,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBidRequests(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bidRequests).toHaveLength(1);
    
    const bidRequest = result.current.bidRequests[0];
    expect(bidRequest.id).toBe('1');
    expect(bidRequest.vehicle).toBeNull();
    expect(bidRequest.reconditioning).toBeNull();
    expect(bidRequest.images).toEqual([]);
    expect(bidRequest.responses).toEqual([]);
  });
});