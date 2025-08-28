-- Non-destructive diagnostics for loyalty_transactions RLS and functions
-- This script DOES NOT modify or delete any data.

-- 1) Table row count (sanity)
select 'loyalty_transactions_count' as check, count(*) as value
from public.loyalty_transactions;

-- 2) RLS status
select 'rls_status' as check,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_force
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relname = 'loyalty_transactions' and n.nspname = 'public';

-- 3) Existing policies
select 'policies' as check,
       p.policyname,
       p.cmd,
       p.permissive,
       p.roles,
       p.qual,
       p.with_check
from pg_policies p
where p.schemaname = 'public' and p.tablename = 'loyalty_transactions'
order by p.policyname;

-- 4) Table grants
select 'table_grants' as check,
       grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'loyalty_transactions'
order by grantee, privilege_type;

-- 5) Functions named add_loyalty_transaction (to detect duplicates)
select 'functions_add_loyalty_transaction' as check,
       n.nspname as schema,
       p.proname as name,
       pg_get_function_identity_arguments(p.oid) as args,
       p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'add_loyalty_transaction'
order by args;

-- 6) Helper functions (earn/use)
select 'functions_helpers' as check,
       n.nspname as schema,
       p.proname as name,
       pg_get_function_identity_arguments(p.oid) as args,
       p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname in ('earn_loyalty_points','use_loyalty_points')
order by p.proname, args;

-- 7) Routine privileges (who can execute)
select 'routine_privileges' as check,
       specific_name, routine_name, grantee, privilege_type
from information_schema.routine_privileges
where specific_schema = 'public'
  and routine_name in ('add_loyalty_transaction','earn_loyalty_points','use_loyalty_points')
order by routine_name, grantee;

-- 8) Safe function test (non-existent user) – expected: {success:false, error:'User not found'}
select 'function_sanity_call' as check,
       add_loyalty_transaction('00000000-0000-0000-0000-000000000000', 'EARNED', 1, null, 'DIAG_TEST') as result;
