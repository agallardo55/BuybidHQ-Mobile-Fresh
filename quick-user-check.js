// Quick script to check what useCurrentUser is returning
// Run this in the browser console

console.log('=== QUICK USER CHECK ===');

// Try to access the current user data from the React app
const checkCurrentUser = () => {
  // Check if we can access the React context
  const reactRoot = document.querySelector('#root');
  
  // Try to find any user data in the DOM
  const userElements = document.querySelectorAll('[data-user], [data-current-user], [data-user-id]');
  console.log('User elements found:', userElements.length);
  
  // Check localStorage for user data
  console.log('Local Storage User Data:');
  Object.keys(localStorage).forEach(key => {
    if (key.includes('user') || key.includes('auth') || key.includes('supabase')) {
      try {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, JSON.parse(value));
      } catch (e) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    }
  });
  
  // Check sessionStorage
  console.log('Session Storage User Data:');
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('user') || key.includes('auth') || key.includes('supabase')) {
      try {
        const value = sessionStorage.getItem(key);
        console.log(`${key}:`, JSON.parse(value));
      } catch (e) {
        console.log(`${key}:`, sessionStorage.getItem(key));
      }
    }
  });
  
  // Try to access the Supabase session directly
  import('@supabase/supabase-js').then(({ createClient }) => {
    const SUPABASE_URL = "https://fdcfdbjputcitgxosnyk.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY2ZkYmpwdXRjaXRneG9zbnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4OTc2NjksImV4cCI6MjAzNDQ3MzY2OX0.x2lu4j7aZPc1zvMYS_ElsqVyzQg7WgerAD4LRPzFRZE";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Current Supabase Session:', session);
      console.log('Session Error:', error);
      
      if (session?.user) {
        console.log('User ID:', session.user.id);
        console.log('User Email:', session.user.email);
        console.log('User Metadata:', session.user.user_metadata);
        console.log('App Metadata:', session.user.app_metadata);
      }
    });
  });
};

checkCurrentUser();
