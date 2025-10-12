
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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
        JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Get user's account to find Stripe customer ID
    const { data: userRecord, error: userRecordError } = await supabaseClient
      .from('buybidhq_users')
      .select('account_id')
      .eq('id', user.id)
      .single()

    if (userRecordError || !userRecord?.account_id) {
      return new Response(
        JSON.stringify({ error: 'Account not found', code: 'ACCOUNT_NOT_FOUND' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: account, error: accountError } = await supabaseClient
      .from('accounts')
      .select('id, stripe_customer_id')
      .eq('id', userRecord.account_id)
      .single()

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Account not found', code: 'ACCOUNT_NOT_FOUND' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    let customerId = account.stripe_customer_id as string | null

    // Create Stripe customer if missing, then persist to account
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          account_id: account.id,
        },
      })
      customerId = customer.id

      await supabaseClient
        .from('accounts')
        .update({ stripe_customer_id: customerId })
        .eq('id', account.id)
    }

    // Respect optional returnUrl in request body
    let returnUrl: string | undefined
    try {
      const body = await req.json()
      returnUrl = body?.returnUrl
    } catch {
      // no body provided
    }

    // Create Stripe customer portal session with correct customer ID
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url: returnUrl || `${req.headers.get('origin')}/account`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Stripe portal error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
