// This file creates a public Supabase client for anonymous access
import { supabase } from './client';

// Re-export the main client as publicSupabase for backward compatibility
// This ensures we only have ONE Supabase instance to prevent auth conflicts
export const publicSupabase = supabase;