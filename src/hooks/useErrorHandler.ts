import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { handleError } from "@/utils/errorHandler";

interface UseErrorHandlerOptions {
  /** Default operation type for this hook instance */
  defaultOperation?: "fetch" | "create" | "update" | "delete" | "submit" | "send" | "load";
}

/**
 * Hook for handling errors with role-based messaging
 *
 * Super admins see technical error details for debugging.
 * Regular users see user-friendly, actionable messages.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const showError = useErrorHandler();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitData();
 *     } catch (error) {
 *       showError(error, "Unable to submit your request.");
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With default operation type
 * const showError = useErrorHandler({ defaultOperation: "fetch" });
 *
 * // Will use "Unable to load data. Please try again." if no userMessage provided
 * showError(error);
 * ```
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { user } = useAuth();
  const userRole = user?.app_metadata?.app_role;

  const showError = useCallback(
    (
      error: unknown,
      userMessage?: string,
      operation?: "fetch" | "create" | "update" | "delete" | "submit" | "send" | "load"
    ) => {
      handleError({
        error,
        userMessage,
        operation: operation || options.defaultOperation,
        userRole,
      });
    },
    [userRole, options.defaultOperation]
  );

  return showError;
}

export default useErrorHandler;
