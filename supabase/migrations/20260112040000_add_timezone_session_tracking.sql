-- Add timezone-aware session tracking for end-of-day logout
-- Users will be logged out at midnight in their local timezone

-- Create table to track user sessions with timezone info
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_started_at timestamptz NOT NULL DEFAULT now(),
  session_expires_at timestamptz NOT NULL,
  timezone_name text NOT NULL, -- e.g., 'America/Los_Angeles'
  timezone_offset_minutes integer NOT NULL, -- e.g., -480 for PST
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own session
CREATE POLICY "Users can view own session"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own session
CREATE POLICY "Users can create own session"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own session
CREATE POLICY "Users can update own session"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own session
CREATE POLICY "Users can delete own session"
ON public.user_sessions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create index for fast lookups
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(session_expires_at);

-- Function to check if session is expired
CREATE OR REPLACE FUNCTION public.is_session_expired()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expires_at timestamptz;
BEGIN
  -- Get session expiration time
  SELECT session_expires_at INTO v_expires_at
  FROM public.user_sessions
  WHERE user_id = auth.uid();

  -- If no session record, not expired (will be created on first check)
  IF v_expires_at IS NULL THEN
    RETURN false;
  END IF;

  -- Return true if current time is past expiration
  RETURN now() > v_expires_at;
END;
$$;

COMMENT ON TABLE public.user_sessions IS
  'Tracks user sessions with timezone info for end-of-day logout. Session expires at midnight in user''s local timezone.';

COMMENT ON FUNCTION public.is_session_expired() IS
  'Returns true if current session has expired (past midnight in user timezone).';
