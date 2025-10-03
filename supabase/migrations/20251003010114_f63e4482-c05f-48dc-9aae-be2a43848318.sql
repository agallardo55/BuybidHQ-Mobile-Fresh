-- Create function to get buyer confirmation details (simple version)
CREATE OR REPLACE FUNCTION public.get_buyer_confirmation_details(p_bid_response_id UUID)
RETURNS TABLE(
  buyer_phone TEXT,
  seller_first_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.buyer_mobile as buyer_phone,
    split_part(u.full_name, ' ', 1) as seller_first_name
  FROM bid_responses br
  JOIN buyers b ON br.buyer_id = b.id
  JOIN bid_requests breq ON br.bid_request_id = breq.id
  JOIN buybidhq_users u ON breq.user_id = u.id
  WHERE br.id = p_bid_response_id;
END;
$$;