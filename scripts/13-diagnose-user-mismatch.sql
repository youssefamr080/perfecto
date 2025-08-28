-- Set the target phone here
-- Replace the value between quotes with the phone you want to diagnose
-- Example: '01064144141'
WITH params AS (
  SELECT '01064144141'::text AS phone
), u AS (
  SELECT id, phone, loyalty_points
  FROM public.users, params
  WHERE users.phone ILIKE '%' || params.phone || '%'
  LIMIT 1
)
SELECT 'user_info' AS check, * FROM u;

-- Validation result for the found user
WITH params AS (
  SELECT '01064144141'::text AS phone
), uid AS (
  SELECT id FROM public.users, params
  WHERE users.phone ILIKE '%' || params.phone || '%'
  LIMIT 1
)
SELECT 'validate_user_points' AS check, v.*
FROM uid
CROSS JOIN LATERAL validate_user_points(uid.id) AS v
LIMIT 1;

-- Recent transactions (last 20)
WITH params AS (
  SELECT '01064144141'::text AS phone
), uid AS (
  SELECT id FROM public.users, params
  WHERE users.phone ILIKE '%' || params.phone || '%'
  LIMIT 1
)
SELECT * FROM public.loyalty_transactions lt
WHERE lt.user_id IN (SELECT id FROM uid)
ORDER BY lt.created_at DESC
LIMIT 20;
