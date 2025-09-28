-- Add book value fields for wholesale and retail prices by service
ALTER TABLE "bookValues"
ADD COLUMN mmr_wholesale NUMERIC(10,2),
ADD COLUMN mmr_retail NUMERIC(10,2),
ADD COLUMN kbb_wholesale NUMERIC(10,2),
ADD COLUMN kbb_retail NUMERIC(10,2),
ADD COLUMN jd_power_wholesale NUMERIC(10,2),
ADD COLUMN jd_power_retail NUMERIC(10,2),
ADD COLUMN auction_wholesale NUMERIC(10,2),
ADD COLUMN auction_retail NUMERIC(10,2);