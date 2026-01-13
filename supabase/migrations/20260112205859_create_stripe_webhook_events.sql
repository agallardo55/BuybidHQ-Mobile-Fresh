-- Create table to track processed Stripe webhook events for idempotency
-- This prevents duplicate processing if Stripe sends the same webhook multiple times

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb,
  processing_result text,
  processing_error text,
  retry_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast event_id lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id 
  ON public.stripe_webhook_events(event_id);

-- Index for querying by event type
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type 
  ON public.stripe_webhook_events(event_type);

-- Index for finding recent events
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at 
  ON public.stripe_webhook_events(processed_at DESC);

-- Enable RLS
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write webhook events (security)
CREATE POLICY "Service role can manage webhook events" 
  ON public.stripe_webhook_events
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Super admins can view webhook events for debugging
CREATE POLICY "Super admins can view webhook events" 
  ON public.stripe_webhook_events
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'app_role' = 'super_admin'
    )
  );

COMMENT ON TABLE public.stripe_webhook_events IS 
  'Tracks processed Stripe webhook events to prevent duplicate processing (idempotency). Each Stripe event is logged here when processed successfully.';

COMMENT ON COLUMN public.stripe_webhook_events.event_id IS 
  'Unique Stripe event ID (e.g., evt_1abc123). Used to detect duplicate webhooks.';

COMMENT ON COLUMN public.stripe_webhook_events.processing_result IS 
  'Result of processing: success, failed, or skipped';

COMMENT ON COLUMN public.stripe_webhook_events.retry_count IS 
  'Number of times this event was retried due to failures';
