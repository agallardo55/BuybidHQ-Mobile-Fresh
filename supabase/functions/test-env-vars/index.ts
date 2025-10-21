import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== ENVIRONMENT VARIABLES TEST ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY;
    const connectPriceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID') || process.env.STRIPE_CONNECT_PRICE_ID;
    const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID') || process.env.STRIPE_ANNUAL_PRICE_ID;
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || process.env.SUPABASE_URL;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Environment variables check:');
    console.log('- STRIPE_SECRET_KEY:', stripeSecretKey ? 'Available' : 'Missing');
    console.log('- STRIPE_CONNECT_PRICE_ID:', connectPriceId ? 'Available' : 'Missing');
    console.log('- STRIPE_ANNUAL_PRICE_ID:', annualPriceId ? 'Available' : 'Missing');
    console.log('- SUPABASE_URL:', supabaseUrl ? 'Available' : 'Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Available' : 'Missing');

    return new Response(
      JSON.stringify({
        success: true,
        environment: {
          stripeSecretKey: stripeSecretKey ? 'Available' : 'Missing',
          connectPriceId: connectPriceId ? 'Available' : 'Missing',
          annualPriceId: annualPriceId ? 'Available' : 'Missing',
          supabaseUrl: supabaseUrl ? 'Available' : 'Missing',
          supabaseServiceKey: supabaseServiceKey ? 'Available' : 'Missing',
        },
        message: 'Environment variables check completed'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Environment variables test error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Environment variables test error', 
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
