-- Test the validation function with the specific user
-- Replace the UUID below with the actual user ID: a920fe59-66c4-4ea8-8e55-39a2df399be1

SELECT 'Before fix' as status, v.*
FROM validate_user_points('a920fe59-66c4-4ea8-8e55-39a2df399be1'::uuid) AS v;

-- Check their transactions
SELECT 'User transactions' as status, 
       transaction_type, points_amount, points_before, points_after, description, created_at
FROM public.loyalty_transactions 
WHERE user_id = 'a920fe59-66c4-4ea8-8e55-39a2df399be1'::uuid
ORDER BY created_at;

-- Check user current points
SELECT 'User current points' as status, 
       id, phone, loyalty_points
FROM public.users 
WHERE id = 'a920fe59-66c4-4ea8-8e55-39a2df399be1'::uuid;
