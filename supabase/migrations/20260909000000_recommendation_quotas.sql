create table public.recommendation_quotas (
  user_id uuid primary key references auth.users (id) on delete cascade,
  free_limit integer not null default 3 check (free_limit > 0),
  free_used integer not null default 0 check (
    free_used >= 0 and free_used <= free_limit
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.recommendation_quotas enable row level security;

create policy "Users can view their own recommendation quota"
on public.recommendation_quotas for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.recommendation_quotas from public, anon, authenticated;
grant select on table public.recommendation_quotas to authenticated;

create or replace function public.claim_free_recommendation(p_user_id uuid)
returns table (allowed boolean, remaining integer)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.recommendation_quotas (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  return query
  update public.recommendation_quotas
  set
    free_used = free_used + 1,
    updated_at = timezone('utc', now())
  where user_id = p_user_id
    and free_used < free_limit
  returning true, free_limit - free_used;

  if not found then
    return query
    select false, greatest(free_limit - free_used, 0)
    from public.recommendation_quotas
    where user_id = p_user_id;
  end if;
end;
$$;

create or replace function public.release_free_recommendation(p_user_id uuid)
returns integer
language sql
security invoker
set search_path = ''
as $$
  update public.recommendation_quotas
  set
    free_used = greatest(free_used - 1, 0),
    updated_at = timezone('utc', now())
  where user_id = p_user_id
  returning free_limit - free_used;
$$;

revoke all on function public.claim_free_recommendation(uuid) from public, anon, authenticated;
revoke all on function public.release_free_recommendation(uuid) from public, anon, authenticated;
grant execute on function public.claim_free_recommendation(uuid) to service_role;
grant execute on function public.release_free_recommendation(uuid) to service_role;
