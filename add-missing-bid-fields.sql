-- ============================================================================
-- QUICK APPLY: Add Missing Bid Request Form Fields
-- ============================================================================
-- INSTRUCTIONS: Run this in Supabase SQL Editor if migration push fails
-- Dashboard -> SQL Editor -> New Query -> Paste this -> Run
-- ============================================================================

-- Add missing columns to vehicles table
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS body_style TEXT,
  ADD COLUMN IF NOT EXISTS history_report TEXT,
  ADD COLUMN IF NOT EXISTS history_service TEXT;

-- Create book_values table
CREATE TABLE IF NOT EXISTS public.book_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  mmr_wholesale NUMERIC(10,2),
  mmr_retail NUMERIC(10,2),
  kbb_wholesale NUMERIC(10,2),
  kbb_retail NUMERIC(10,2),
  jd_power_wholesale NUMERIC(10,2),
  jd_power_retail NUMERIC(10,2),
  auction_wholesale NUMERIC(10,2),
  auction_retail NUMERIC(10,2),
  condition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_vehicle_book_values UNIQUE(vehicle_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_book_values_vehicle_id ON public.book_values(vehicle_id);

-- Enable RLS
ALTER TABLE public.book_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view book values for their vehicles"
  ON public.book_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (br.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.buybidhq_users u WHERE u.id = auth.uid() AND u.account_id = br.account_id
      ) OR (SELECT app_role FROM public.buybidhq_users WHERE id = auth.uid()) = 'super_admin')
    )
  );

CREATE POLICY "Users can insert book values for their vehicles"
  ON public.book_values FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (br.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.buybidhq_users u WHERE u.id = auth.uid() AND u.account_id = br.account_id
      ) OR (SELECT app_role FROM public.buybidhq_users WHERE id = auth.uid()) = 'super_admin')
    )
  );

CREATE POLICY "Users can update book values for their vehicles"
  ON public.book_values FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (br.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.buybidhq_users u WHERE u.id = auth.uid() AND u.account_id = br.account_id
      ) OR (SELECT app_role FROM public.buybidhq_users WHERE id = auth.uid()) = 'super_admin')
    )
  );

CREATE POLICY "Users can delete book values for their vehicles"
  ON public.book_values FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (br.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.buybidhq_users u WHERE u.id = auth.uid() AND u.account_id = br.account_id
      ) OR (SELECT app_role FROM public.buybidhq_users WHERE id = auth.uid()) = 'super_admin')
    )
  );

-- Create trigger
CREATE OR REPLACE FUNCTION public.update_book_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER book_values_updated_at
  BEFORE UPDATE ON public.book_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_book_values_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_values TO authenticated;
