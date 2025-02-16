
import { renderHook } from "@testing-library/react";
import { useDeleteUser } from "../useDeleteUser";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    auth: {
      getSession: vi.fn(() => ({
        data: { session: { user: { id: "test-user-id" } } },
      })),
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes user successfully", async () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    // Mock successful responses
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: { id: "test-id", role: "basic" }, error: null }),
        }),
      }),
      insert: () => ({ error: null }),
      delete: () => ({
        eq: () => ({ error: null }),
      }),
    }));

    await result.current.mutateAsync({
      userId: "test-id",
      reason: "Test deletion",
    });

    expect(supabase.from).toHaveBeenCalledWith("buybidhq_users");
  });

  it("handles deletion errors", async () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    // Mock error response
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => ({ error: new Error("Deletion failed") }),
        }),
      }),
    }));

    try {
      await result.current.mutateAsync({
        userId: "test-id",
        reason: "Test deletion",
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("handles primary dealer deletion", async () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    // Mock responses for primary dealer scenario
    const mockImplementation = {
      select: () => ({
        eq: () => ({
          single: () => ({ data: { id: "test-id", role: "dealer" }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({ error: null }),
      }),
      insert: () => ({ error: null }),
      delete: () => ({
        eq: () => ({ error: null }),
      }),
    };

    (supabase.from as any)
      .mockImplementationOnce(() => ({
        ...mockImplementation,
        select: () => ({
          eq: () => ({
            single: () => ({ data: { id: "test-id", role: "dealer" }, error: null }),
          }),
        }),
      }))
      .mockImplementationOnce(() => ({
        ...mockImplementation,
        select: () => ({
          eq: () => ({
            single: () => ({ data: { primary_user_id: "test-id" }, error: null }),
          }),
        }),
      }));

    await result.current.mutateAsync({
      userId: "test-id",
      reason: "Test deletion",
    });

    expect(supabase.from).toHaveBeenCalledWith("dealerships");
  });
});
