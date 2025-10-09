-- Delete orphaned bid request records and their related data
-- These three records have NULL recon field causing display/deletion issues

DO $$
DECLARE
  orphaned_ids uuid[] := ARRAY[
    '74c9e01e-3c76-4af4-b032-46c1c29816f3'::uuid,
    '12499055-2379-4b27-9e01-a088ef47a91d'::uuid,
    '4f398193-2ace-468b-9e94-2f96d8eacaad'::uuid
  ];
BEGIN
  -- Delete bid_responses
  DELETE FROM bid_responses
  WHERE bid_request_id = ANY(orphaned_ids);
  
  -- Delete bid_submission_tokens
  DELETE FROM bid_submission_tokens
  WHERE bid_request_id = ANY(orphaned_ids);
  
  -- Delete images
  DELETE FROM images
  WHERE bid_request_id = ANY(orphaned_ids);
  
  -- Delete bid_request_access
  DELETE FROM bid_request_access
  WHERE bid_request_id = ANY(orphaned_ids);
  
  -- Finally, delete the bid_requests themselves
  DELETE FROM bid_requests
  WHERE id = ANY(orphaned_ids);
  
  RAISE NOTICE 'Deleted % orphaned bid requests and their related records', array_length(orphaned_ids, 1);
END $$;