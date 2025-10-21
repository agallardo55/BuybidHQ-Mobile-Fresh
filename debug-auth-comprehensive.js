// Comprehensive Auth Debug Script
// Run this in browser console to debug auth timeout issues

console.log('=== COMPREHENSIVE AUTH DEBUG SCRIPT ===');

const debugAuthFlow = async () => {
  try {
    // Test 1: Check Supabase client configuration
    console.log('🔍 Test 1: Supabase Client Configuration');
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('Supabase client:', {
      url: supabase.supabaseUrl,
      key: supabase.supabaseKey?.substring(0, 20) + '...',
      auth: supabase.auth
    });
    
    // Test 2: Check current session
    console.log('🔍 Test 2: Current Session Check');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session check result:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      error: sessionError
    });
    
    // Test 3: Check localStorage
    console.log('🔍 Test 3: LocalStorage Check');
    const supabaseKeys = Object.keys(localStorage).filter(k => k.includes('supabase'));
    console.log('Supabase storage keys:', supabaseKeys);
    
    supabaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? value.substring(0, 100) + '...' : 'null');
    });
    
    // Test 4: Test direct auth query
    console.log('🔍 Test 4: Direct Auth Query');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('Direct user query:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: userError
    });
    
    // Test 5: Test buybidhq_users table access
    console.log('🔍 Test 5: Database Access Test');
    if (user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('buybidhq_users')
          .select('id, email, role, account_id, dealership_id')
          .eq('id', user.id)
          .single();
          
        console.log('Profile query result:', {
          profile,
          error: profileError
        });
      } catch (err) {
        console.log('Profile query error:', err);
      }
    } else {
      console.log('Skipping profile query - no user');
    }
    
    // Test 6: Auth state change listener test
    console.log('🔍 Test 6: Auth State Change Listener Test');
    let listenerCalled = false;
    let eventCount = 0;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change detected:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id
      });
      listenerCalled = true;
      eventCount++;
    });
    
    // Wait for any events
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    subscription.unsubscribe();
    
    console.log('Auth listener test:', {
      listenerCalled,
      eventCount
    });
    
    // Test 7: Check for multiple clients
    console.log('🔍 Test 7: Multiple Client Check');
    const { publicSupabase } = await import('@/integrations/supabase/publicClient');
    const areSameInstance = supabase === publicSupabase;
    
    console.log('Client instance check:', {
      areSameInstance,
      mainClient: supabase,
      publicClient: publicSupabase
    });
    
    // Summary
    console.log('=== SUMMARY ===');
    console.log('✅ Session exists:', !!session);
    console.log('✅ User authenticated:', !!user);
    console.log('✅ Database accessible:', user ? 'tested' : 'skipped');
    console.log('✅ Auth listener working:', listenerCalled);
    console.log('✅ Single client instance:', areSameInstance);
    
    if (session && user) {
      console.log('🎉 AUTH IS WORKING - Issue is likely in component logic');
      console.log('');
      console.log('Next steps:');
      console.log('1. Check browser console for ProtectedRoute/AuthRoute logs');
      console.log('2. Look for "Loading timeout reached" messages');
      console.log('3. Check if AuthContext isLoading is stuck at true');
    } else {
      console.log('🚨 AUTH IS NOT WORKING - Need to fix login process');
      console.log('');
      console.log('Next steps:');
      console.log('1. Try signing in again');
      console.log('2. Check for auth errors in console');
      console.log('3. Verify credentials are correct');
    }
    
  } catch (error) {
    console.error('💥 Debug script error:', error);
  }
};

// Run the debug
debugAuthFlow();
