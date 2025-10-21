// Comprehensive test script to verify login flow fixes
// Run this in browser console

console.log('=== TESTING LOGIN FLOW FIXES ===');

const testLoginFlow = async () => {
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
    
    // Test 1: Check current session
    console.log('🔍 Test 1: Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else if (session) {
      console.log('✅ Session exists:', session.user.email);
    } else {
      console.log('ℹ️ No session found (user not logged in)');
    }
    
    // Test 2: Check localStorage for auth tokens
    console.log('🔍 Test 2: Checking localStorage...');
    const authToken = localStorage.getItem('supabase.auth.token');
    const authSession = localStorage.getItem('supabase.auth.session');
    
    console.log('Auth token exists:', !!authToken);
    console.log('Auth session exists:', !!authSession);
    
    // Test 3: Test auth state change listener
    console.log('🔍 Test 3: Testing auth state change listener...');
    let listenerCalled = false;
    let lastEvent = null;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? 'session exists' : 'no session');
      listenerCalled = true;
      lastEvent = event;
    });
    
    // Wait a moment for any initial events
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (listenerCalled) {
      console.log('✅ Auth state change listener is working');
      console.log('Last event:', lastEvent);
    } else {
      console.log('ℹ️ No auth state changes detected');
    }
    
    subscription.unsubscribe();
    
    // Test 4: Test user enrichment (buybidhq_users query)
    if (session?.user) {
      console.log('🔍 Test 4: Testing user enrichment...');
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('id, email, role, app_role, account_id')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        console.error('❌ User enrichment failed:', userError);
        if (userError.message?.includes('406')) {
          console.log('🚨 406 ERROR - This will cause login issues!');
        }
      } else {
        console.log('✅ User enrichment successful:', {
          email: userData.email,
          role: userData.role,
          app_role: userData.app_role,
          account_id: userData.account_id
        });
      }
    }
    
    // Test 5: Test buyers query (if user is logged in)
    if (session?.user) {
      console.log('🔍 Test 5: Testing buyers query...');
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
    }
    
    // Test 6: Check for multiple client warnings
    console.log('🔍 Test 6: Checking for multiple client warnings...');
    console.log('Check browser console for "Multiple GoTrueClient" warnings');
    
    console.log('=== SUMMARY ===');
    console.log('✅ Session valid:', !!session);
    console.log('✅ Auth tokens in localStorage:', !!(authToken || authSession));
    console.log('✅ Auth state listener:', listenerCalled);
    console.log('✅ User enrichment:', session?.user ? !userError : 'N/A');
    console.log('✅ Buyers query:', session?.user ? !buyersError : 'N/A');
    
    // Determine if login flow is working
    if (session && !userError && !buyersError) {
      console.log('🎉 LOGIN FLOW WORKING PERFECTLY!');
      console.log('✅ User is logged in and authenticated');
      console.log('✅ User enrichment works');
      console.log('✅ Buyers query works');
      console.log('✅ No auth conflicts detected');
    } else if (!session) {
      console.log('ℹ️ User not logged in - this is normal if you haven\'t signed in yet');
      console.log('💡 Try signing in and running this test again');
    } else if (userError?.message?.includes('406')) {
      console.log('🚨 LOGIN ISSUE: 406 error on user enrichment');
      console.log('💡 This will prevent proper login - check RLS policies');
    } else {
      console.log('⚠️ Some issues remain - check error details above');
    }
    
    console.log('');
    console.log('Next steps:');
    console.log('1. Clear browser storage: localStorage.clear()');
    console.log('2. Refresh the page');
    console.log('3. Sign in');
    console.log('4. Run this test again to verify login works');
    
  } catch (error) {
    console.error('💥 Error in testing:', error);
  }
};

// Run the test
testLoginFlow();
