begin;

create extension if not exists pgtap with schema extensions;
create extension if not exists dblink with schema extensions;

select plan(5);

create temporary table claim_results (
  allowed boolean not null,
  remaining integer not null
);

create temporary table run_state (
  authenticated_workers integer not null,
  waiting_workers integer not null
);

do $$
declare
  authenticated_workers integer := 0;
  -- pg_prove is not a superuser, so dblink must use password authentication.
  connection_string text := format(
    'host=host.docker.internal port=54322 dbname=%s user=postgres password=postgres',
    current_database()
  );
  session_role text;
  session_user_id uuid;
  test_user_id constant uuid := '8b3e8b76-1f9d-4c38-887b-86b5fca43d5d';
  waiting_workers integer := 0;
  worker integer;
  worker_name text;
begin
  perform extensions.dblink_connect(
    'quota_control',
    connection_string || ' application_name=quota_control'
  );
  perform extensions.dblink_exec(
    'quota_control',
    format('delete from auth.users where id = %L', test_user_id)
  );
  perform extensions.dblink_exec(
    'quota_control',
    format('insert into auth.users (id) values (%L)', test_user_id)
  );
  perform extensions.dblink_exec(
    'quota_control',
    format(
      'insert into public.recommendation_quotas (user_id) values (%L)',
      test_user_id
    )
  );

  perform extensions.dblink_exec('quota_control', 'begin');
  perform free_used
  from extensions.dblink(
    'quota_control',
    format(
      'select free_used from public.recommendation_quotas where user_id = %L for update',
      test_user_id
    )
  ) as quota_lock(free_used integer);

  for worker in 1..8 loop
    worker_name := 'quota_worker_' || worker;
    perform extensions.dblink_connect(
      worker_name,
      connection_string || ' application_name=' || worker_name
    );
    perform extensions.dblink_exec(
      worker_name,
      format(
        'set session "request.jwt.claims" = %L',
        json_build_object(
          'role', 'authenticated',
          'sub', test_user_id
        )::text
      )
    );
    perform extensions.dblink_exec(
      worker_name,
      'set session role authenticated'
    );

    select remote.role_name, remote.user_id
    into session_role, session_user_id
    from extensions.dblink(
      worker_name,
      'select current_user::text, auth.uid()'
    ) as remote(role_name text, user_id uuid);

    if session_role = 'authenticated' and session_user_id = test_user_id then
      authenticated_workers := authenticated_workers + 1;
    end if;

    perform extensions.dblink_send_query(
      worker_name,
      'select allowed, remaining from public.claim_free_recommendation()'
    );
  end loop;

  for attempt in 1..200 loop
    select count(*)::integer
    into waiting_workers
    from pg_catalog.pg_stat_activity
    where application_name like 'quota_worker_%'
      and wait_event_type = 'Lock';

    exit when waiting_workers = 8;
    perform pg_catalog.pg_sleep(0.025);
  end loop;

  insert into run_state values (authenticated_workers, waiting_workers);
  perform extensions.dblink_exec('quota_control', 'commit');

  for worker in 1..8 loop
    worker_name := 'quota_worker_' || worker;
    execute format(
      'insert into claim_results
       select allowed, remaining
       from extensions.dblink_get_result(%L)
         as claim(allowed boolean, remaining integer)',
      worker_name
    );
    perform extensions.dblink_disconnect(worker_name);
  end loop;
end;
$$;

select is(
  (select authenticated_workers from run_state),
  8,
  'all workers claim with the authenticated role and matching user ID'
);

select is(
  (select waiting_workers from run_state),
  8,
  'all claims overlap while waiting for the quota row lock'
);

select results_eq(
  $$
    select allowed, count(*)::bigint
    from claim_results
    group by allowed
    order by allowed
  $$,
  $$ values (false, 5::bigint), (true, 3::bigint) $$,
  'only three of eight concurrent claims are allowed'
);

select results_eq(
  $$
    select remaining
    from claim_results
    where allowed
    order by remaining desc
  $$,
  $$ values (2), (1), (0) $$,
  'allowed claims return each remaining quota value once'
);

select is(
  (
    select free_used
    from public.recommendation_quotas
    where user_id = '8b3e8b76-1f9d-4c38-887b-86b5fca43d5d'
  ),
  3,
  'the stored quota stops at the free limit'
);

select * from finish();

do $$
begin
  perform extensions.dblink_exec(
    'quota_control',
    $delete$delete from auth.users
      where id = '8b3e8b76-1f9d-4c38-887b-86b5fca43d5d'$delete$
  );
  perform extensions.dblink_disconnect('quota_control');
end;
$$;

rollback;
