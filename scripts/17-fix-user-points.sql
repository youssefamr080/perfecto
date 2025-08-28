-- Fix specific user points mismatch (edit phone number below)
-- This adds a correcting transaction without deleting anything

DO $$
DECLARE
  target_phone VARCHAR := '01064144141';  -- EDIT THIS PHONE NUMBER
  target_user_id UUID;
  current_pts INTEGER;
  calc_pts INTEGER;
  diff_pts INTEGER;
BEGIN
  -- Find user by phone
  SELECT id, loyalty_points INTO target_user_id, current_pts 
  FROM public.users 
  WHERE phone LIKE '%' || target_phone || '%' 
  LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User not found with phone: %', target_phone;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found user: % with % points', target_user_id, current_pts;
  
  -- Calculate what points should be based on transactions
  SELECT COALESCE(SUM(
    CASE 
      WHEN transaction_type IN ('EARNED', 'REFUNDED') THEN points_amount
      WHEN transaction_type IN ('USED', 'DEDUCTED') THEN -points_amount
      ELSE 0
    END
  ), 0) INTO calc_pts
  FROM public.loyalty_transactions 
  WHERE user_id = target_user_id;
  
  diff_pts := current_pts - calc_pts;
  
  RAISE NOTICE 'Current: %, Calculated: %, Difference: %', current_pts, calc_pts, diff_pts;
  
  -- Fix if there's a mismatch
  IF diff_pts != 0 THEN
    IF diff_pts > 0 THEN
      -- Too many points, deduct the extra
      PERFORM add_loyalty_transaction(target_user_id, 'DEDUCTED', diff_pts, NULL, 'Auto-fix: Remove excess points');
      RAISE NOTICE 'Deducted % excess points', diff_pts;
    ELSE
      -- Too few points, add the missing
      PERFORM add_loyalty_transaction(target_user_id, 'EARNED', ABS(diff_pts), NULL, 'Auto-fix: Add missing points');
      RAISE NOTICE 'Added % missing points', ABS(diff_pts);
    END IF;
  ELSE
    RAISE NOTICE 'Points are already correct, no fix needed';
  END IF;
END$$;
