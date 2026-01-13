
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StripeCheckoutRequest {
  currentPlan: 'beta-access' | 'connect' | 'annual' | 'dealership';
  successUrl?: string;
  cancelUrl?: string;
}

const PRICE_IDS = {
  'connect': Deno.env.get('STRIPE_CONNECT_PRICE_ID'),
  'annual': Deno.env.get('STRIPE_ANNUAL_PRICE_ID'),
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from Supabase auth
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { currentPlan, successUrl, cancelUrl } = await req.json() as StripeCheckoutRequest

    // If dealership plan is requested, return error suggesting contact
    if (currentPlan === 'dealership') {
      return new Response(
        JSON.stringify({ error: 'Please contact sales for dealership plan', contact: true }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured', code: 'STRIPE_CONFIG_MISSING' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Get or create Stripe customer
    const { data: subscriptions } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = subscriptions?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Create Stripe checkout session with enhanced configuration
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_collection: 'always',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: [
        {
          price: PRICE_IDS[currentPlan as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14, // Optional: Add a trial period
      },
      allow_promotion_codes: true,
      success_url: successUrl ?? `${req.headers.get('origin')}/account?success=true`,
      cancel_url: cancelUrl ?? `${req.headers.get('origin')}/account?canceled=true`,
      metadata: {
        userId: user.id,
        planType: currentPlan,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
