revoke all on function public.claim_free_recommendation(uuid)
from public, anon, authenticated, service_role;

drop function public.claim_free_recommendation(uuid);

create function public.claim_free_recommendation()
returns table (allowed boolean, remaining integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.recommendation_quotas (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  return query
  update public.recommendation_quotas
  set
    free_used = free_used + 1,
    updated_at = timezone('utc', now())
  where user_id = current_user_id
    and free_used < free_limit
  returning true, free_limit - free_used;

  if not found then
    return query
    select false, greatest(free_limit - free_used, 0)
    from public.recommendation_quotas
    where user_id = current_user_id;
  end if;
end;
$$;

revoke all on function public.claim_free_recommendation()
from public, anon, authenticated;
grant execute on function public.claim_free_recommendation() to authenticated;
