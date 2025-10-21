// Quick Session Check Script
// Paste this in browser console immediately after login attempt

console.log('=== QUICK SESSION CHECK ===');

const checkSession = async () => {
  try {
    // Import Supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Check if session exists
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error
    })

    // Check localStorage
    const keys = Object.keys(localStorage).filter(k => k.includes('supabase'))
    console.log('Supabase storage keys:', keys)

    keys.forEach(key => {
      console.log(key, ':', localStorage.getItem(key)?.substring(0, 100))
    })
    
    // Additional checks
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Direct user check:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: userError
    })
    
  } catch (err) {
    console.error('Session check error:', err)
  }
};

checkSession();
