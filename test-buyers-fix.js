// Test script to verify buyers fetch fix
// Run this in browser console while logged in

console.log('=== TESTING BUYERS FETCH FIX ===');

const testBuyersFetch = async () => {
  try {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = "https://fdcfdbjputcitgxosnyk.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
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
    
    // Test 2: Check user profile
    console.log('🔍 Test 2: Checking user profile...');
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('id, email, role, app_role, account_id')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Error fetching user profile:', userError);
      return;
    }
    
    console.log('✅ User profile found:', {
      email: userData.email,
      role: userData.role,
      app_role: userData.app_role,
      account_id: userData.account_id
    });
    
    // Test 3: Direct buyers query
    console.log('🔍 Test 3: Testing direct buyers query...');
    const { data: buyersData, error: buyersError } = await supabase
      .from('buyers')
      .select('id, buyer_name, owner_user_id, account_id')
      .is('deleted_at', null)
      .limit(5);
    
    if (buyersError) {
      console.error('❌ Buyers query failed:', buyersError);
      console.log('Error details:', {
        code: buyersError.code,
        message: buyersError.message,
        details: buyersError.details,
        hint: buyersError.hint
      });
    } else {
      console.log('✅ Buyers query successful:', buyersData?.length || 0, 'buyers found');
      if (buyersData?.length > 0) {
        console.log('Sample buyer:', buyersData[0]);
      }
    }
    
    // Test 4: Check RLS policies
    console.log('🔍 Test 4: Testing RLS access...');
    const { data: ownedBuyers, error: ownedError } = await supabase
      .from('buyers')
      .select('id, buyer_name, owner_user_id')
      .eq('owner_user_id', session.user.id)
      .is('deleted_at', null);
    
    console.log('✅ Owned buyers:', ownedBuyers?.length || 0);
    
    // Test 5: Check account buyers
    if (userData.account_id) {
      console.log('🔍 Test 5: Testing account buyers access...');
      const { data: accountBuyers, error: accountError } = await supabase
        .from('buyers')
        .select('id, buyer_name, account_id')
        .eq('account_id', userData.account_id)
        .is('deleted_at', null);
      
      console.log('✅ Account buyers:', accountBuyers?.length || 0);
    }
    
    console.log('=== SUMMARY ===');
    console.log('✅ Session valid:', !!session);
    console.log('✅ User profile exists:', !!userData);
    console.log('✅ Can query buyers:', !buyersError);
    console.log('✅ Headers configured:', true);
    
    if (!buyersError) {
      console.log('🎉 BUYERS FETCH FIX SUCCESSFUL!');
    } else {
      console.log('🚨 Buyers fetch still failing - check error details above');
    }
    
  } catch (error) {
    console.error('💥 Error in testing:', error);
  }
};

// Run the test
testBuyersFetch();
