import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== SIMPLE STRIPE CHECKOUT TEST ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Step 1: Getting environment variables');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY;
    const connectPriceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID') || process.env.STRIPE_CONNECT_PRICE_ID;
    
    console.log('Step 2: Initializing Stripe');
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    
    console.log('Step 3: Creating test checkout session');
    
    // Create a simple test checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: connectPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    console.log('Step 4: Checkout session created successfully');
    console.log('Session ID:', session.id);
    console.log('Checkout URL:', session.url);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url,
        message: 'Simple checkout session created successfully!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SIMPLE STRIPE CHECKOUT ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Simple checkout test error', 
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
