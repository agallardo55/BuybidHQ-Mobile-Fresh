-- Allow all authenticated users to view vehicle images for Market View
-- This policy enables the marketplace grid to display primary images to all users
-- regardless of plan status, while keeping the vehicle details dialog upgrade-gated

CREATE POLICY "All authenticated users can view vehicle images for market view"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vehicle_images' AND (
    EXISTS (
      SELECT 1 FROM images i
      JOIN bid_requests br ON i.bid_request_id = br.id
      WHERE i.image_url LIKE '%' || storage.objects.name || '%'
    )
  )
);

COMMENT ON POLICY "All authenticated users can view vehicle images for market view" ON storage.objects IS 
'Allows all authenticated users to view vehicle images that belong to any bid request for the Market View grid. This enables primary images in the marketplace to be visible to all users regardless of plan status. INSERT/UPDATE/DELETE operations remain restricted by existing policies.';

