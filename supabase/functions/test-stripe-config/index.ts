import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check Stripe configuration
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || '';
    const connectPriceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID') || process.env.STRIPE_CONNECT_PRICE_ID || '';
    const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID') || process.env.STRIPE_ANNUAL_PRICE_ID || '';

    const config = {
      stripeSecretKey: stripeSecretKey ? 'Available' : 'Missing',
      connectPriceId: connectPriceId ? 'Available' : 'Missing',
      annualPriceId: annualPriceId ? 'Available' : 'Missing',
    };

    console.log('Stripe configuration check:', config);

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        config,
        message: 'Stripe configuration check completed'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Config check error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
