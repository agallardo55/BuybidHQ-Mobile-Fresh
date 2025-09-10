-- PHASE 1: Enable RLS on tables that need it and create proper policies

-- Enable RLS on notifications table and add policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS on images table and add policies
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view images for their accessible bid requests" 
ON public.images 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.bid_requests br 
    WHERE br.id = images.bid_request_id 
    AND can_access_bid_request(auth.uid(), br.id)
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Users can insert images for their bid requests" 
ON public.images 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bid_requests br 
    WHERE br.id = images.bid_request_id 
    AND br.user_id = auth.uid()
  ) OR is_admin(auth.uid())
);

-- Enable RLS on bid_submission_tokens table and add policies
ALTER TABLE public.bid_submission_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage bid submission tokens" 
ON public.bid_submission_tokens 
FOR ALL 
USING (true);

-- Enable RLS on vehicles table and add policies
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vehicles through their bid requests" 
ON public.vehicles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.bid_requests br 
    WHERE br.vehicle_id = vehicles.id 
    AND can_access_bid_request(auth.uid(), br.id)
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Users can create vehicles for their bid requests" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable RLS on reconditioning table and add policies
ALTER TABLE public.reconditioning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reconditioning through vehicles" 
ON public.reconditioning 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v 
    JOIN public.bid_requests br ON br.vehicle_id = v.id 
    WHERE (v.id = reconditioning.vehicle_id OR br.recon = reconditioning.id)
    AND can_access_bid_request(auth.uid(), br.id)
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Users can create reconditioning records" 
ON public.reconditioning 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);