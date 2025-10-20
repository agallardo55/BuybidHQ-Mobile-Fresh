import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature in request');
    }

    const body = await req.text();
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      // MOST IMPORTANT: Handle checkout completion (when user completes payment)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type;
        
        if (!userId) {
          console.error('No user_id in session metadata');
          return new Response(
            JSON.stringify({ error: 'No user_id in metadata' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Activating subscription for user ${userId}, plan: ${planType}`);

        // Defensive check: Only update incomplete subscriptions
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('status', 'incomplete'); // Only update incomplete ones to prevent overwriting valid states

        if (updateError) {
          console.error('Error activating subscription:', updateError);
          return new Response(
            JSON.stringify({ error: 'Database error', details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`✅ Successfully activated subscription for user ${userId}`);
        break;
      }

      // Handle subscription updates (renewals, plan changes, payment failures)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        
        if (!userId) {
          console.warn('No user_id in subscription metadata, skipping update');
          break;
        }

        // Map Stripe subscription status to our database status
        const statusMap: Record<string, string> = {
          'active': 'active',
          'trialing': 'active',
          'past_due': 'past_due',
          'canceled': 'canceled',
          'unpaid': 'past_due',
          'incomplete': 'incomplete',
          'incomplete_expired': 'canceled'
        };

        const dbStatus = statusMap[subscription.status] || 'incomplete';

        console.log(`Updating subscription for user ${userId} to status ${dbStatus}`);

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: dbStatus,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return new Response(
            JSON.stringify({ error: 'Database error', details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`✅ Updated subscription for user ${userId} to status ${dbStatus}`);
        break;
      }

      // Handle subscription cancellation
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        
        if (!userId) {
          console.warn('No user_id in subscription metadata, skipping deletion');
          break;
        }

        console.log(`Canceling subscription for user ${userId}`);

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error canceling subscription:', updateError);
          return new Response(
            JSON.stringify({ error: 'Database error', details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`✅ Canceled subscription for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
