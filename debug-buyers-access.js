// Debug script to check buyers access issue
// Run this in the browser console while logged in

console.log('=== DEBUGGING BUYERS ACCESS ISSUE ===');

const debugBuyersAccess = async () => {
  try {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = "https://fdcfdbjputcitgxosnyk.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('❌ No active session found');
      return;
    }
    
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    console.log('🔍 Current User ID:', userId);
    console.log('🔍 Current User Email:', userEmail);
    
    // Check if user exists in buybidhq_users
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('📊 User Data from buybidhq_users:', userData);
    if (userError) {
      console.error('❌ Error fetching user data:', userError);
      console.log('🚨 This means the user does not exist in buybidhq_users table!');
      return;
    }
    
    // Check account information
    if (userData?.account_id) {
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', userData.account_id)
        .single();
      
      console.log('💳 Account Data:', accountData);
      if (accountError) {
        console.error('❌ Error fetching account data:', accountError);
      }
    } else {
      console.log('🚨 User has no account_id! This is likely the problem.');
    }
    
    // Test buyers query directly
    console.log('🧪 Testing buyers query...');
    const { data: buyersData, error: buyersError } = await supabase
      .from('buyers')
      .select('id, buyer_name, owner_user_id, account_id')
      .is('deleted_at', null)
      .limit(5);
    
    console.log('📋 Buyers Query Result:', buyersData);
    console.log('📋 Buyers Query Error:', buyersError);
    
    // Check if user has any buyers they own
    const { data: ownedBuyers, error: ownedError } = await supabase
      .from('buyers')
      .select('id, buyer_name, owner_user_id')
      .eq('owner_user_id', userId)
      .is('deleted_at', null);
    
    console.log('👤 Buyers owned by user:', ownedBuyers);
    console.log('👤 Owned buyers error:', ownedError);
    
    // Test RLS policy functions
    console.log('🔧 Testing RLS helper functions...');
    
    // Test current_user_in_account function
    if (userData?.account_id) {
      const { data: accountCheck, error: accountCheckError } = await supabase
        .rpc('current_user_in_account', { a_id: userData.account_id });
      
      console.log('🏢 current_user_in_account result:', accountCheck);
      console.log('🏢 current_user_in_account error:', accountCheckError);
    }
    
    // Test current_user_role function
    const { data: roleCheck, error: roleCheckError } = await supabase
      .rpc('current_user_role');
    
    console.log('👔 current_user_role result:', roleCheck);
    console.log('👔 current_user_role error:', roleCheckError);
    
    console.log('=== SUMMARY ===');
    console.log('✅ User exists in buybidhq_users:', !!userData);
    console.log('✅ User has account_id:', !!userData?.account_id);
    console.log('✅ User app_role:', userData?.app_role);
    console.log('✅ User role:', userData?.role);
    console.log('✅ Can query buyers table:', !buyersError);
    console.log('✅ Has owned buyers:', ownedBuyers?.length > 0);
    console.log('✅ Account exists:', !!accountData);
    
    // Identify the likely issue
    if (!userData?.account_id) {
      console.log('🚨 ISSUE IDENTIFIED: User has no account_id');
      console.log('💡 SOLUTION: User needs to be assigned to an account');
    } else if (userData?.app_role !== 'account_admin' && userData?.app_role !== 'super_admin') {
      console.log('🚨 ISSUE IDENTIFIED: User is not account_admin or super_admin');
      console.log('💡 SOLUTION: User needs account_admin role or RLS policies need to be updated');
    } else if (ownedBuyers?.length === 0) {
      console.log('🚨 ISSUE IDENTIFIED: User has no buyers they own');
      console.log('💡 SOLUTION: User needs to create buyers or RLS policies need to allow account-wide access');
    }
    
  } catch (error) {
    console.error('💥 Error in debugging:', error);
  }
};

// Run the debugging
debugBuyersAccess();
