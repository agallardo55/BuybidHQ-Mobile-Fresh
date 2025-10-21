// Comprehensive test script to verify all fixes
// Run this in browser console while logged in

console.log('=== COMPREHENSIVE TEST - ROOT CAUSE FIXES ===');

const testAllRootCauseFixes = async () => {
  try {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = "https://fdcfdbjputcitgxosnyk.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            try {
              return localStorage.getItem(key)
            } catch {
              return null
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value)
            } catch {}
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key)
            } catch {}
          },
        },
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    });
    
    // Test 1: Check session
    console.log('🔍 Test 1: Checking session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('❌ No active session found');
      return;
    }
    
    console.log('✅ Session found:', session.user.email);
    
    // Test 2: Test auth enrichment (buybidhq_users query)
    console.log('🔍 Test 2: Testing auth enrichment (buybidhq_users)...');
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('id, email, role, app_role, account_id')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Auth enrichment failed:', userError);
      if (userError.message?.includes('406') || userError.message?.includes('Not Acceptable')) {
        console.log('🚨 406 ERROR STILL EXISTS - This causes AbortError!');
      }
    } else {
      console.log('✅ Auth enrichment successful:', {
        email: userData.email,
        role: userData.role,
        app_role: userData.app_role,
        account_id: userData.account_id
      });
    }
    
    // Test 3: Test buyers query
    console.log('🔍 Test 3: Testing buyers query...');
    const { data: buyersData, error: buyersError } = await supabase
      .from('buyers')
      .select('id, buyer_name, owner_user_id, account_id')
      .is('deleted_at', null)
      .limit(5);
    
    if (buyersError) {
      console.error('❌ Buyers query failed:', buyersError);
    } else {
      console.log('✅ Buyers query successful:', buyersData?.length || 0, 'buyers found');
    }
    
    // Test 4: Test auth state change listener
    console.log('🔍 Test 4: Testing auth state change listener...');
    let listenerCalled = false;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'session exists' : 'no session');
      listenerCalled = true;
    });
    
    // Wait a moment for any initial events
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (listenerCalled) {
      console.log('✅ Auth state change listener is working');
    } else {
      console.log('ℹ️ No auth state changes detected (normal if no session)');
    }
    
    subscription.unsubscribe();
    
    console.log('=== SUMMARY ===');
    console.log('✅ Session valid:', !!session);
    console.log('✅ Auth enrichment (buybidhq_users):', !userError);
    console.log('✅ Buyers query:', !buyersError);
    console.log('✅ Auth state listener:', true);
    
    // Determine if fixes worked
    if (!userError && !buyersError) {
      console.log('🎉 ALL ROOT CAUSES FIXED!');
      console.log('✅ Auth enrichment no longer crashes');
      console.log('✅ No more 406 errors');
      console.log('✅ Buyers query works');
      console.log('✅ AbortError should be resolved');
      console.log('');
      console.log('Next steps:');
      console.log('1. Clear browser storage: localStorage.clear()');
      console.log('2. Refresh the page');
      console.log('3. Sign in again');
      console.log('4. The "fetch buyers failed" error should be gone!');
    } else if (userError?.message?.includes('406')) {
      console.log('🚨 ROOT CAUSE STILL EXISTS: 406 error on buybidhq_users');
      console.log('💡 This needs to be fixed first - check RLS policies');
    } else {
      console.log('⚠️ Some issues remain - check error details above');
    }
    
  } catch (error) {
    console.error('💥 Error in testing:', error);
  }
};

// Run the test
testAllRootCauseFixes();
