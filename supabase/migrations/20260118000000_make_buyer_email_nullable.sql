-- Make buyer email nullable
-- Only buyer_name, dealer_name, and buyer_mobile are required

ALTER TABLE buyers ALTER COLUMN email DROP NOT NULL;

COMMENT ON TABLE buyers IS 'Buyers table - email is optional, only buyer_name, dealer_name, and buyer_mobile are required.';
