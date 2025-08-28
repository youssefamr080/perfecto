-- Simple diagnostics for loyalty system (works in Supabase SQL Editor)

-- 1) Check table exists and row count
SELECT 'Table exists and count' as status, count(*) as rows FROM public.loyalty_transactions;

-- 2) Check RLS is enabled
SELECT 'RLS Status' as status, 
       CASE WHEN c.relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace 
WHERE c.relname = 'loyalty_transactions' AND n.nspname = 'public';

-- 3) Check if add_loyalty_transaction function exists
SELECT 'Function exists' as status, 
       CASE WHEN count(*) > 0 THEN 'YES' ELSE 'NO' END as function_exists,
       count(*) as function_count
FROM pg_proc p 
JOIN pg_namespace n ON n.oid = p.pronamespace 
WHERE p.proname = 'add_loyalty_transaction' AND n.nspname = 'public';

-- 4) Test function call (should return success=false for non-existent user)
SELECT 'Function test' as status, 
       add_loyalty_transaction('00000000-0000-0000-0000-000000000000', 'EARNED', 1) as result;

-- 5) Check specific user by phone (edit phone number below)
SELECT 'User lookup' as status, id, phone, loyalty_points 
FROM public.users 
WHERE phone LIKE '%01064144141%' 
LIMIT 1;
