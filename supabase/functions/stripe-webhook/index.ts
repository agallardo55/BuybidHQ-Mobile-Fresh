
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Get the webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No signature in request')
    }

    // Get the raw body
    const body = await req.text()

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing subscription ${event.type} for subscription ${subscription.id}`);
        
        // Get customer to find the account
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const accountId = customer.metadata?.account_id;
        
        if (!accountId) {
          console.error('No account ID found in customer metadata');
          return new Response('No account ID found', { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        // Map Stripe price to plan type
        const priceId = subscription.items.data[0]?.price?.lookup_key || subscription.items.data[0]?.price?.id;
        let planType = 'free'; // default

        if (priceId === Deno.env.get('STRIPE_CONNECT_PRICE_ID')) {
          planType = 'connect';
        } else if (priceId === Deno.env.get('STRIPE_GROUP_PRICE_ID')) {
          planType = 'group';
        }

        const isActive = ['active', 'trialing'].includes(subscription.status);

        // Update account
        const { error: updateError } = await supabaseAdmin
          .from('accounts')
          .update({
            plan: isActive ? planType : 'free',
            stripe_subscription_id: subscription.id,
            billing_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', accountId);

        if (updateError) {
          console.error('Error updating account:', updateError);
          return new Response('Database error', { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        // Enable Group feature flag if it's a group plan
        if (planType === 'group' && isActive) {
          await supabaseAdmin
            .from('accounts')
            .update({ feature_group_enabled: true })
            .eq('id', accountId);
        }

        console.log(`Successfully updated account ${accountId} to plan ${planType}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing subscription deletion for subscription ${subscription.id}`);
        
        // Get customer to find the account
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const accountId = customer.metadata?.account_id;
        
        if (!accountId) {
          console.error('No account ID found in customer metadata');
          return new Response('No account ID found', { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        // Downgrade account to free plan
        const { error: updateError } = await supabaseAdmin
          .from('accounts')
          .update({
            plan: 'free',
            billing_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', accountId);

        if (updateError) {
          console.error('Error updating account:', updateError);
          return new Response('Database error', { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        console.log(`Successfully downgraded account ${accountId} to free plan`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
