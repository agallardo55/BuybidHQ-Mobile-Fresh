import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Delete user function invoked');

    // Get the JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create client with user's JWT to check permissions
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Create admin client with service role for deletion operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get current user data using the user's JWT context
    const { data: currentUserData, error: userDataError } = await supabaseUser.rpc('get_current_user_data');
    
    if (userDataError || !currentUserData || currentUserData.length === 0) {
      console.error('Error getting current user data:', userDataError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate user permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // get_current_user_data returns a table (array), get first row
    const userData = currentUserData[0];

    console.log('Current user data:', { 
      userId: userData.user_id, 
      isAdmin: userData.is_admin 
    });

    // Validate superadmin status
    if (!userData.is_admin) {
      console.error('User is not a superadmin');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only superadmins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { userId, reason } = await req.json();
    
    if (!userId) {
      console.error('No userId provided');
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deleting user:', { userId, reason, deletedBy: userData.user_id });

    // Step 1: Call existing database function for soft delete
    // This handles: buybidhq_users soft delete, deleted_users insert, account_administrators update
    const { error: dbError } = await supabaseAdmin.rpc('handle_user_deletion', {
      user_id: userId,
      deleted_by_id: userData.user_id,
      deletion_reason: reason || null
    });

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return new Response(
        JSON.stringify({ error: `Database deletion failed: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Database soft delete completed successfully');

    // Step 2: Delete from auth.users (hard delete)
    // Check if auth user exists first
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authUser?.user) {
      // Auth user exists, delete it
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Auth deletion error:', authError);
        return new Response(
          JSON.stringify({ 
            warning: `User soft-deleted from database, but auth deletion failed: ${authError.message}`,
            partial_success: true
          }),
          { status: 207, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Auth user deleted successfully');
    } else {
      console.log('No auth user found - skipping auth deletion (this is normal for incomplete signups)');
    }

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User deleted successfully from both database and auth',
        userId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in delete-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
