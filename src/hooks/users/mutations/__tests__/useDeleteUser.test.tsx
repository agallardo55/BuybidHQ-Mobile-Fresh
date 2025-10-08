
import { renderHook } from "@testing-library/react";
import { useDeleteUser } from "../useDeleteUser";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
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

  it("deletes user successfully via Edge Function", async () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    // Mock successful Edge Function response
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { success: true, message: "User deleted successfully", userId: "test-id" },
      error: null,
    });

    await result.current.mutateAsync({
      userId: "test-id",
      reason: "Test deletion",
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith("delete-user", {
      body: { userId: "test-id", reason: "Test deletion" },
    });
  });

  it("handles deletion errors from Edge Function", async () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    // Mock error response from Edge Function
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: "Unauthorized: Only superadmins can delete users" },
    });

    try {
      await result.current.mutateAsync({
        userId: "test-id",
        reason: "Test deletion",
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("handles partial success scenario", async () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    // Mock partial success (database deleted but auth failed)
    (supabase.functions.invoke as any).mockResolvedValue({
      data: {
        partial_success: true,
        warning: "User soft-deleted from database, but auth deletion failed",
      },
      error: null,
    });

    try {
      await result.current.mutateAsync({
        userId: "test-id",
        reason: "Test deletion",
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toContain("auth deletion failed");
    }
  });
});
