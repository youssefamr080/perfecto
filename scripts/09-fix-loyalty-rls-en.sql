-- Fix Row Level Security issue for loyalty_transactions table

-- Temporarily disable RLS to apply fixes
ALTER TABLE loyalty_transactions DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "Users can insert own loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "Service role has full access to loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "System can insert loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "System can update loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "No delete unless admin" ON loyalty_transactions;
-- Ensure idempotency for policies created below
DROP POLICY IF EXISTS "Allow insert loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "No direct updates" ON loyalty_transactions;
DROP POLICY IF EXISTS "No delete allowed" ON loyalty_transactions;

-- Re-enable RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing function with old signature
DROP FUNCTION IF EXISTS add_loyalty_transaction(UUID, UUID, VARCHAR(20), INTEGER, TEXT);
DROP FUNCTION IF EXISTS add_loyalty_transaction(UUID, VARCHAR(20), INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS add_loyalty_transaction(p_user_id UUID, p_order_id UUID, p_transaction_type VARCHAR(20), p_points_amount INTEGER, p_description TEXT);
DROP FUNCTION IF EXISTS add_loyalty_transaction(p_user_id UUID, p_transaction_type VARCHAR(20), p_points_amount INTEGER, p_order_id UUID, p_description TEXT);

-- Drop existing helper functions with old signatures
DROP FUNCTION IF EXISTS earn_loyalty_points(UUID, UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS earn_loyalty_points(UUID, INTEGER, UUID, TEXT);
DROP FUNCTION IF EXISTS use_loyalty_points(UUID, UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS use_loyalty_points(UUID, INTEGER, UUID, TEXT);

-- Create new more flexible policies

-- 1. Read policy: Users can view their own transactions only
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Insert policy: Allow system to add transactions (function is protected)
CREATE POLICY "Allow insert loyalty transactions" ON loyalty_transactions
  FOR INSERT
  WITH CHECK (true);

-- 3. Update policy: Prevent direct updates
CREATE POLICY "No direct updates" ON loyalty_transactions
  FOR UPDATE
  USING (false);

-- 4. Delete policy: Prevent all deletes
CREATE POLICY "No delete allowed" ON loyalty_transactions
  FOR DELETE
  USING (false);

-- Create enhanced function for handling loyalty transactions
CREATE OR REPLACE FUNCTION add_loyalty_transaction(
  p_user_id UUID,
  p_transaction_type VARCHAR(20),
  p_points_amount INTEGER,
  p_order_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Run with creator privileges
AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
  result JSON;
BEGIN
  -- Check if user exists
  SELECT loyalty_points INTO current_points 
  FROM users 
  WHERE id = p_user_id;
  
  IF current_points IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Calculate new points based on transaction type
  CASE p_transaction_type
    WHEN 'EARNED' THEN
      new_points := current_points + p_points_amount;
    WHEN 'USED' THEN
      new_points := current_points - p_points_amount;
      IF new_points < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient points');
      END IF;
    WHEN 'REFUNDED' THEN
      new_points := current_points + p_points_amount;
    WHEN 'DEDUCTED' THEN
      new_points := current_points - p_points_amount;
      IF new_points < 0 THEN
        new_points := 0; -- Don't go below zero for deductions
      END IF;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid transaction type');
  END CASE;

  -- Update user points
  UPDATE users 
  SET loyalty_points = new_points,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction safely
  INSERT INTO loyalty_transactions (
    user_id,
    order_id,
    transaction_type,
    points_amount,
    points_before,
    points_after,
    description,
    created_by
  ) VALUES (
    p_user_id,
    p_order_id,
    p_transaction_type,
    p_points_amount,
    current_points,
    new_points,
    COALESCE(p_description, 'Points transaction - ' || p_transaction_type),
    'SYSTEM'
  );

  -- Return result
  RETURN json_build_object(
    'success', true,
    'points_before', current_points,
    'points_change', p_points_amount,
    'points_after', new_points,
    'transaction_type', p_transaction_type
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'System error: ' || SQLERRM
    );
END;
$$;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON loyalty_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION add_loyalty_transaction TO authenticated, anon;

-- Create helper function to simplify adding points
CREATE OR REPLACE FUNCTION earn_loyalty_points(
  user_uuid UUID,
  points_amount INTEGER,
  order_uuid UUID DEFAULT NULL,
  description TEXT DEFAULT 'Points from completed order'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN add_loyalty_transaction(user_uuid, 'EARNED', points_amount, order_uuid, description);
END;
$$;

-- Create helper function for using points
CREATE OR REPLACE FUNCTION use_loyalty_points(
  user_uuid UUID,
  points_amount INTEGER,
  order_uuid UUID DEFAULT NULL,
  description TEXT DEFAULT 'Points used in order'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN add_loyalty_transaction(user_uuid, 'USED', points_amount, order_uuid, description);
END;
$$;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION earn_loyalty_points TO authenticated, anon;
GRANT EXECUTE ON FUNCTION use_loyalty_points TO authenticated, anon;
