import { toast } from "sonner";

/**
 * User-friendly error messages for common error patterns
 */
const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  // Network errors
  "Failed to fetch": "Unable to connect. Please check your internet connection.",
  "NetworkError": "Network connection issue. Please try again.",
  "timeout": "Request timed out. Please try again.",

  // Auth errors
  "Invalid login credentials": "Invalid email or password. Please try again.",
  "Email not confirmed": "Please verify your email before signing in.",
  "User not found": "No account found with these credentials.",
  "JWT expired": "Your session has expired. Please sign in again.",

  // Database errors
  "duplicate key": "This record already exists.",
  "violates foreign key": "This action cannot be completed due to related data.",
  "permission denied": "You don't have permission to perform this action.",

  // General
  "Internal Server Error": "Something went wrong on our end. Please try again.",
  "500": "Server error. Please try again later.",
  "503": "Service temporarily unavailable. Please try again.",
};

/**
 * Default user-friendly messages by operation type
 */
const DEFAULT_MESSAGES: Record<string, string> = {
  fetch: "Unable to load data. Please try again.",
  create: "Unable to create. Please try again.",
  update: "Unable to save changes. Please try again.",
  delete: "Unable to delete. Please try again.",
  submit: "Unable to submit. Please try again.",
  send: "Unable to send. Please try again.",
  load: "Unable to load. Please try again.",
  default: "Something went wrong. Please try again.",
};

interface ErrorHandlerOptions {
  /** The error object or message */
  error: unknown;
  /** User-friendly message to show non-admin users */
  userMessage?: string;
  /** Operation type for default message fallback */
  operation?: "fetch" | "create" | "update" | "delete" | "submit" | "send" | "load";
  /** User's app_role from AuthContext */
  userRole?: string;
  /** Whether to show a toast (default: true) */
  showToast?: boolean;
  /** Toast duration in ms (default: 5000) */
  duration?: number;
}

/**
 * Extracts error message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    // Handle Supabase errors
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
    // Handle error with code
    if ("code" in error && typeof (error as { code: unknown }).code === "string") {
      return (error as { code: string }).code;
    }
  }
  return "Unknown error occurred";
}

/**
 * Finds a user-friendly message for the error
 */
function findUserFriendlyMessage(errorMessage: string, operation?: string): string {
  // Check for matching patterns in USER_FRIENDLY_MESSAGES
  for (const [pattern, friendlyMessage] of Object.entries(USER_FRIENDLY_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }

  // Fall back to operation-specific default
  if (operation && DEFAULT_MESSAGES[operation]) {
    return DEFAULT_MESSAGES[operation];
  }

  return DEFAULT_MESSAGES.default;
}

/**
 * Handles errors with role-based messaging
 *
 * - Super admins see technical error details
 * - Regular users see friendly, actionable messages
 *
 * @example
 * ```typescript
 * // In a component or hook
 * const { user } = useAuth();
 *
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError({
 *     error,
 *     userMessage: "Unable to save your changes.",
 *     userRole: user?.app_metadata?.app_role,
 *   });
 * }
 * ```
 */
export function handleError(options: ErrorHandlerOptions): void {
  const {
    error,
    userMessage,
    operation,
    userRole,
    showToast = true,
    duration = 5000,
  } = options;

  const technicalMessage = extractErrorMessage(error);
  const isSuperAdmin = userRole === "super_admin";

  // Log technical details for debugging (always)
  console.error("[Error]", technicalMessage, error);

  if (!showToast) return;

  if (isSuperAdmin) {
    // Super admins see technical details
    toast.error(technicalMessage, {
      duration,
      description: "Technical error (visible to super admins only)",
    });
  } else {
    // Regular users see friendly message
    const friendlyMessage = userMessage || findUserFriendlyMessage(technicalMessage, operation);
    toast.error(friendlyMessage, { duration });
  }
}

/**
 * React hook for error handling with auth context
 *
 * @example
 * ```typescript
 * const showError = useErrorHandler();
 *
 * try {
 *   await someOperation();
 * } catch (error) {
 *   showError(error, "Unable to complete the operation.");
 * }
 * ```
 */
export function createErrorHandler(userRole?: string) {
  return (error: unknown, userMessage?: string, operation?: ErrorHandlerOptions["operation"]) => {
    handleError({
      error,
      userMessage,
      operation,
      userRole,
    });
  };
}
