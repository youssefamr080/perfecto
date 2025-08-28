-- Emergency fix: Create missing RLS policies and function if needed
-- Run this if diagnostics show missing components

-- Enable RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create read policy (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='loyalty_transactions' AND policyname='loyalty_read_own') THEN
    EXECUTE 'CREATE POLICY "loyalty_read_own" ON public.loyalty_transactions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END$$;

-- Create insert policy (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='loyalty_transactions' AND policyname='loyalty_insert_all') THEN
    EXECUTE 'CREATE POLICY "loyalty_insert_all" ON public.loyalty_transactions FOR INSERT WITH CHECK (true)';
  END IF;
END$$;

-- Create the main function if missing
CREATE OR REPLACE FUNCTION public.add_loyalty_transaction(
  p_user_id UUID,
  p_transaction_type VARCHAR(20),
  p_points_amount INTEGER,
  p_order_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
BEGIN
  -- Get current points
  SELECT loyalty_points INTO current_points FROM public.users WHERE id = p_user_id;
  IF current_points IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Calculate new points
  CASE p_transaction_type
    WHEN 'EARNED' THEN new_points := current_points + p_points_amount;
    WHEN 'USED' THEN 
      new_points := current_points - p_points_amount;
      IF new_points < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient points');
      END IF;
    WHEN 'REFUNDED' THEN new_points := current_points + p_points_amount;
    WHEN 'DEDUCTED' THEN new_points := GREATEST(current_points - p_points_amount, 0);
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid transaction type');
  END CASE;

  -- Update user points
  UPDATE public.users SET loyalty_points = new_points WHERE id = p_user_id;

  -- Insert transaction record
  INSERT INTO public.loyalty_transactions (
    user_id, order_id, transaction_type, points_amount,
    points_before, points_after, description, created_by
  ) VALUES (
    p_user_id, p_order_id, p_transaction_type, p_points_amount,
    current_points, new_points, 
    COALESCE(p_description, 'Points transaction - ' || p_transaction_type), 
    'SYSTEM'
  );

  RETURN json_build_object(
    'success', true,
    'points_before', current_points,
    'points_after', new_points
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.add_loyalty_transaction TO authenticated, anon;
GRANT SELECT ON public.loyalty_transactions TO authenticated;
