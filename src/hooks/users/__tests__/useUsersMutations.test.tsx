
import { renderHook } from "@testing-library/react";
import { useUsersMutations } from "../useUsersMutations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect } from "vitest";

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useUsersMutations", () => {
  it("returns all mutation hooks", () => {
    const { result } = renderHook(() => useUsersMutations(), { wrapper });

    expect(result.current.createUser).toBeDefined();
    expect(result.current.updateUser).toBeDefined();
    expect(result.current.deleteUser).toBeDefined();
  });
});
