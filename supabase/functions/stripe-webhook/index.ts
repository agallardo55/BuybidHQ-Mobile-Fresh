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

        // Also update the user status to active when payment is confirmed
        const { error: userUpdateError } = await supabaseAdmin
          .from('buybidhq_users')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .eq('status', 'pending_payment'); // Only update pending_payment users

        if (userUpdateError) {
          console.error('Error updating user status:', userUpdateError);
          return new Response(
            JSON.stringify({ error: 'User status update failed', details: userUpdateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`✅ Successfully activated subscription and updated user status for user ${userId}`);
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

        // Get user's account_id
        const { data: userData } = await supabaseAdmin
          .from('buybidhq_users')
          .select('account_id')
          .eq('id', userId)
          .single();

        if (!userData?.account_id) {
          console.warn('No account found for user:', userId);
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

        // Determine plan type from subscription items
        let accountPlan: string = 'free';
        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id;
          const connectPriceId = Deno.env.get('STRIPE_CONNECT_PRICE_ID');
          const annualPriceId = Deno.env.get('STRIPE_ANNUAL_PRICE_ID');
          
          if (priceId === annualPriceId) {
            accountPlan = 'annual';
          } else if (priceId === connectPriceId) {
            accountPlan = 'connect';
          } else {
            // If subscription is canceled or no matching price, set to free
            accountPlan = subscription.status === 'canceled' ? 'free' : accountPlan;
          }
        } else if (subscription.status === 'canceled') {
          accountPlan = 'free';
        }

        console.log(`Updating subscription for user ${userId} to status ${dbStatus}, plan: ${accountPlan}`);

        // Update subscriptions table
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

        // Update accounts table with plan and billing status
        const { error: accountUpdateError } = await supabaseAdmin
          .from('accounts')
          .update({
            plan: accountPlan,
            billing_status: dbStatus,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.account_id);

        if (accountUpdateError) {
          console.error('Error updating account:', accountUpdateError);
          // Don't fail the webhook, but log the error
        } else {
          console.log(`✅ Updated account ${userData.account_id} to plan ${accountPlan}, status ${dbStatus}`);
        }

        // Sync user status with subscription status for paid plans
        if (dbStatus === 'active' || dbStatus === 'past_due' || dbStatus === 'canceled') {
          const userStatus = dbStatus === 'active' ? 'active' : 
                           dbStatus === 'past_due' ? 'pending_payment' : 
                           'inactive';
          
          const { error: userUpdateError } = await supabaseAdmin
            .from('buybidhq_users')
            .update({
              status: userStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (userUpdateError) {
            console.error('Error updating user status:', userUpdateError);
            // Don't fail the webhook for user status update errors, just log them
          } else {
            console.log(`✅ Updated user ${userId} status to ${userStatus}`);
          }
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

        // Get user's account_id
        const { data: userData } = await supabaseAdmin
          .from('buybidhq_users')
          .select('account_id')
          .eq('id', userId)
          .single();

        console.log(`Canceling subscription for user ${userId}`);

        // Update subscriptions table
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

        // Update accounts table to free plan
        if (userData?.account_id) {
          const { error: accountUpdateError } = await supabaseAdmin
            .from('accounts')
            .update({
              plan: 'free',
              billing_status: 'canceled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userData.account_id);

          if (accountUpdateError) {
            console.error('Error updating account:', accountUpdateError);
          } else {
            console.log(`✅ Updated account ${userData.account_id} to free plan`);
          }
        }

        // Update user status to inactive when subscription is canceled
        const { error: userUpdateError } = await supabaseAdmin
          .from('buybidhq_users')
          .update({
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (userUpdateError) {
          console.error('Error updating user status:', userUpdateError);
          // Don't fail the webhook for user status update errors, just log them
        } else {
          console.log(`✅ Updated user ${userId} status to inactive`);
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
