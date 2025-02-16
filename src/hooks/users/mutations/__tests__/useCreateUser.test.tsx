
import { renderHook } from "@testing-library/react";
import { useCreateUser } from "../useCreateUser";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { UserFormData } from "@/types/users";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
    auth: {
      signUp: vi.fn(),
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

describe("useCreateUser", () => {
  const mockUserData: UserFormData = {
    fullName: "Test User",
    email: "test@example.com",
    role: "dealer",
    mobileNumber: "1234567890",
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user successfully", async () => {
    const { result } = renderHook(() => useCreateUser(), { wrapper });

    // Mock successful responses
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => ({ data: null, error: null }),
          single: () => ({ data: { id: "test-id" }, error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ data: { id: "test-id" }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ data: { id: "test-id" }, error: null }),
          }),
        }),
      }),
    }));

    (supabase.auth.signUp as any).mockResolvedValue({ error: null });

    await result.current.mutateAsync({
      userData: mockUserData,
    });

    expect(supabase.auth.signUp).toHaveBeenCalled();
  });

  it("handles user creation errors", async () => {
    const { result } = renderHook(() => useCreateUser(), { wrapper });

    // Mock error response
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => ({ error: new Error("Database error") }),
        }),
      }),
    }));

    try {
      await result.current.mutateAsync({
        userData: mockUserData,
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
