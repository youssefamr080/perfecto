-- Enforce non-empty comments and rating range on product_reviews, and add an INSERT policy
-- Review before running on production. This script attempts to be idempotent.

BEGIN;

-- Add CHECK constraint to ensure comment is not empty (trimmed length > 0)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'product_reviews_comment_not_empty'
  ) THEN
    ALTER TABLE product_reviews
      ADD CONSTRAINT product_reviews_comment_not_empty CHECK (char_length(trim(coalesce(comment, ''))) > 0);
  END IF;
END
$$;

-- Add CHECK constraint for rating bounds
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'product_reviews_rating_range'
  ) THEN
    ALTER TABLE product_reviews
      ADD CONSTRAINT product_reviews_rating_range CHECK (rating >= 1 AND rating <= 5);
  END IF;
END
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS product_reviews ENABLE ROW LEVEL SECURITY;

-- Create an INSERT policy that requires authenticated user insert their own reviews and non-empty comment
DO $$
BEGIN
  BEGIN
    CREATE POLICY product_reviews_insert_policy ON product_reviews
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = user_id AND char_length(trim(coalesce(comment, ''))) > 0 AND rating >= 1 AND rating <= 5);
  EXCEPTION WHEN SQLSTATE '42710' THEN
    -- policy already exists, ignore
    RAISE NOTICE 'policy already exists';
  END;
END
$$;

COMMIT;
