create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, tmdb_id, media_type)
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mood text not null check (mood in ('happy', 'reflective', 'excited')),
  story text not null check (story in ('action', 'comedy', 'romance')),
  setting text not null check (setting in ('past', 'present', 'future')),
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  created_at timestamptz not null default timezone('utc', now())
);

create index watchlist_user_id_created_at_idx
  on public.watchlist (user_id, created_at desc);

create index recommendations_user_id_created_at_idx
  on public.recommendations (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), '')
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.watchlist enable row level security;
alter table public.recommendations enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can view their own watchlist"
on public.watchlist for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add to their own watchlist"
on public.watchlist for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can remove from their own watchlist"
on public.watchlist for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own recommendations"
on public.recommendations for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own recommendations"
on public.recommendations for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can remove their own recommendations"
on public.recommendations for delete
to authenticated
using ((select auth.uid()) = user_id);
