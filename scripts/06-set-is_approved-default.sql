-- Set default for product_reviews.is_approved to true
-- Non-destructive: sets default and fixes NULL values. Review before running in production.

BEGIN;

-- Set default to true
ALTER TABLE IF EXISTS product_reviews
  ALTER COLUMN is_approved SET DEFAULT true;

-- Optional: for existing NULLs, set to true (comment out if undesired)
UPDATE product_reviews
SET is_approved = true
WHERE is_approved IS NULL;

COMMIT;
