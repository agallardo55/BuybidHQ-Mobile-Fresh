import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  console.log('Stripe webhook received:', req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Stripe secret and webhook secret
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');

    if (!stripeSecretKey || !webhookSecret) {
      console.error('Missing Stripe configuration');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No signature provided');
      return new Response(
        JSON.stringify({ error: 'No signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook event type:', event.type);
    console.log('Webhook event ID:', event.id);

    // IDEMPOTENCY CHECK: Prevent duplicate processing
    // Check if this event has already been processed
    const { data: existingEvent } = await supabase
      .from('stripe_webhook_events')
      .select('id, processing_result')
      .eq('event_id', event.id)
      .maybeSingle();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed with result: ${existingEvent.processing_result}`);
      return new Response(
        JSON.stringify({ received: true, status: 'already_processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log event as being processed
    const { error: logError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        payload: event as any,
        processing_result: 'processing'
      });

    if (logError) {
      console.error('Failed to log webhook event:', logError);
      // Continue anyway - idempotency is best effort
    }

    // Handle different event types
    let processingResult = 'success';
    let processingError: string | null = null;

    try {
      await processEvent(event, supabase);
    } catch (error) {
      processingResult = 'failed';
      processingError = error instanceof Error ? error.message : 'Unknown error';
      console.error('Event processing failed:', error);

      // Update event log with failure
      await supabase
        .from('stripe_webhook_events')
        .update({
          processing_result: 'failed',
          processing_error: processingError
        })
        .eq('event_id', event.id);

      // Still return 200 to prevent Stripe from retrying indefinitely
      return new Response(
        JSON.stringify({
          received: true,
          status: 'failed',
          error: processingError
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update event log with success
    await supabase
      .from('stripe_webhook_events')
      .update({
        processing_result: 'success'
      })
      .eq('event_id', event.id);

    return new Response(
      JSON.stringify({ received: true, status: 'success' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Process event with retry logic
async function processEvent(event: Stripe.Event, supabase: any) {
  const MAX_RETRIES = 3;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      await processEventOnce(event, supabase);
      return; // Success
    } catch (error) {
      retryCount++;
      console.error(`Event processing attempt ${retryCount} failed:`, error);

      if (retryCount >= MAX_RETRIES) {
        throw error; // Give up after max retries
      }

      // Exponential backoff: wait 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
    }
  }
}

// Process event once (extracted for retry logic)
async function processEventOnce(event: Stripe.Event, supabase: any) {
  switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        console.log('Customer:', session.customer);
        console.log('Subscription:', session.subscription);
        console.log('Metadata:', session.metadata);

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type as 'connect' | 'annual';

        if (!userId) {
          console.error('No user_id in session metadata');
          break;
        }

        // Update user status to active
        const { error: userError } = await supabase
          .from('buybidhq_users')
          .update({ status: 'active' })
          .eq('id', userId);

        if (userError) {
          console.error('Error updating user:', userError);
        } else {
          console.log('User status updated to active:', userId);
        }

        // Update subscription status to active
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq('user_id', userId);

        if (subError) {
          console.error('Error updating subscription:', subError);
        } else {
          console.log('Subscription updated to active:', userId);
        }

        // Update account with Stripe IDs and ensure correct plan
        const { data: user } = await supabase
          .from('buybidhq_users')
          .select('account_id')
          .eq('id', userId)
          .single();

        if (user?.account_id) {
          // Map plan type correctly - annual plan should be 'annual', not 'connect'
          const accountPlan = planType === 'annual' ? 'annual' : 'connect';

          const { error: accountError } = await supabase
            .from('accounts')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              billing_status: 'active',
              plan: accountPlan,
              billing_cycle: planType === 'annual' ? 'annual' : 'monthly',
            })
            .eq('id', user.account_id);

          if (accountError) {
            console.error('Error updating account:', accountError);
          } else {
            console.log('Account updated with Stripe IDs and plan:', { accountId: user.account_id, plan: accountPlan });
          }
        }

        // Create MFA bypass token for successful payment
        // This allows user to skip MFA verification after completing payment
        // Token expires after 10 minutes and can only be used once
        if (userId) {
          const { error: bypassError } = await supabase
            .from('mfa_bypass_tokens')
            .insert({
              user_id: userId,
              reason: 'payment_success',
              granted_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
            });

          if (bypassError) {
            console.error('Failed to create MFA bypass token:', bypassError);
          } else {
            console.log('MFA bypass token created for user:', userId);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);

        const subscriptionId = invoice.subscription as string;

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('Error updating subscription:', error);
        }

        const { error: accountError } = await supabase
          .from('accounts')
          .update({ billing_status: 'active' })
          .eq('stripe_subscription_id', subscriptionId);

        if (accountError) {
          console.error('Error updating account:', accountError);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);

        const subscriptionId = invoice.subscription as string;

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('Error updating subscription:', error);
        }

        const { error: accountError } = await supabase
          .from('accounts')
          .update({ billing_status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId);

        if (accountError) {
          console.error('Error updating account:', accountError);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);

        const mapStripeStatus = (stripeStatus: string): string => {
          switch (stripeStatus) {
            case 'active': return 'active';
            case 'past_due': return 'past_due';
            case 'canceled':
            case 'unpaid': return 'canceled';
            case 'incomplete':
            case 'incomplete_expired': return 'incomplete';
            default: return 'active';
          }
        };

        const status = mapStripeStatus(subscription.status);

        const { error } = await supabase
          .from('subscriptions')
          .update({ status })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        }

        const { error: accountError } = await supabase
          .from('accounts')
          .update({ billing_status: status })
          .eq('stripe_subscription_id', subscription.id);

        if (accountError) {
          console.error('Error updating account:', accountError);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription canceled:', subscription.id);

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        }

        const { error: accountError } = await supabase
          .from('accounts')
          .update({
            plan: 'free',
            billing_status: 'canceled',
            billing_cycle: 'monthly',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (accountError) {
          console.error('Error downgrading account:', accountError);
        }

        break;
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer created:', customer.id);
        console.log('Customer email:', customer.email);
        // No action needed - customer is already linked via checkout.session.completed
        break;
      }

      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer updated:', customer.id);
        console.log('Customer email:', customer.email);
        // No action needed - we track subscription status via other webhooks
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }
}
