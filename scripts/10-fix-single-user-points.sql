-- Fix a single user's points by phone, then re-validate
-- Usage: Replace :phone with the actual phone number

begin;
  -- Find the user by phone
  with u as (
    select id from public.users where phone like '%01064144141%' limit 1
  )
  -- Validate and correct if mismatch
  do $$
  declare v record; uid uuid;
  begin
    select id into uid from public.users where phone like '%01064144141%' limit 1;
    if uid is null then
      raise notice 'No user found with that phone';
      return;
    end if;

    select * into v from validate_user_points(uid) limit 1;
    if v is not null and v.is_valid = false then
      update public.users set loyalty_points = v.calculated_points where id = uid;
      perform add_loyalty_transaction(uid,'DEDUCTED',abs(v.difference), null, 'Points correction for mismatch (by phone)');
      raise notice 'Corrected points for % from % to %', uid, v.current_points, v.calculated_points;
    else
      raise notice 'User % points already valid', uid;
    end if;
  end $$;
commit;
