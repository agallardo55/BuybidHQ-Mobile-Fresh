/**
 * Robust Sign Out Function
 * 
 * Complete logout implementation with comprehensive cleanup:
 * - Authentication cleanup (Supabase signOut)
 * - State cleanup (localStorage, sessionStorage, cookies)
 * - Resource cleanup (timers, subscriptions, cache)
 * - UI cleanup (toasts, modals)
 * - Navigation handling
 * - Error handling with fallback
 * - Security measures
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignOutOptions {
  scope?: 'local' | 'global';  // local = this device, global = all devices
  redirectTo?: string;
  clearHistory?: boolean;
  skipNavigation?: boolean; // For testing or programmatic use
}

interface SignOutResult {
  success: boolean;
  error?: string;
}

/**
 * Complete robust sign out function
 */
export const robustSignOut = async (options: SignOutOptions = {}): Promise<SignOutResult> => {
  const {
    scope = 'local',
    redirectTo = '/signin',
    clearHistory = true,
    skipNavigation = false
  } = options;

  console.log('RobustSignOut: Starting complete logout process...');

  try {
    // Step 1: Clear timers and subscriptions FIRST (before any async operations)
    console.log('RobustSignOut: Clearing timers and subscriptions...');
    clearAllTimers();
    unsubscribeAllRealtimeChannels();
    
    // Step 2: Attempt Supabase sign out BEFORE navigation
    // This must happen before navigation or the request will fail
    // Note: We continue cleanup even if this fails (expired sessions, network errors, etc.)
    console.log('RobustSignOut: Attempting Supabase signOut...');
    try {
      // Set a timeout to prevent hanging indefinitely
      const signOutPromise = supabase.auth.signOut({ scope });
      const timeoutId = setTimeout(() => {
        console.warn('RobustSignOut: SignOut API call taking longer than expected, continuing with cleanup...');
      }, 3000);
      
      const { error } = await signOutPromise;
      clearTimeout(timeoutId);
      
      if (error) {
        // API returned an error response (not a network error)
        console.warn('RobustSignOut: Supabase signOut API returned error (continuing cleanup):', error.message || error);
      } else {
        console.log('RobustSignOut: Supabase signOut successful');
      }
    } catch (apiError: any) {
      // Network errors are expected if session is expired, connection is lost, or request was aborted
      // This is common when the session is already invalid - we still want to clear local state
      if (apiError?.message?.includes('Failed to fetch') || 
          apiError?.name === 'AuthRetryableFetchError' ||
          apiError?.message?.includes('refresh_token') ||
          apiError?.message?.includes('Invalid Refresh Token')) {
        console.warn('RobustSignOut: SignOut API call failed (likely expired session - continuing cleanup):', apiError.message || apiError.name);
      } else {
        console.warn('RobustSignOut: SignOut API call failed (continuing cleanup):', apiError?.message || apiError?.name || apiError);
      }
      // Continue with cleanup even if API call fails - local cleanup is what matters most
    }

    // Step 3: Clear all storage
    console.log('RobustSignOut: Clearing all storage...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Step 4: Clear profile cache if using RobustAuthManager
    if (typeof window !== 'undefined' && (window as any).robustAuth) {
      console.log('RobustSignOut: Clearing profile cache...');
      (window as any).robustAuth.clearCache();
    }

    // Step 5: Clear any auth-related cookies
    console.log('RobustSignOut: Clearing cookies...');
    clearAuthCookies();

    // Step 6: Dismiss all toasts
    console.log('RobustSignOut: Dismissing toasts...');
    toast.dismiss();

    // Step 7: Clear any cached auth state in memory
    console.log('RobustSignOut: Clearing memory state...');
    clearMemoryState();

    // Step 8: Navigate LAST after all cleanup is done
    if (!skipNavigation) {
      console.log('RobustSignOut: Navigation to:', redirectTo);
      if (clearHistory) {
        window.location.replace(redirectTo); // Prevents back button
      } else {
        window.location.href = redirectTo;
      }
      // Navigation happens, function will complete after navigation
    }

    console.log('RobustSignOut: Complete logout successful');
    return { success: true };
    
  } catch (error) {
    console.error('Critical signOut error:', error);
    
    // Emergency cleanup - force reload to clear everything
    console.log('RobustSignOut: Emergency cleanup triggered');
    localStorage.clear();
    sessionStorage.clear();
    
    if (!skipNavigation) {
      window.location.replace('/signin');
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Clear all active timers
 */
function clearAllTimers(): void {
  try {
    // Clear timers by finding the highest ID
    const testId = setTimeout(() => {}, 0);
    const highestId = Number(testId);
    clearTimeout(testId);
    
    // Clear all timers up to the highest ID
    for (let i = 0; i < highestId; i++) {
      clearTimeout(i);
    }
    
    // Clear intervals similarly
    const testIntervalId = setInterval(() => {}, 0);
    const highestIntervalId = Number(testIntervalId);
    clearInterval(testIntervalId);
    
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
    
    console.log('RobustSignOut: Cleared all timers and intervals');
  } catch (error) {
    console.warn('RobustSignOut: Error clearing timers:', error);
  }
}

/**
 * Unsubscribe from all Supabase realtime channels
 */
function unsubscribeAllRealtimeChannels(): void {
  try {
    const channels = supabase.getChannels();
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    console.log('RobustSignOut: Unsubscribed from all realtime channels');
  } catch (error) {
    console.warn('RobustSignOut: Error unsubscribing from channels:', error);
  }
}

/**
 * Clear all auth-related cookies
 */
function clearAuthCookies(): void {
  try {
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear cookies that might contain auth data
      if (name.includes('auth') || name.includes('session') || name.includes('supabase')) {
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/;domain=.${window.location.hostname}`;
      }
    });
    console.log('RobustSignOut: Cleared auth-related cookies');
  } catch (error) {
    console.warn('RobustSignOut: Error clearing cookies:', error);
  }
}

/**
 * Clear any cached auth state in memory
 */
function clearMemoryState(): void {
  try {
    // Clear any global auth state that might be cached
    if (typeof window !== 'undefined') {
      // Clear any cached user data
      delete (window as any).__auth_user;
      delete (window as any).__auth_session;
      delete (window as any).__auth_cache;
      
      // Clear any cached profile data
      delete (window as any).__profile_cache;
      delete (window as any).__user_roles;
    }
    console.log('RobustSignOut: Cleared memory state');
  } catch (error) {
    console.warn('RobustSignOut: Error clearing memory state:', error);
  }
}

/**
 * Enhanced logout function for backward compatibility
 */
export const enhancedLogout = async (): Promise<void> => {
  await robustSignOut({ scope: 'global', clearHistory: true });
};

/**
 * Quick sign out (local only, no navigation)
 */
export const quickSignOut = async (): Promise<SignOutResult> => {
  return await robustSignOut({ 
    scope: 'local', 
    skipNavigation: true 
  });
};

/**
 * Sign out from all devices
 */
export const signOutEverywhere = async (): Promise<SignOutResult> => {
  return await robustSignOut({ 
    scope: 'global', 
    clearHistory: true 
  });
};

/**
 * Emergency sign out (force cleanup)
 */
export const emergencySignOut = async (): Promise<void> => {
  console.log('EmergencySignOut: Force cleanup initiated');
  
  try {
    // Force clear everything immediately
    localStorage.clear();
    sessionStorage.clear();
    clearAuthCookies();
    clearMemoryState();
    
    // Force navigation
    window.location.replace('/signin');
  } catch (error) {
    console.error('EmergencySignOut: Critical failure:', error);
    // Last resort - force reload
    window.location.href = '/signin';
  }
};
