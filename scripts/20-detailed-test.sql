-- Simplified test to see validation results and transactions separately

-- 1) Test validation function result
SELECT 'Validation Result' as test, 
       is_valid, current_points, calculated_points, difference, error_message
FROM validate_user_points('a920fe59-66c4-4ea8-8e55-39a2df399be1'::uuid);

-- 2) Show all transactions for this user
SELECT 'Transaction History' as test,
       transaction_type, 
       points_amount, 
       points_before, 
       points_after, 
       description,
       created_at::date as date_created
FROM public.loyalty_transactions 
WHERE user_id = 'a920fe59-66c4-4ea8-8e55-39a2df399be1'::uuid
ORDER BY created_at;

-- 3) Manual calculation check
SELECT 'Manual Calculation' as test,
       COUNT(*) as total_transactions,
       SUM(CASE WHEN transaction_type IN ('EARNED', 'REFUNDED') THEN points_amount ELSE 0 END) as total_earned,
       SUM(CASE WHEN transaction_type IN ('USED', 'DEDUCTED') THEN points_amount ELSE 0 END) as total_used,
       SUM(CASE WHEN transaction_type IN ('EARNED', 'REFUNDED') THEN points_amount ELSE -points_amount END) as net_points
FROM public.loyalty_transactions 
WHERE user_id = 'a920fe59-66c4-4ea8-8e55-39a2df399be1'::uuid;
