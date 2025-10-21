import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== STRIPE KEY TYPE CHECK ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY;
    const connectPriceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID') || process.env.STRIPE_CONNECT_PRICE_ID;
    const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID') || process.env.STRIPE_ANNUAL_PRICE_ID;

    console.log('Stripe Secret Key:', stripeSecretKey ? stripeSecretKey.substring(0, 7) + '...' : 'Missing');
    console.log('Connect Price ID:', connectPriceId);
    console.log('Annual Price ID:', annualPriceId);

    // Determine key type
    let keyType = 'Unknown';
    if (stripeSecretKey) {
      if (stripeSecretKey.startsWith('sk_test_')) {
        keyType = 'TEST';
      } else if (stripeSecretKey.startsWith('sk_live_')) {
        keyType = 'LIVE';
      } else if (stripeSecretKey.startsWith('sk_')) {
        keyType = 'OTHER';
      }
    }

    // Determine price ID types
    let connectPriceType = 'Unknown';
    let annualPriceType = 'Unknown';
    
    if (connectPriceId) {
      if (connectPriceId.startsWith('price_test_')) {
        connectPriceType = 'TEST';
      } else if (connectPriceId.startsWith('price_')) {
        connectPriceType = 'LIVE';
      }
    }
    
    if (annualPriceId) {
      if (annualPriceId.startsWith('price_test_')) {
        annualPriceType = 'TEST';
      } else if (annualPriceId.startsWith('price_')) {
        annualPriceType = 'LIVE';
      }
    }

    console.log('Key Type:', keyType);
    console.log('Connect Price Type:', connectPriceType);
    console.log('Annual Price Type:', annualPriceType);

    // Test Stripe API call to verify key works
    let stripeTestResult = 'Not tested';
    try {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
      
      // Try to list products to test the key
      const products = await stripe.products.list({ limit: 1 });
      stripeTestResult = 'SUCCESS - Key is valid';
      console.log('Stripe API test: SUCCESS');
    } catch (stripeError) {
      stripeTestResult = `ERROR - ${stripeError.message}`;
      console.log('Stripe API test: ERROR', stripeError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        stripeKey: {
          type: keyType,
          prefix: stripeSecretKey ? stripeSecretKey.substring(0, 7) + '...' : 'Missing',
          testResult: stripeTestResult
        },
        priceIds: {
          connect: {
            id: connectPriceId,
            type: connectPriceType
          },
          annual: {
            id: annualPriceId,
            type: annualPriceType
          }
        },
        message: 'Stripe configuration analysis completed'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Stripe key check error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Stripe key check error', 
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
