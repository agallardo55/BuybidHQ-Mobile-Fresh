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

    // Handle different event types
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

    return new Response(
      JSON.stringify({ received: true }),
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
