import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage timezone-based session expiration
 * - Creates session record on mount with midnight expiration
 * - Sets up timer to force logout at midnight
 * - Checks for expiration on page load/visibility change
 */
export const useSessionExpiration = () => {
  const { user } = useAuth();

  // Calculate midnight in user's local timezone
  const getMidnightTimestamp = useCallback(() => {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // Next day
      0, 0, 0, 0 // Midnight
    );
    return midnight;
  }, []);

  // Get timezone info
  const getTimezoneInfo = useCallback(() => {
    const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneOffsetMinutes = -new Date().getTimezoneOffset(); // Negative because getTimezoneOffset is backwards
    return { timezoneName, timezoneOffsetMinutes };
  }, []);

  // Create or update session record
  const createSession = useCallback(async () => {
    if (!user) return;

    const midnight = getMidnightTimestamp();
    const { timezoneName, timezoneOffsetMinutes } = getTimezoneInfo();

    // Upsert session record
    const { error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: user.id,
        session_started_at: new Date().toISOString(),
        session_expires_at: midnight.toISOString(),
        timezone_name: timezoneName,
        timezone_offset_minutes: timezoneOffsetMinutes,
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error creating session:', error);
    } else {
      console.log(`✅ Session created - expires at midnight (${midnight.toLocaleString()})`);
    }
  }, [user, getMidnightTimestamp, getTimezoneInfo]);

  // Check if session is expired and force logout
  const checkAndLogoutIfExpired = useCallback(async () => {
    if (!user) return;

    const { data: isExpired, error } = await supabase.rpc('is_session_expired');

    if (error) {
      console.error('Error checking session expiration:', error);
      return;
    }

    if (isExpired) {
      console.log('🌙 Session expired at midnight - logging out');
      await supabase.auth.signOut();
      // Reload to clear all state
      window.location.href = '/signin';
    }
  }, [user]);

  // Set up midnight logout timer
  useEffect(() => {
    if (!user) return;

    const midnight = getMidnightTimestamp();
    const msUntilMidnight = midnight.getTime() - Date.now();

    console.log(`⏰ Setting logout timer for ${Math.floor(msUntilMidnight / 1000 / 60)} minutes until midnight`);

    // Set timer to logout at midnight
    const timeoutId = setTimeout(async () => {
      console.log('🌙 Midnight reached - forcing logout');
      await supabase.auth.signOut();
      window.location.href = '/signin';
    }, msUntilMidnight);

    // Also check every minute if we're past midnight (backup in case timer fails)
    const intervalId = setInterval(checkAndLogoutIfExpired, 60000); // Check every minute

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [user, getMidnightTimestamp, checkAndLogoutIfExpired]);

  // Create session on mount
  useEffect(() => {
    if (user) {
      createSession();
    }
  }, [user, createSession]);

  // Check expiration when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndLogoutIfExpired();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAndLogoutIfExpired]);

  return null;
};
