import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== STRIPE TEST FUNCTION START ===');
  console.log('Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing Stripe import...');
    
    // Test Stripe initialization
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY;
    console.log('Stripe secret key available:', !!stripeSecretKey);
    
    if (!stripeSecretKey) {
      console.error('No Stripe secret key found');
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Initializing Stripe client...');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    console.log('Stripe client initialized successfully');
    
    // Test Supabase client
    console.log('Testing Supabase client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Supabase client created successfully');
    
    // Test auth
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('User auth result:', { userId: user?.id, authError });
    
    if (authError || !user) {
      console.error('Auth error or no user:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('=== ALL TESTS PASSED ===');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stripe and Supabase integration test passed!',
        userId: user.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== STRIPE TEST FUNCTION ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Stripe test function error', 
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
