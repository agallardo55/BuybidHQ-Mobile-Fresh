import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== SIMPLE TEST FUNCTION START ===');
  console.log('Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Supabase client created');

    console.log('Getting auth header...');
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('No auth header, returning 401');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting token...');
    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token.length);

    console.log('Getting user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('User result:', { userId: user?.id, authError: authError?.message });

    if (authError) {
      console.log('Auth error, returning 401');
      return new Response(
        JSON.stringify({ error: 'Auth failed', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.log('No user, returning 401');
      return new Response(
        JSON.stringify({ error: 'No user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing request body...');
    const body = await req.json();
    console.log('Request body:', body);

    console.log('=== SIMPLE TEST FUNCTION SUCCESS ===');
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: user.id,
        body: body
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SIMPLE TEST FUNCTION ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Test function error', 
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
