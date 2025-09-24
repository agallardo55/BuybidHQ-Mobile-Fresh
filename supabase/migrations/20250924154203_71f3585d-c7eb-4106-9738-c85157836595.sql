-- Create password reset attempts tracking table
CREATE TABLE password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempts integer DEFAULT 1,
  last_attempt timestamp with time zone DEFAULT now(),
  reset_at timestamp with time zone DEFAULT (now() + interval '1 hour'),
  created_at timestamp with time zone DEFAULT now()
);

-- Create user security events logging table
CREATE TABLE user_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user sessions tracking table
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  device_info jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  last_activity timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE password_reset_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for password_reset_attempts
CREATE POLICY "System can manage reset attempts" ON password_reset_attempts
  FOR ALL USING (true);

-- Create policies for user_security_events
CREATE POLICY "Users can view their own security events" ON user_security_events
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "System can create security events" ON user_security_events
  FOR INSERT WITH CHECK (true);

-- Create policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "System can manage sessions" ON user_sessions
  FOR ALL USING (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_details jsonb DEFAULT '{}',
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_security_events (
    user_id, event_type, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_event_type, p_details, p_ip_address, p_user_agent
  );
END;
$$;

-- Create function to check password reset rate limit
CREATE OR REPLACE FUNCTION check_password_reset_rate_limit(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts integer;
  v_last_attempt timestamp with time zone;
BEGIN
  -- Get current attempts for this email within the last hour
  SELECT attempts, last_attempt
  INTO v_attempts, v_last_attempt
  FROM password_reset_attempts
  WHERE email = p_email
  AND reset_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no recent attempts, allow
  IF v_attempts IS NULL THEN
    RETURN true;
  END IF;
  
  -- If less than 3 attempts, allow
  IF v_attempts < 3 THEN
    -- Update attempts count
    UPDATE password_reset_attempts
    SET attempts = attempts + 1,
        last_attempt = now()
    WHERE email = p_email
    AND reset_at > now();
    
    RETURN true;
  END IF;
  
  -- Rate limited
  RETURN false;
END;
$$;

-- Create function to reset password attempts counter
CREATE OR REPLACE FUNCTION reset_password_attempts(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO password_reset_attempts (email, attempts)
  VALUES (p_email, 1)
  ON CONFLICT (email) DO UPDATE SET
    attempts = 1,
    last_attempt = now(),
    reset_at = now() + interval '1 hour';
END;
$$;