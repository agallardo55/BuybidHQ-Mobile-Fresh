// Enhanced debugging script to check user roles
// Run this in the browser console to see exactly what's happening

console.log('=== COMPREHENSIVE USER ROLE DEBUGGING ===');

const debugUserRoles = async () => {
  try {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = "https://fdcfdbjputcitgxosnyk.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('No active session found');
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
      console.log('This might mean the user does not exist in buybidhq_users table');
    }
    
    // Check user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    console.log('👥 User Roles from user_roles table:', userRoles);
    if (rolesError) {
      console.error('❌ Error fetching user roles:', rolesError);
    }
    
    // Check superadmin table
    const { data: superAdminData, error: superAdminError } = await supabase
      .from('superadmin')
      .select('*')
      .eq('email', userEmail);
    
    console.log('🔐 Super Admin Data:', superAdminData);
    if (superAdminError) {
      console.error('❌ Error fetching super admin data:', superAdminError);
    }
    
    // Check account_administrators table
    const { data: accountAdminData, error: accountAdminError } = await supabase
      .from('account_administrators')
      .select('*')
      .eq('user_id', userId);
    
    console.log('🏢 Account Admin Data:', accountAdminData);
    if (accountAdminError) {
      console.error('❌ Error fetching account admin data:', accountAdminError);
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
    }
    
    // Test is_superadmin function
    const { data: isSuperAdmin, error: superAdminTestError } = await supabase
      .rpc('is_superadmin', { user_email: userEmail });
    
    console.log('🧪 Is Super Admin (RPC result):', isSuperAdmin);
    if (superAdminTestError) {
      console.error('❌ Error testing super admin function:', superAdminTestError);
    }
    
    // Check what the useCurrentUser hook is returning
    console.log('🔧 Checking useCurrentUser hook data...');
    
    // Try to access the React context directly
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalFiber) {
      console.log('📱 React root found, trying to access context...');
    }
    
    // Check localStorage for any cached data
    console.log('💾 Local Storage check:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase') || key.includes('auth') || key.includes('user')) {
        console.log(`  ${key}:`, localStorage.getItem(key));
      }
    }
    
    // Check sessionStorage
    console.log('🗄️ Session Storage check:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.includes('supabase') || key.includes('auth') || key.includes('user')) {
        console.log(`  ${key}:`, sessionStorage.getItem(key));
      }
    }
    
    console.log('=== END COMPREHENSIVE DEBUGGING ===');
    
    // Summary
    console.log('📋 SUMMARY:');
    console.log('  - User exists in buybidhq_users:', !!userData);
    console.log('  - User app_role:', userData?.app_role);
    console.log('  - User role:', userData?.role);
    console.log('  - Has user_roles entries:', userRoles?.length > 0);
    console.log('  - In superadmin table:', superAdminData?.length > 0);
    console.log('  - In account_administrators:', accountAdminData?.length > 0);
    console.log('  - Is super admin (RPC):', isSuperAdmin);
    
  } catch (error) {
    console.error('💥 Error in comprehensive debugging:', error);
  }
};

// Run the comprehensive check
debugUserRoles();
