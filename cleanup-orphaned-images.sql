-- Cleanup script for orphaned image records
-- This script removes database records that reference non-existent files in storage

-- Step 1: Find orphaned records (for reporting)
SELECT 
  'Orphaned records found:' as status,
  COUNT(*) as count
FROM images i
LEFT JOIN storage.objects s ON s.name = split_part(i.image_url, '/', -1) AND s.bucket_id = 'vehicle_images'
WHERE s.name IS NULL;

-- Step 2: Show details of orphaned records (for review)
SELECT 
  i.id,
  i.bid_request_id,
  i.image_url,
  i.created_at,
  'ORPHANED' as status
FROM images i
LEFT JOIN storage.objects s ON s.name = split_part(i.image_url, '/', -1) AND s.bucket_id = 'vehicle_images'
WHERE s.name IS NULL
ORDER BY i.created_at DESC;

-- Step 3: Delete orphaned records
-- WARNING: This will permanently delete database records for non-existent files
-- Run the queries above first to review what will be deleted

DELETE FROM images 
WHERE id IN (
  SELECT i.id 
  FROM images i
  LEFT JOIN storage.objects s ON s.name = split_part(i.image_url, '/', -1) AND s.bucket_id = 'vehicle_images'
  WHERE s.name IS NULL
);

-- Step 4: Verify cleanup
SELECT 
  'Cleanup complete. Remaining orphaned records:' as status,
  COUNT(*) as count
FROM images i
LEFT JOIN storage.objects s ON s.name = split_part(i.image_url, '/', -1) AND s.bucket_id = 'vehicle_images'
WHERE s.name IS NULL;

-- Step 5: Show remaining valid records
SELECT 
  'Valid image records:' as status,
  COUNT(*) as count
FROM images i
JOIN storage.objects s ON s.name = split_part(i.image_url, '/', -1) AND s.bucket_id = 'vehicle_images';
