
import { renderHook } from "@testing-library/react";
import { useUpdateUser } from "../useUpdateUser";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserFormData } from "@/types/users";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
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

describe("useUpdateUser", () => {
  const mockUserData: UserFormData = {
    fullName: "Updated User",
    email: "test@example.com",
    role: "dealer",
    mobileNumber: "1234567890",
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates user successfully", async () => {
    const { result } = renderHook(() => useUpdateUser(), { wrapper });

    // Mock successful responses
    (supabase.from as any).mockImplementation(() => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ data: { id: "test-id" }, error: null }),
          }),
        }),
      }),
    }));

    await result.current.mutateAsync({
      userId: "test-id",
      userData: mockUserData,
    });

    expect(supabase.from).toHaveBeenCalledWith("buybidhq_users");
  });

  it("handles update errors", async () => {
    const { result } = renderHook(() => useUpdateUser(), { wrapper });

    // Mock error response
    (supabase.from as any).mockImplementation(() => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ error: new Error("Update failed") }),
          }),
        }),
      }),
    }));

    try {
      await result.current.mutateAsync({
        userId: "test-id",
        userData: mockUserData,
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
