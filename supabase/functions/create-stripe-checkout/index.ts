import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StripeCheckoutRequest {
  currentPlan: string;
  selectedPlan: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  console.log('Function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Supabase client');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the Authorization header
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

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user) {
      console.error('No user found');
      return new Response(
        JSON.stringify({ error: 'No user found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { currentPlan, selectedPlan, successUrl, cancelUrl }: StripeCheckoutRequest = await req.json();

    console.log('Checkout request:', { currentPlan, selectedPlan, successUrl, cancelUrl });

    // Don't allow Group plan upgrades through checkout (contact sales only)
    if (currentPlan === 'group') {
      return new Response(
        JSON.stringify({ error: 'Group plan requires contacting sales' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || ''
    console.log('Stripe secret key available:', !!stripeSecretKey);
    if (!stripeSecretKey) {
      console.error('Stripe secret key not found');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured', code: 'STRIPE_CONFIG_MISSING' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get or create Stripe customer
    console.log('Looking up user data for user ID:', user.id);
    const { data: userData, error: userError } = await supabase
      .from('buybidhq_users')
      .select('account_id')
      .eq('id', user.id)
      .single();

    console.log('User data lookup result:', { userData, userError });

    if (userError) {
      console.error('User lookup error:', userError);
      return new Response(
        JSON.stringify({ error: 'User lookup failed', details: userError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If user doesn't have an account, create one
    let accountId = userData?.account_id;
    let account: any;

    if (!accountId) {
      console.log('No account found for user, creating new account');

      // Get user's full name for account naming
      const { data: fullUserData } = await supabase
        .from('buybidhq_users')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      const accountName = fullUserData?.full_name
        ? `${fullUserData.full_name}'s Account`
        : `${fullUserData?.email || user.email}'s Account`;

      // Create new account
      const { data: newAccount, error: createAccountError } = await supabase
        .from('accounts')
        .insert({
          name: accountName,
          plan: 'free',
          billing_status: 'active'
        })
        .select()
        .single();

      if (createAccountError) {
        console.error('Account creation error:', createAccountError);
        return new Response(
          JSON.stringify({ error: 'Failed to create account', details: createAccountError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      accountId = newAccount.id;
      account = newAccount;

      // Update user with new account_id
      const { error: updateUserError } = await supabase
        .from('buybidhq_users')
        .update({ account_id: accountId })
        .eq('id', user.id);

      if (updateUserError) {
        console.error('User account_id update error:', updateUserError);
        // Continue anyway - account is created
      }

      console.log('New account created:', accountId);
    } else {
      // Account exists, fetch it
      const { data: existingAccount, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      console.log('Account lookup result:', { existingAccount, accountError });

      if (accountError) {
        console.error('Account lookup error:', accountError);
        return new Response(
          JSON.stringify({ error: 'Account lookup failed', details: accountError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      account = existingAccount;
    }

    let customerId = account.stripe_customer_id;
    console.log('Current customer ID:', customerId);

    // Create customer if doesn't exist
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            account_id: account.id,
          },
        });
        customerId = customer.id;
        console.log('Stripe customer created:', customerId);

        // Update account with customer ID
        console.log('Updating account with customer ID...');
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ stripe_customer_id: customerId })
          .eq('id', account.id);
        
        if (updateError) {
          console.error('Error updating account with customer ID:', updateError);
        } else {
          console.log('Account updated with customer ID');
        }
      } catch (stripeError) {
        console.error('Stripe customer creation error:', stripeError);
        return new Response(
          JSON.stringify({ error: 'Failed to create Stripe customer', details: stripeError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('Using existing customer ID:', customerId);
    }

    // Determine which price ID to use based on selected plan
    let priceId: string | undefined;
    let planName: string;

    if (selectedPlan === 'annual') {
      priceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID') || process.env.STRIPE_ANNUAL_PRICE_ID;
      planName = 'annual';
    } else {
      priceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID') || process.env.STRIPE_CONNECT_PRICE_ID;
      planName = 'connect';
    }

    console.log(`Price ID for ${planName}:`, priceId ? 'Available' : 'Missing');

    if (!priceId) {
      console.error(`Price ID not configured for ${planName} plan`);
      return new Response(
        JSON.stringify({ error: `Price ID not configured for ${planName} plan` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating checkout session for plan: ${planName}, price ID: ${priceId}`);

    // Create checkout session with the selected plan
    try {
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
            user_id: user.id,
          },
        },
      });

      console.log('Stripe checkout session created:', session.id);
      console.log('Checkout URL:', session.url);

      return new Response(
        JSON.stringify({ url: session.url, sessionId: session.id }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (stripeError) {
      console.error('Stripe checkout session creation error:', stripeError);
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session', details: stripeError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Stripe checkout error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        code: 'INTERNAL_ERROR',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});