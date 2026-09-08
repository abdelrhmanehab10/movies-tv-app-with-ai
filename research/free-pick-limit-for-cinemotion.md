# Free pick limit for Cinemotion

Date checked: 2026-09-08

## Question

How should Cinemotion limit the free plan to three AI recommendation picks while keeping the homepage public and preventing users from bypassing the limit through client-side requests or concurrent requests?

## Project context

Cinemotion is a Next.js 15 App Router application using:

- Supabase Auth with `@supabase/ssr` and cookie-backed sessions.
- Supabase Postgres with `profiles`, `watchlist`, and `recommendations` tables.
- A server Route Handler at `/api/recommend` that calls Groq and TMDB.
- Optional recommendation-history inserts for authenticated users.

The current `recommendations` table is history. It should not be the quota source because history inserts are optional, can fail without failing the recommendation, and are not an atomic quota check.

## Recommendation

Use a server-enforced, authenticated lifetime quota of three free picks per user:

1. Keep `/` public.
2. Let anyone open the dialog, but require sign-in when they submit a recommendation.
3. Store quota state in a dedicated `recommendation_quotas` table.
4. Call one atomic Postgres function from `/api/recommend` before calling Groq or TMDB.
5. Return a stable error code such as `FREE_LIMIT_REACHED` when all three picks are used.
6. Show the remaining count in the dialog as a convenience only; the server remains authoritative.

This uses the authentication and database already in the project, keeps the public homepage intact, and leaves a clean path to paid plans or a monthly quota later.

Supabase database functions can be called through the API, and the JavaScript client exposes them through `supabase.rpc(...)`. Supabase also recommends granting function execution only to the roles that need it. See [Database Functions](https://supabase.com/docs/guides/database/functions) and [JavaScript `rpc`](https://supabase.com/docs/reference/javascript/rpc).

## Why not count history rows?

Counting rows in `recommendations` is easy to understand but is not a reliable quota primitive:

- The current route writes history only after Groq and TMDB succeed.
- The insert is deliberately non-blocking if history persistence fails.
- Two requests can check the same count at the same time unless the check and increment are performed in one database transaction.
- A future feature such as deleting history should not restore free-plan credits accidentally.

The quota should be a separate piece of state. History can still record every successful pick for product analytics and the user's history screen.

## Data model

Add a dedicated table. Keep the limit in the row so changing the policy later does not require rewriting the application shape:

```sql
create table public.recommendation_quotas (
  user_id uuid primary key references auth.users (id) on delete cascade,
  free_limit integer not null default 3 check (free_limit > 0),
  free_used integer not null default 0 check (free_used >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
```

The row can be created lazily the first time an authenticated user requests a pick, or created alongside the existing profile trigger. Lazy creation avoids a migration dependency on every existing profile and is sufficient for an MVP.

## Atomic enforcement

The route should not do a separate `select free_used` followed by an `update`. Instead, it should call a database function that:

1. Reads `auth.uid()`.
2. Creates the user's quota row if it does not exist.
3. Updates the row only when `free_used < free_limit`.
4. Returns `allowed` and `remaining` from the same update.

Conceptually:

```sql
update public.recommendation_quotas
set
  free_used = free_used + 1,
  updated_at = timezone('utc', now())
where user_id = auth.uid()
  and free_used < free_limit
returning true as allowed, free_limit - free_used as remaining;
```

The update itself locks the target row while it changes, so concurrent requests cannot all observe and consume the same remaining pick. PostgreSQL documents Read Committed as the default isolation level and explains that row updates coordinate concurrent changes. See [Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html).

For this project, use a `security invoker` function with RLS-backed policies where possible. If a `security definer` function becomes necessary, Supabase requires a pinned `search_path`, schema-qualified table names, and carefully restricted `EXECUTE` privileges. See [Supabase Database Functions](https://supabase.com/docs/guides/database/functions) and [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

The quota table should have RLS enabled with policies that allow an authenticated user to select, insert, and update only their own row. The quota function should be executable by `authenticated` and not by `anon`.

## Route behavior

Move the authenticated-user lookup to the start of `/api/recommend`, before any Groq or TMDB request:

```text
POST /api/recommend
  ├─ validate request body
  ├─ get authenticated Supabase user
  ├─ no user → 401 AUTH_REQUIRED
  ├─ claim one free pick atomically
  ├─ denied → 403 FREE_LIMIT_REACHED
  ├─ Groq title generation
  ├─ TMDB lookup
  ├─ provider failure → release the claimed pick or treat the attempt as consumed
  ├─ save history best-effort
  └─ return TMDB result plus remaining count
```

There is a product choice around provider failures:

- **Count accepted attempts:** simplest and abuse-resistant, but a temporary Groq/TMDB outage can use a pick.
- **Refund known provider failures:** add a second atomic `release_free_pick` function and call it for failures before a recommendation is returned. This is friendlier to users but needs careful error-path handling.

For the first release, refund clear upstream failures (`401`, `429`, network errors, and no TMDB result) and keep the database error path visible in logs. A crash between claiming and releasing may still consume one pick; this is an acceptable edge case for a small lifetime quota, but should be documented if the product promise is “three successful results.”

## Public homepage and anonymous users

The home page can remain public even if the recommendation submit action requires authentication. This is the recommended hard-enforcement policy because Supabase Auth gives the server a durable user identity and the existing SSR client already reads the session from cookies. Supabase's SSR guidance describes cookie-backed sessions for server-rendered applications; see [Supabase Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side) and [Creating a Supabase SSR Client](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

If the product must allow three picks before sign-in, use a signed, `HttpOnly` cookie as a soft guest quota and ask the user to sign in when it reaches zero. It is useful for UX but not a hard entitlement: users can clear cookies, switch browsers, or use another device. Next.js documents that cookies are client-side storage and that cookie changes must be made from a Route Handler or Server Function. See [Next.js `cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies).

Do not use localStorage, a React state counter, or an unsigned client-provided count for enforcement.

## UI behavior

The dialog should:

- Show `3 free picks left` or the current remaining count when the user is signed in.
- Keep the fun presets and `Surprise me` action unchanged; all paths submit through the same guarded API.
- On `AUTH_REQUIRED`, show a clear sign-in action.
- On `FREE_LIMIT_REACHED`, explain that the three free picks are used and provide the next product action (wait for reset, upgrade, or contact the team). Do not imply that refreshing will help.
- Disable the submit controls while the request is pending to reduce accidental duplicates, while relying on the server for actual protection.

The UI count is only a hint. A user may have another tab open, so every submit must still pass through the atomic server check.

## Alternative policies

| Policy | Fit now | Strength | Tradeoff |
| --- | --- | --- | --- |
| Three lifetime picks per authenticated user | **Recommended** | Simple, durable, easy to enforce with current Auth | Requires sign-in before the first pick |
| Three picks per month | Good later | Better free experience and recurring engagement | Needs a period boundary and reset logic |
| Three picks per anonymous browser | UX-only | No sign-in friction | Easily bypassed and not suitable as a paid entitlement |
| Count `recommendations` rows | Not recommended | Minimal schema work | Race conditions and history deletion/failure change quota behavior |
| Edge/IP rate limit only | Complementary | Helps protect Groq/TMDB from abuse | Not a user entitlement and shared IPs create false positives |

## Suggested implementation sequence

1. Add the quota table, RLS policies, and atomic claim function in a new Supabase migration.
2. Add the function to `lib/database.types.ts`.
3. Guard `/api/recommend` before upstream calls and return stable error codes.
4. Add a release/refund function if the product promise is based on successful results.
5. Return `remaining` on successful recommendations.
6. Update the modal's copy and error handling.
7. Test authenticated users at 0, 1, 2, and 3 picks, including two simultaneous requests, sign-out, and a failed upstream request.
8. Apply the migration to the hosted Supabase project and run the existing TypeScript/build checks.

## Decision

Implement **three lifetime free picks per authenticated user**, backed by a dedicated Supabase quota row and one atomic database function. Keep the homepage public, require sign-in at recommendation submit, and treat anonymous cookie limits only as an optional soft-UX layer—not as the real enforcement mechanism.
