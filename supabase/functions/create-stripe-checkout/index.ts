import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StripeCheckoutRequest {
  currentPlan: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { currentPlan, successUrl, cancelUrl }: StripeCheckoutRequest = await req.json();

    // Don't allow Group plan upgrades through checkout (contact sales only)
    if (currentPlan === 'group') {
      return new Response(
        JSON.stringify({ error: 'Group plan requires contacting sales' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get or create Stripe customer
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('account_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData.account_id) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', userData.account_id)
      .single();

    if (accountError) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let customerId = account.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          account_id: account.id,
        },
      });
      customerId = customer.id;

      // Update account with customer ID
      await supabase
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', account.id);
    }

    // Determine which price ID to use based on target plan
    let priceId: string | undefined;
    let planName: string;

    if (currentPlan === 'annual') {
      priceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID');
      planName = 'annual';
    } else {
      priceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID');
      planName = 'connect';
    }

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `Price ID not configured for ${planName} plan` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating checkout session for plan: ${planName}, price ID: ${priceId}`);

    // Create checkout session with the selected plan
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
        account_id: account.id,
        requested_plan: planName,
      },
      subscription_data: {
        metadata: {
          account_id: account.id,
          requested_plan: planName,
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});