-- Safe reconciliation of RLS and functions for loyalty_transactions
-- Non-destructive: does NOT delete any rows; only creates/updates definitions.

-- 1) Ensure RLS is enabled (do not disable)
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- 2) Create/select policies idempotently: use CREATE OR REPLACE where possible
-- Note: CREATE POLICY lacks OR REPLACE in Postgres; we gate with DO blocks.

-- Read policy: Users can view their own transactions only
DO $$
DECLARE _exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='loyalty_transactions' 
      AND policyname='Users can view own loyalty transactions'
  ) INTO _exists;
  IF _exists THEN
    EXECUTE 'ALTER POLICY "Users can view own loyalty transactions" ON public.loyalty_transactions
      USING (auth.uid() = user_id)';
  ELSE
    EXECUTE 'CREATE POLICY "Users can view own loyalty transactions" ON public.loyalty_transactions
      FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END$$;

-- Insert policy: allow inserts (function will enforce security)
DO $$
DECLARE _exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='loyalty_transactions' 
      AND policyname='Allow insert loyalty transactions'
  ) INTO _exists;
  IF _exists THEN
    EXECUTE 'ALTER POLICY "Allow insert loyalty transactions" ON public.loyalty_transactions
      WITH CHECK (true)';
  ELSE
    EXECUTE 'CREATE POLICY "Allow insert loyalty transactions" ON public.loyalty_transactions
      FOR INSERT WITH CHECK (true)';
  END IF;
END$$;

-- Update policy: block direct updates
DO $$
DECLARE _exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='loyalty_transactions' 
      AND policyname='No direct updates'
  ) INTO _exists;
  IF _exists THEN
    EXECUTE 'ALTER POLICY "No direct updates" ON public.loyalty_transactions
      USING (false)';
  ELSE
    EXECUTE 'CREATE POLICY "No direct updates" ON public.loyalty_transactions
      FOR UPDATE USING (false)';
  END IF;
END$$;

-- Delete policy: block deletes
DO $$
DECLARE _exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='loyalty_transactions' 
      AND policyname='No delete allowed'
  ) INTO _exists;
  IF _exists THEN
    EXECUTE 'ALTER POLICY "No delete allowed" ON public.loyalty_transactions
      USING (false)';
  ELSE
    EXECUTE 'CREATE POLICY "No delete allowed" ON public.loyalty_transactions
      FOR DELETE USING (false)';
  END IF;
END$$;

-- 3) Ensure function signature exists exactly once, as SECURITY DEFINER
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
  SELECT loyalty_points INTO current_points FROM public.users WHERE id = p_user_id;
  IF current_points IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  CASE p_transaction_type
    WHEN 'EARNED' THEN new_points := current_points + p_points_amount;
    WHEN 'USED' THEN new_points := current_points - p_points_amount;
    WHEN 'REFUNDED' THEN new_points := current_points + p_points_amount;
    WHEN 'DEDUCTED' THEN new_points := GREATEST(current_points - p_points_amount, 0);
    ELSE RETURN json_build_object('success', false, 'error', 'Invalid transaction type');
  END CASE;

  UPDATE public.users
     SET loyalty_points = new_points,
         updated_at = now()
   WHERE id = p_user_id;

  INSERT INTO public.loyalty_transactions(
    user_id, order_id, transaction_type, points_amount,
    points_before, points_after, description, created_by
  ) VALUES (
    p_user_id, p_order_id, p_transaction_type, p_points_amount,
    current_points, new_points, COALESCE(p_description, 'Points transaction - ' || p_transaction_type), 'SYSTEM'
  );

  RETURN json_build_object(
    'success', true,
    'points_before', current_points,
    'points_change', p_points_amount,
    'points_after', new_points,
    'transaction_type', p_transaction_type
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'System error: ' || SQLERRM);
END$$;

GRANT EXECUTE ON FUNCTION public.add_loyalty_transaction(UUID, character varying, INTEGER, UUID, TEXT) TO authenticated, anon;
GRANT SELECT ON public.loyalty_transactions TO authenticated;

-- 4) Ensure helper functions exist
CREATE OR REPLACE FUNCTION public.earn_loyalty_points(
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
  RETURN public.add_loyalty_transaction(user_uuid, 'EARNED', points_amount, order_uuid, description);
END$$;

CREATE OR REPLACE FUNCTION public.use_loyalty_points(
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
  RETURN public.add_loyalty_transaction(user_uuid, 'USED', points_amount, order_uuid, description);
END$$;

GRANT EXECUTE ON FUNCTION public.earn_loyalty_points(UUID, INTEGER, UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.use_loyalty_points(UUID, INTEGER, UUID, TEXT) TO authenticated, anon;
