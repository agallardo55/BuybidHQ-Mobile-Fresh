-- ============================================================================
-- Add Missing Bid Request Form Fields
-- ============================================================================
-- Purpose: Add vehicle history, body style, and book values support
-- Date: 2025-12-28
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Add missing columns to vehicles table
-- ============================================================================

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS body_style TEXT,
  ADD COLUMN IF NOT EXISTS history_report TEXT,
  ADD COLUMN IF NOT EXISTS history_service TEXT;

COMMENT ON COLUMN public.vehicles.body_style IS
  'Vehicle body style (e.g., Sedan, SUV, Truck, Coupe, etc.)';

COMMENT ON COLUMN public.vehicles.history_report IS
  'Full vehicle history report data or summary';

COMMENT ON COLUMN public.vehicles.history_service IS
  'History service provider used (e.g., Carfax, AutoCheck, etc.)';

-- ============================================================================
-- 2. Create book_values table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.book_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,

  -- Manheim Market Report (MMR) values
  mmr_wholesale NUMERIC(10,2),
  mmr_retail NUMERIC(10,2),

  -- Kelley Blue Book (KBB) values
  kbb_wholesale NUMERIC(10,2),
  kbb_retail NUMERIC(10,2),

  -- J.D. Power values
  jd_power_wholesale NUMERIC(10,2),
  jd_power_retail NUMERIC(10,2),

  -- Auction values
  auction_wholesale NUMERIC(10,2),
  auction_retail NUMERIC(10,2),

  -- Condition used for valuation
  condition TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one book value record per vehicle
  CONSTRAINT unique_vehicle_book_values UNIQUE(vehicle_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_book_values_vehicle_id
  ON public.book_values(vehicle_id);

-- Add comments
COMMENT ON TABLE public.book_values IS
  'Stores vehicle book values from various valuation services (MMR, KBB, J.D. Power, Auction)';

COMMENT ON COLUMN public.book_values.condition IS
  'Vehicle condition used for book value calculations (e.g., Excellent, Good, Fair, Poor)';

-- ============================================================================
-- 3. Enable RLS on book_values table
-- ============================================================================

ALTER TABLE public.book_values ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view book values for vehicles in their bid requests
CREATE POLICY "Users can view book values for their vehicles"
  ON public.book_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (
        -- User owns the bid request
        br.user_id = auth.uid()
        -- Or user is in the same account
        OR EXISTS (
          SELECT 1 FROM public.buybidhq_users u
          WHERE u.id = auth.uid()
          AND u.account_id = br.account_id
        )
        -- Or super admin
        OR (
          SELECT app_role FROM public.buybidhq_users
          WHERE id = auth.uid()
        ) = 'super_admin'
      )
    )
  );

-- RLS Policy: Users can insert book values for their vehicles
CREATE POLICY "Users can insert book values for their vehicles"
  ON public.book_values FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (
        br.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.buybidhq_users u
          WHERE u.id = auth.uid()
          AND u.account_id = br.account_id
        )
        OR (
          SELECT app_role FROM public.buybidhq_users
          WHERE id = auth.uid()
        ) = 'super_admin'
      )
    )
  );

-- RLS Policy: Users can update book values for their vehicles
CREATE POLICY "Users can update book values for their vehicles"
  ON public.book_values FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (
        br.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.buybidhq_users u
          WHERE u.id = auth.uid()
          AND u.account_id = br.account_id
        )
        OR (
          SELECT app_role FROM public.buybidhq_users
          WHERE id = auth.uid()
        ) = 'super_admin'
      )
    )
  );

-- RLS Policy: Users can delete book values for their vehicles
CREATE POLICY "Users can delete book values for their vehicles"
  ON public.book_values FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.vehicle_id = book_values.vehicle_id
      AND (
        br.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.buybidhq_users u
          WHERE u.id = auth.uid()
          AND u.account_id = br.account_id
        )
        OR (
          SELECT app_role FROM public.buybidhq_users
          WHERE id = auth.uid()
        ) = 'super_admin'
      )
    )
  );

-- ============================================================================
-- 4. Create trigger to update book_values.updated_at
-- ============================================================================

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

-- ============================================================================
-- 5. Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_values TO authenticated;
GRANT USAGE ON SEQUENCE book_values_id_seq TO authenticated;

COMMIT;
