/**
 * Enhanced Authentication Utilities
 * 
 * Provides robust logout and session management to fix user switching issues
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { robustSignOut } from "./robust-signout";

/**
 * Enhanced logout function that ensures complete session cleanup
 * This fixes issues with switching between different user accounts
 * @deprecated Use robustSignOut instead
 */
export const enhancedLogout = async (): Promise<void> => {
  console.log('Enhanced logout: Redirecting to robustSignOut...');
  await robustSignOut({ scope: 'global', clearHistory: true });
};

/**
 * Manually clear all Supabase-related data from localStorage
 */
const clearSupabaseLocalStorage = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Find all Supabase-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('supabase.auth.token') ||
        key.startsWith('sb-') ||
        key.includes('supabase') ||
        key.includes('auth')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared localStorage key: ${key}`);
    });
    
    // Also clear sessionStorage
    sessionStorage.clear();
    
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Clear any cached session data
 */
const clearSessionCache = async (): Promise<void> => {
  try {
    // Force a fresh session check to ensure state is cleared
    await supabase.auth.getSession();
  } catch (error) {
    console.error('Error clearing session cache:', error);
  }
};

/**
 * Debug function to check current auth state
 */
export const debugAuthState = async (): Promise<void> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Current session:', session);
    console.log('Session error:', error);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('User error:', userError);
  } catch (error) {
    console.error('Debug auth state error:', error);
  }
};