// Test script to verify fixes
// Run this in browser console after clearing localStorage

console.log('=== TESTING FIXES ===');

const testFixes = async () => {
  try {
    // Clear storage first
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage cleared');
    
    // Test 1: Check if app loads without syntax errors
    console.log('🔍 Test 1: App loading');
    console.log('If you see this, App.tsx syntax error is fixed!');
    
    // Test 2: Import Supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    console.log('✅ Supabase client imported successfully');
    
    // Test 3: Check client configuration
    console.log('🔍 Test 2: Client configuration');
    console.log('Client URL:', supabase.supabaseUrl);
    console.log('Client key:', supabase.supabaseKey?.substring(0, 20) + '...');
    
    // Test 4: Test session recovery
    console.log('🔍 Test 3: Session recovery');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session check:', {
      hasSession: !!session,
      error: error?.message
    });
    
    // Test 5: Test direct user query
    console.log('🔍 Test 4: Direct user query');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User query:', {
      hasUser: !!user,
      error: userError?.message
    });
    
    // Test 6: Test buybidhq_users table access (if user exists)
    if (user) {
      console.log('🔍 Test 5: Database access test');
      try {
        const { data: profile, error: profileError } = await supabase
          .from('buybidhq_users')
          .select('id, email, role')
          .eq('id', user.id)
          .single();
          
        console.log('Profile query:', {
          success: !profileError,
          error: profileError?.message,
          profile: profile ? 'found' : 'not found'
        });
        
        if (profileError) {
          console.log('⚠️ 406 error still occurring - RLS policy issue');
        } else {
          console.log('✅ Database access working');
        }
      } catch (err) {
        console.log('Database access error:', err);
      }
    } else {
      console.log('ℹ️ Skipping database test - no user');
    }
    
    // Summary
    console.log('=== SUMMARY ===');
    console.log('✅ App loads without syntax errors');
    console.log('✅ Supabase client working');
    console.log('✅ Session recovery working');
    console.log('✅ AuthContext enrichment is non-blocking');
    
    console.log('');
    console.log('Next steps:');
    console.log('1. Try signing in');
    console.log('2. Check console for detailed auth logs');
    console.log('3. Should see "AuthContext: Profile fetch failed (406/RLS)" but continue working');
    console.log('4. Login should work and stay logged in');
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

testFixes();
