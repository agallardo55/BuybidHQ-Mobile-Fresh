/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling across the application
 */

import { toast } from "@/utils/notificationToast";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400, { fields });
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 503);
  }
}

/**
 * Handle errors consistently across the application
 */
export function handleError(error: unknown, context: string): AppError {
  console.error(`[${context}]`, error);
  
  // If it's already our custom error, just return it
  if (error instanceof AppError) {
    toast.error(error.message);
    return error;
  }
  
  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string };
    
    // JWT/Auth errors
    if (supabaseError.code === 'PGRST301' || 
        supabaseError.message?.includes('JWT') ||
        supabaseError.message?.includes('refresh token')) {
      const authError = new AuthenticationError('Session expired. Please sign in again.');
      toast.error(authError.message);
      return authError;
    }
    
    // RLS policy violations
    if (supabaseError.code?.startsWith('PGRST') || supabaseError.code?.startsWith('42')) {
      const permissionError = new AppError(
        'You do not have permission to perform this action',
        'PERMISSION_DENIED',
        403
      );
      toast.error(permissionError.message);
      return permissionError;
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    const appError = new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      500,
      { originalError: error.name }
    );
    toast.error('An unexpected error occurred');
    return appError;
  }
  
  // Fallback for unknown error types
  const unknownError = new AppError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    { error: String(error) }
  );
  toast.error(unknownError.message);
  return unknownError;
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof AuthenticationError ||
         (error && typeof error === 'object' && 'code' in error && 
          (error.code === 'PGRST301' || String(error).includes('JWT')));
}

/**
 * Log error to external service (Sentry, etc.)
 * TODO: Implement when error tracking service is added
 */
export function logErrorToService(error: AppError, context: string): void {
  // Only log in production
  if (import.meta.env.PROD) {
    // TODO: Send to Sentry or other error tracking service
    console.error('[Error Service]', {
      message: error.message,
      code: error.code,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

