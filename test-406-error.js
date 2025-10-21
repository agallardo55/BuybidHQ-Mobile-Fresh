// Test script to check 406 error on buybidhq_users
// Run this in browser console while logged in

console.log('=== TESTING 406 ERROR ON BUYBIDHQ_USERS ===');

const testBuybidhqUsersQuery = async () => {
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
    
    // Test 2: Test buybidhq_users query (this should NOT return 406)
    console.log('🔍 Test 2: Testing buybidhq_users query...');
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('id, email, role, app_role, account_id')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('❌ buybidhq_users query failed:', userError);
      console.log('Error details:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      
      if (userError.message?.includes('406') || userError.message?.includes('Not Acceptable')) {
        console.log('🚨 406 ERROR STILL EXISTS - This is the root cause of AbortError!');
        console.log('💡 Need to check RLS policies or table permissions');
      }
    } else {
      console.log('✅ buybidhq_users query successful:', userData);
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
    
    console.log('=== SUMMARY ===');
    console.log('✅ Session valid:', !!session);
    console.log('✅ buybidhq_users query:', !userError);
    console.log('✅ Buyers query:', !buyersError);
    
    if (userError?.message?.includes('406')) {
      console.log('🚨 ROOT CAUSE IDENTIFIED: 406 error on buybidhq_users');
      console.log('💡 Fix this first, then AbortError will stop happening');
    } else if (!userError && !buyersError) {
      console.log('🎉 ALL QUERIES WORKING - AbortError should be resolved!');
    }
    
  } catch (error) {
    console.error('💥 Error in testing:', error);
  }
};

// Run the test
testBuybidhqUsersQuery();
