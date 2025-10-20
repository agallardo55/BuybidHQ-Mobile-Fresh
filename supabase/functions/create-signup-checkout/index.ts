import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupCheckoutRequest {
  planType: 'connect' | 'annual';
  customerEmail: string;
  customerName: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  console.log('Signup checkout function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const { planType, customerEmail, customerName, userId, successUrl, cancelUrl }: SignupCheckoutRequest = await req.json();

    console.log('Signup checkout request:', { planType, customerEmail, customerName, userId });

    // Get price IDs from environment
    const connectPriceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID');
    const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID');

    if (!connectPriceId || !annualPriceId) {
      console.error('Stripe price IDs not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe price IDs not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select price ID based on plan type
    const priceId = planType === 'annual' ? annualPriceId : connectPriceId;
    console.log(`Using price ID for ${planType}:`, priceId);

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName,
      metadata: {
        signup_plan: planType,
        source: 'signup'
      }
    });

    console.log('Created Stripe customer:', customer.id);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan_type: planType,
        customer_email: customerEmail,
        user_id: userId, // Add user ID for webhook handler
        source: 'signup'
      },
      subscription_data: {
        metadata: {
          plan_type: planType,
          customer_email: customerEmail,
          user_id: userId, // Add user ID for webhook handler
          source: 'signup'
        },
      },
    });

    console.log('Created Stripe checkout session:', session.id);

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        customerId: customer.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Signup checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
