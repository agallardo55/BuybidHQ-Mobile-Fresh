// Script to fix user roles - run this in browser console after identifying the issues
// WARNING: This will modify the database. Make sure you have the correct user!

const fixUserRoles = async () => {
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
    
    console.log('Fixing roles for user:', userEmail, 'ID:', userId);
    
    // Step 1: Remove from superadmin table
    const { error: superAdminDeleteError } = await supabase
      .from('superadmin')
      .delete()
      .eq('email', userEmail);
    
    if (superAdminDeleteError) {
      console.error('Error removing from superadmin:', superAdminDeleteError);
    } else {
      console.log('✓ Removed from superadmin table');
    }
    
    // Step 2: Remove admin roles from user_roles table
    const { error: userRolesDeleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['super_admin', 'account_admin']);
    
    if (userRolesDeleteError) {
      console.error('Error removing admin roles:', userRolesDeleteError);
    } else {
      console.log('✓ Removed admin roles from user_roles table');
    }
    
    // Step 3: Update app_role to 'member' in buybidhq_users
    const { error: updateRoleError } = await supabase
      .from('buybidhq_users')
      .update({ app_role: 'member' })
      .eq('id', userId);
    
    if (updateRoleError) {
      console.error('Error updating app_role:', updateRoleError);
    } else {
      console.log('✓ Updated app_role to member in buybidhq_users');
    }
    
    // Step 4: Remove from account_administrators table
    const { error: accountAdminDeleteError } = await supabase
      .from('account_administrators')
      .delete()
      .eq('user_id', userId);
    
    if (accountAdminDeleteError) {
      console.error('Error removing from account_administrators:', accountAdminDeleteError);
    } else {
      console.log('✓ Removed from account_administrators table');
    }
    
    // Step 5: Ensure account is set to free plan
    const { data: userData } = await supabase
      .from('buybidhq_users')
      .select('account_id')
      .eq('id', userId)
      .single();
    
    if (userData?.account_id) {
      const { error: updateAccountError } = await supabase
        .from('accounts')
        .update({ plan: 'free', seat_limit: 1 })
        .eq('id', userData.account_id);
      
      if (updateAccountError) {
        console.error('Error updating account plan:', updateAccountError);
      } else {
        console.log('✓ Updated account to free plan');
      }
    }
    
    console.log('=== ROLE FIX COMPLETE ===');
    console.log('Please refresh the page to see the changes.');
    
  } catch (error) {
    console.error('Error in role fixing script:', error);
  }
};

// Uncomment the line below to run the fix
// fixUserRoles();
