-- Safe global reconciliation of user points using transactions only
-- No rows are deleted; we only add correcting transactions via SECURITY DEFINER function.

DO $$
DECLARE
  u RECORD;
  v RECORD;
BEGIN
  FOR u IN SELECT id FROM public.users LOOP
    -- validate
    SELECT * INTO v FROM validate_user_points(u.id) LIMIT 1;
    IF v IS NULL THEN
      CONTINUE;
    END IF;

    IF v.is_valid = false THEN
      IF v.difference > 0 THEN
        -- current_points > calculated_points -> deduct the extra
        PERFORM add_loyalty_transaction(u.id, 'DEDUCTED', v.difference, NULL, 'Auto reconcile: deduct to match history');
      ELSIF v.difference < 0 THEN
        -- current_points < calculated_points -> add the missing
        PERFORM add_loyalty_transaction(u.id, 'EARNED', ABS(v.difference), NULL, 'Auto reconcile: earn to match history');
      END IF;
    END IF;
  END LOOP;
END $$;
