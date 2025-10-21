import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== STRIPE CHECKOUT TEST START ===');
  console.log('Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY;
    console.log('Stripe secret key available:', !!stripeSecretKey);
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    console.log('Stripe client initialized');

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Supabase client created');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }
    console.log('User authenticated:', user.id);

    // Get user account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }
    console.log('Account found:', account.id);

    // Get or create Stripe customer
    let customerId = account.stripe_customer_id;
    console.log('Current customer ID:', customerId);

    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          account_id: account.id,
        },
      });
      customerId = customer.id;
      console.log('Stripe customer created:', customerId);

      // Update account with customer ID
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', account.id);

      if (updateError) {
        console.error('Error updating account with customer ID:', updateError);
      } else {
        console.log('Account updated with customer ID');
      }
    } else {
      console.log('Using existing customer ID:', customerId);
    }

    // Get price IDs
    const connectPriceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID') || process.env.STRIPE_CONNECT_PRICE_ID;
    const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID') || process.env.STRIPE_ANNUAL_PRICE_ID;
    
    console.log('Connect price ID available:', !!connectPriceId);
    console.log('Annual price ID available:', !!annualPriceId);

    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);
    
    const { selectedPlan } = body;
    console.log('Selected plan:', selectedPlan);

    // Determine price ID
    let priceId: string;
    if (selectedPlan === 'annual') {
      priceId = annualPriceId;
    } else {
      priceId = connectPriceId;
    }

    if (!priceId) {
      throw new Error(`Price ID not configured for ${selectedPlan} plan`);
    }

    console.log(`Creating checkout session for plan: ${selectedPlan}, price ID: ${priceId}`);

    // Create checkout session
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
      success_url: `${body.successUrl || 'https://example.com/success'}`,
      cancel_url: `${body.cancelUrl || 'https://example.com/cancel'}`,
      metadata: {
        account_id: account.id,
        requested_plan: selectedPlan,
      },
      subscription_data: {
        metadata: {
          account_id: account.id,
          requested_plan: selectedPlan,
        },
      },
    });

    console.log('Stripe checkout session created:', session.id);
    console.log('Checkout URL:', session.url);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: session.url, 
        sessionId: session.id,
        message: 'Checkout session created successfully!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== STRIPE CHECKOUT TEST ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Stripe checkout test error', 
        message: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
