-- Make vehicle_images bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'vehicle_images';

-- Create policy to allow public read access to vehicle images
CREATE POLICY "Public read access for vehicle images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'vehicle_images');

-- Create policy to allow authenticated users to upload vehicle images
CREATE POLICY "Authenticated users can upload vehicle images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'vehicle_images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to update their own vehicle images
CREATE POLICY "Users can update vehicle images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'vehicle_images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to delete vehicle images
CREATE POLICY "Users can delete vehicle images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'vehicle_images' 
  AND auth.role() = 'authenticated'
);