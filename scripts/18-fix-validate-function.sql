-- Create or fix the validate_user_points function
-- This function should properly calculate points from transaction history

CREATE OR REPLACE FUNCTION public.validate_user_points(user_uuid UUID)
RETURNS TABLE(
  is_valid BOOLEAN,
  current_points INTEGER,
  calculated_points INTEGER,
  difference INTEGER,
  error_message TEXT
) AS $$
DECLARE
  user_points INTEGER;
  calculated_total INTEGER;
BEGIN
  -- Get current points from users table
  SELECT loyalty_points INTO user_points
  FROM public.users WHERE id = user_uuid;
  
  IF user_points IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0, 0, 'User not found'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate points from transaction history
  SELECT COALESCE(SUM(
    CASE 
      WHEN transaction_type IN ('EARNED', 'REFUNDED') THEN points_amount
      WHEN transaction_type IN ('USED', 'DEDUCTED') THEN -points_amount
      ELSE 0
    END
  ), 0) INTO calculated_total
  FROM public.loyalty_transactions
  WHERE user_id = user_uuid;
  
  RETURN QUERY SELECT 
    (user_points = calculated_total),
    user_points,
    calculated_total,
    (user_points - calculated_total),
    CASE 
      WHEN user_points = calculated_total THEN 'Points are valid'::TEXT
      ELSE 'Points mismatch detected'::TEXT
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_user_points(UUID) TO authenticated, anon;
