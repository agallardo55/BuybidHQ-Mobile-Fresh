// Script to check current user's role assignments
// Run this in the browser console to get the current user's information

console.log('=== USER ROLE DEBUGGING ===');

// Get current user from useCurrentUser hook
const checkUserRoles = async () => {
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
    
    console.log('Current User ID:', userId);
    console.log('Current User Email:', userEmail);
    
    // Check buybidhq_users table
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('id, email, role, app_role, account_id, dealership_id')
      .eq('id', userId)
      .single();
    
    console.log('User Data from buybidhq_users:', userData);
    if (userError) console.error('Error fetching user data:', userError);
    
    // Check user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', userId);
    
    console.log('User Roles from user_roles table:', userRoles);
    if (rolesError) console.error('Error fetching user roles:', rolesError);
    
    // Check superadmin table
    const { data: superAdminData, error: superAdminError } = await supabase
      .from('superadmin')
      .select('user_id, email, status')
      .eq('email', userEmail);
    
    console.log('Super Admin Data:', superAdminData);
    if (superAdminError) console.error('Error fetching super admin data:', superAdminError);
    
    // Check account_administrators table
    const { data: accountAdminData, error: accountAdminError } = await supabase
      .from('account_administrators')
      .select('user_id, account_id, status')
      .eq('user_id', userId);
    
    console.log('Account Admin Data:', accountAdminData);
    if (accountAdminError) console.error('Error fetching account admin data:', accountAdminError);
    
    // Check account information
    if (userData?.account_id) {
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id, name, plan, seat_limit, billing_status')
        .eq('id', userData.account_id)
        .single();
      
      console.log('Account Data:', accountData);
      if (accountError) console.error('Error fetching account data:', accountError);
    }
    
    // Test is_superadmin function
    const { data: isSuperAdmin, error: superAdminTestError } = await supabase
      .rpc('is_superadmin', { user_email: userEmail });
    
    console.log('Is Super Admin (RPC result):', isSuperAdmin);
    if (superAdminTestError) console.error('Error testing super admin function:', superAdminTestError);
    
    console.log('=== END USER ROLE DEBUGGING ===');
    
  } catch (error) {
    console.error('Error in role checking script:', error);
  }
};

// Run the check
checkUserRoles();
