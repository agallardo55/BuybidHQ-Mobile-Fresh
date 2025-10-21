// Test script to verify single Supabase client fix
// Run this in browser console

console.log('=== TESTING SINGLE SUPABASE CLIENT FIX ===');

const testSingleClient = async () => {
  try {
    // Test 1: Check if there are multiple client warnings
    console.log('🔍 Test 1: Checking for multiple client warnings...');
    console.log('Look in the browser console for "Multiple GoTrueClient instances" warnings');
    console.log('✅ If you see NO warnings = Fix successful');
    console.log('❌ If you see warnings = Still have multiple clients');
    
    // Test 2: Import both clients and check if they're the same instance
    console.log('🔍 Test 2: Testing client instances...');
    
    // Import main client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Import public client
    const { publicSupabase } = await import('@/integrations/supabase/publicClient');
    
    // Check if they're the same instance
    const areSameInstance = supabase === publicSupabase;
    
    if (areSameInstance) {
      console.log('✅ Both clients are the SAME instance - Fix successful!');
    } else {
      console.log('❌ Clients are DIFFERENT instances - Still have multiple clients!');
    }
    
    // Test 3: Test session consistency
    console.log('🔍 Test 3: Testing session consistency...');
    
    const { data: { session: session1 } } = await supabase.auth.getSession();
    const { data: { session: session2 } } = await publicSupabase.auth.getSession();
    
    const sessionsMatch = session1?.user?.id === session2?.user?.id;
    
    if (sessionsMatch) {
      console.log('✅ Sessions match between clients - No conflicts!');
    } else {
      console.log('❌ Sessions differ between clients - Still have conflicts!');
    }
    
    // Test 4: Test auth state change listener
    console.log('🔍 Test 4: Testing auth state change listener...');
    
    let listenerCalled = false;
    let eventCount = 0;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'session exists' : 'no session');
      listenerCalled = true;
      eventCount++;
    });
    
    // Wait for any initial events
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    subscription.unsubscribe();
    
    if (listenerCalled) {
      console.log('✅ Auth state listener working, events:', eventCount);
    } else {
      console.log('ℹ️ No auth state changes detected');
    }
    
    console.log('=== SUMMARY ===');
    console.log('✅ Single client instance:', areSameInstance);
    console.log('✅ Session consistency:', sessionsMatch);
    console.log('✅ Auth listener working:', listenerCalled);
    
    if (areSameInstance && sessionsMatch) {
      console.log('🎉 SINGLE CLIENT FIX SUCCESSFUL!');
      console.log('✅ No more multiple client conflicts');
      console.log('✅ Auth state is consistent');
      console.log('✅ Login should now work properly');
      console.log('');
      console.log('Next steps:');
      console.log('1. Clear browser storage: localStorage.clear()');
      console.log('2. Refresh the page');
      console.log('3. Sign in');
      console.log('4. Should stay logged in without conflicts!');
    } else {
      console.log('🚨 ISSUES REMAIN - Check details above');
    }
    
  } catch (error) {
    console.error('💥 Error in testing:', error);
  }
};

// Run the test
testSingleClient();
